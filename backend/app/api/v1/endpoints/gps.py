from fastapi import APIRouter, HTTPException, status, Query
from datetime import datetime
from bson import ObjectId
from typing import List, Optional

from app.models.gps import GPSTrackingCreate, GPSTrackingResponse
from app.db.mongodb import get_database

router = APIRouter()

def doc_to_gps(doc: dict) -> GPSTrackingResponse:
    return GPSTrackingResponse(
        id=str(doc["_id"]),
        vehicle_id=doc.get("vehicle_id", ""),
        shipment_id=doc.get("shipment_id"),
        latitude=doc.get("latitude", 26.1445),
        longitude=doc.get("longitude", 91.7362),
        speed_kmh=doc.get("speed_kmh", 40.0),
        heading_deg=doc.get("heading_deg", 90.0),
        timestamp=doc.get("timestamp", datetime.utcnow())
    )

@router.post("/", response_model=GPSTrackingResponse, status_code=status.HTTP_201_CREATED)
async def record_gps_telemetry(telemetry: GPSTrackingCreate):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")
        
    doc = telemetry.model_dump()
    if not doc.get("timestamp"):
        doc["timestamp"] = datetime.utcnow()
        
    result = await db.gps_tracking.insert_one(doc)
    doc["_id"] = result.inserted_id
    
    # Also update current_location on vehicle document
    try:
        await db.vehicles.update_one(
            {"registration_number": telemetry.vehicle_id},
            {"$set": {
                "current_location": {
                    "name": "Live GPS Position",
                    "lat": telemetry.latitude,
                    "lng": telemetry.longitude
                },
                "updated_at": datetime.utcnow()
            }}
        )
    except Exception:
        pass
        
    return doc_to_gps(doc)

@router.get("/history/{vehicle_id}", response_model=List[GPSTrackingResponse])
async def get_gps_history(vehicle_id: str, limit: int = 50):
    db = get_database()
    if db is None:
        return []
        
    cursor = db.gps_tracking.find({"vehicle_id": vehicle_id}).sort("timestamp", -1).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [doc_to_gps(d) for d in docs]
