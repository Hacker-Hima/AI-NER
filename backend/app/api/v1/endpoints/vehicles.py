from fastapi import APIRouter, HTTPException, status, Query
from datetime import datetime
from bson import ObjectId
from typing import List, Optional

from app.models.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse
from app.db.mongodb import get_database

router = APIRouter()

def doc_to_vehicle(doc: dict) -> VehicleResponse:
    loc = doc.get("current_location", {"name": "Depot", "lat": 26.1445, "lng": 91.7362})
    return VehicleResponse(
        id=str(doc["_id"]),
        registration_number=doc.get("registration_number", "AS-01-NER-0000"),
        vehicle_type=doc.get("vehicle_type", "Medium Cargo Truck (10T)"),
        capacity_tonnes=doc.get("capacity_tonnes", 10.0),
        fuel_type=doc.get("fuel_type", "Diesel"),
        driver_id=doc.get("driver_id"),
        status=doc.get("status", "AVAILABLE"),
        fuel_efficiency_kmpl=doc.get("fuel_efficiency_kmpl", 4.5),
        current_location=loc,
        last_maintenance_date=doc.get("last_maintenance_date"),
        next_maintenance_date=doc.get("next_maintenance_date"),
        created_at=doc.get("created_at", datetime.utcnow()),
        updated_at=doc.get("updated_at", datetime.utcnow())
    )

@router.get("/", response_model=List[VehicleResponse])
async def list_vehicles(
    status: Optional[str] = Query(None),
    vehicle_type: Optional[str] = Query(None)
):
    db = get_database()
    if db is None:
        return []
        
    query = {}
    if status:
        query["status"] = status
    if vehicle_type:
        query["vehicle_type"] = vehicle_type
        
    cursor = db.vehicles.find(query).sort("created_at", -1)
    docs = await cursor.to_list(length=100)
    return [doc_to_vehicle(d) for d in docs]

@router.post("/", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
async def create_vehicle(vehicle_in: VehicleCreate):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")
        
    existing = await db.vehicles.find_one({"registration_number": vehicle_in.registration_number})
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle with this registration number already exists")
        
    now = datetime.utcnow()
    vehicle_doc = vehicle_in.model_dump()
    vehicle_doc["created_at"] = now
    vehicle_doc["updated_at"] = now
    if not vehicle_doc.get("current_location"):
        vehicle_doc["current_location"] = {"name": "Guwahati Central Depot", "lat": 26.1445, "lng": 91.7362}
        
    result = await db.vehicles.insert_one(vehicle_doc)
    vehicle_doc["_id"] = result.inserted_id
    return doc_to_vehicle(vehicle_doc)

@router.get("/{id}", response_model=VehicleResponse)
async def get_vehicle(id: str):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")
        
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid vehicle ID format")
        
    doc = await db.vehicles.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    return doc_to_vehicle(doc)

@router.patch("/{id}", response_model=VehicleResponse)
async def update_vehicle(id: str, vehicle_update: VehicleUpdate):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")
        
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid vehicle ID format")
        
    update_data = {k: v for k, v in vehicle_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.vehicles.find_one_and_update(
        {"_id": oid},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    return doc_to_vehicle(result)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vehicle(id: str):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")
        
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid vehicle ID format")
        
    res = await db.vehicles.delete_one({"_id": oid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return None
