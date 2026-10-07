from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime
from bson import ObjectId
from typing import List, Optional
import random

from app.models.shipment import ShipmentCreate, ShipmentResponse, ShipmentStatusUpdate, TelemetryUpdate
from app.db.mongodb import get_database
from app.api.deps import get_current_user, require_role
from app.services.route_service import route_service

router = APIRouter()

def doc_to_shipment_res(doc: dict) -> ShipmentResponse:
    return ShipmentResponse(
        id=str(doc["_id"]),
        tracking_number=doc.get("tracking_number", "NER-TRK-000"),
        cargo_type=doc.get("cargo_type", "General Supplies"),
        priority=doc.get("priority", "NORMAL"),
        weight_tonnes=doc.get("weight_tonnes", 2.5),
        origin=doc.get("origin"),
        destination=doc.get("destination"),
        status=doc.get("status", "SCHEDULED"),
        current_location=doc.get("current_location", {
            "name": doc.get("origin", {}).get("name", "Origin Depot"),
            "lat": doc.get("origin", {}).get("lat", 26.1445),
            "lng": doc.get("origin", {}).get("lng", 91.7362)
        }),
        assigned_driver_id=doc.get("assigned_driver_id"),
        assigned_driver_name=doc.get("assigned_driver_name", "Assigned Transport Corp"),
        risk_score=doc.get("risk_score", 0.15),
        risk_level=doc.get("risk_level", "LOW"),
        estimated_delay_mins=doc.get("estimated_delay_mins", 10),
        route_id=doc.get("route_id"),
        notes=doc.get("notes"),
        created_at=doc.get("created_at", datetime.utcnow()),
        updated_at=doc.get("updated_at", datetime.utcnow())
    )

@router.get("/", response_model=List[ShipmentResponse])
async def list_shipments(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority")
):
    db = get_database()
    if db is None:
        return []
        
    query = {}
    if status_filter:
        query["status"] = status_filter
    if priority_filter:
        query["priority"] = priority_filter
        
    cursor = db.shipments.find(query).sort("created_at", -1)
    docs = await cursor.to_list(length=100)
    return [doc_to_shipment_res(d) for d in docs]

@router.post("/", response_model=ShipmentResponse)
async def create_shipment(
    shipment_in: ShipmentCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")
        
    tracking_num = f"NER-{shipment_in.priority[:3]}-{random.randint(1000, 9999)}"
    
    # Calculate initial route & risk
    origin_coord = (shipment_in.origin.lat, shipment_in.origin.lng)
    dest_coord = (shipment_in.destination.lat, shipment_in.destination.lng)
    
    route_calc = await route_service.calculate_routes(origin_coord, dest_coord, shipment_in.weight_tonnes)
    std_route = route_calc["standard_route"]
    
    now = datetime.utcnow()
    shipment_doc = {
        "tracking_number": tracking_num,
        "cargo_type": shipment_in.cargo_type,
        "priority": shipment_in.priority,
        "weight_tonnes": shipment_in.weight_tonnes,
        "origin": shipment_in.origin.model_dump(),
        "destination": shipment_in.destination.model_dump(),
        "status": "SCHEDULED",
        "current_location": {
            "name": shipment_in.origin.name,
            "lat": shipment_in.origin.lat,
            "lng": shipment_in.origin.lng
        },
        "assigned_driver_id": current_user.get("id"),
        "assigned_driver_name": current_user.get("full_name", "NER Logistics Fleet"),
        "risk_score": std_route["overall_risk_score"],
        "risk_level": std_route["risk_level"],
        "estimated_delay_mins": std_route["delay_delta_mins"],
        "notes": shipment_in.notes,
        "created_at": now,
        "updated_at": now
    }
    
    result = await db.shipments.insert_one(shipment_doc)
    shipment_doc["_id"] = result.inserted_id
    
    # Persist calculated route linked to shipment
    route_doc = {
        "shipment_id": str(result.inserted_id),
        "standard_route": std_route,
        "safe_alternative_route": route_calc["safe_alternative_route"],
        "recommendation": route_calc["recommendation"],
        "active_selection": "SAFE_ALTERNATIVE" if std_route["overall_risk_score"] > 0.40 else "STANDARD",
        "created_at": now
    }
    await db.routes.insert_one(route_doc)
    
    return doc_to_shipment_res(shipment_doc)

@router.get("/{id}", response_model=ShipmentResponse)
async def get_shipment(id: str):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")
        
    try:
        doc = await db.shipments.find_one({"_id": ObjectId(id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid shipment ID format")
        
    if not doc:
        raise HTTPException(status_code=404, detail="Shipment not found")
        
    return doc_to_shipment_res(doc)

@router.patch("/{id}/status", response_model=ShipmentResponse)
async def update_shipment_status(id: str, status_update: ShipmentStatusUpdate):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")
        
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid shipment ID format")
        
    now = datetime.utcnow()
    result = await db.shipments.find_one_and_update(
        {"_id": oid},
        {"$set": {"status": status_update.status, "updated_at": now}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Shipment not found")
        
    return doc_to_shipment_res(result)

@router.post("/{id}/telemetry", response_model=ShipmentResponse)
async def update_shipment_telemetry(id: str, telemetry: TelemetryUpdate):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")
        
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid shipment ID format")
        
    now = datetime.utcnow()
    result = await db.shipments.find_one_and_update(
        {"_id": oid},
        {"$set": {
            "current_location": {
                "name": "Live GPS Position",
                "lat": telemetry.lat,
                "lng": telemetry.lng
            },
            "status": "IN_TRANSIT",
            "updated_at": now
        }},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Shipment not found")
        
    return doc_to_shipment_res(result)

@router.post("/{id}/reroute", response_model=ShipmentResponse)
async def reroute_shipment(id: str):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")
        
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid shipment ID format")
        
    shipment = await db.shipments.find_one({"_id": oid})
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
        
    # Recalculate route with safe alternative forced
    origin_coord = (shipment["origin"]["lat"], shipment["origin"]["lng"])
    dest_coord = (shipment["destination"]["lat"], shipment["destination"]["lng"])
    route_calc = await route_service.calculate_routes(origin_coord, dest_coord, shipment.get("weight_tonnes", 3.0))
    alt_route = route_calc["safe_alternative_route"]
    
    now = datetime.utcnow()
    result = await db.shipments.find_one_and_update(
        {"_id": oid},
        {"$set": {
            "status": "REROUTED",
            "risk_score": alt_route["overall_risk_score"],
            "risk_level": alt_route["risk_level"],
            "estimated_delay_mins": alt_route["delay_delta_mins"],
            "notes": "Rerouted to Safe Alternative bypassing active mountain hazard.",
            "updated_at": now
        }},
        return_document=True
    )
    
    return doc_to_shipment_res(result)
