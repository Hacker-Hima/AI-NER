from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId
from typing import List, Optional

from app.models.incident import IncidentCreate, IncidentResponse
from app.db.mongodb import get_database
from app.api.deps import get_current_user

router = APIRouter()

def doc_to_incident_res(doc: dict) -> IncidentResponse:
    loc = doc.get("location", {})
    coords = loc.get("coordinates", [91.7362, 26.1445]) # [lng, lat]
    return IncidentResponse(
        id=str(doc["_id"]),
        reported_by_id=doc.get("reported_by_id"),
        reported_by_name=doc.get("reported_by_name", "Local Transporter"),
        title=doc.get("title", "Road Disruption"),
        category=doc.get("category", "LANDSLIDE"),
        severity=doc.get("severity", "MODERATE"),
        lat=coords[1],
        lng=coords[0],
        landmark=doc.get("landmark", "Highway Pass"),
        description=doc.get("description", ""),
        status=doc.get("status", "ACTIVE"),
        verification_count=doc.get("verification_count", 1),
        created_at=doc.get("created_at", datetime.utcnow()),
        resolved_at=doc.get("resolved_at")
    )

@router.get("/", response_model=List[IncidentResponse])
async def list_incidents(status: Optional[str] = None):
    db = get_database()
    if db is None:
        return []
        
    query = {}
    if status:
        query["status"] = status
        
    cursor = db.incidents.find(query).sort("created_at", -1)
    docs = await cursor.to_list(length=100)
    return [doc_to_incident_res(d) for d in docs]

@router.post("/", response_model=IncidentResponse)
async def report_incident(
    incident_in: IncidentCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")
        
    now = datetime.utcnow()
    incident_doc = {
        "title": incident_in.title,
        "category": incident_in.category,
        "severity": incident_in.severity,
        "location": {
            "type": "Point",
            "coordinates": [incident_in.lng, incident_in.lat] # GeoJSON format: [lng, lat]
        },
        "landmark": incident_in.landmark,
        "description": incident_in.description,
        "reported_by_id": current_user.get("id"),
        "reported_by_name": current_user.get("full_name", "NER Observer"),
        "status": "ACTIVE",
        "verification_count": 1,
        "created_at": now,
        "resolved_at": None
    }
    
    result = await db.incidents.insert_one(incident_doc)
    incident_doc["_id"] = result.inserted_id
    
    return doc_to_incident_res(incident_doc)

@router.patch("/{id}/verify", response_model=IncidentResponse)
async def verify_incident(id: str):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")
        
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid incident ID format")
        
    result = await db.incidents.find_one_and_update(
        {"_id": oid},
        {"$inc": {"verification_count": 1}, "$set": {"status": "VERIFIED"}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    return doc_to_incident_res(result)

@router.patch("/{id}/resolve", response_model=IncidentResponse)
async def resolve_incident(id: str):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")
        
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid incident ID format")
        
    now = datetime.utcnow()
    result = await db.incidents.find_one_and_update(
        {"_id": oid},
        {"$set": {"status": "RESOLVED", "resolved_at": now}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    return doc_to_incident_res(result)
