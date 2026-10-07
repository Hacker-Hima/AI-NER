from fastapi import APIRouter, HTTPException, status, Query
from datetime import datetime
from bson import ObjectId
from typing import List, Optional

from app.models.alert import AlertCreate, AlertResponse
from app.db.mongodb import get_database

router = APIRouter()

def doc_to_alert(doc: dict) -> AlertResponse:
    return AlertResponse(
        id=str(doc["_id"]),
        alert_type=doc.get("alert_type", "ROUTE_RISK"),
        severity=doc.get("severity", "MEDIUM"),
        title=doc.get("title", "Logistics Alert"),
        message=doc.get("message", ""),
        related_vehicle_id=doc.get("related_vehicle_id"),
        related_shipment_id=doc.get("related_shipment_id"),
        related_route_id=doc.get("related_route_id"),
        read=doc.get("read", False),
        resolved=doc.get("resolved", False),
        created_at=doc.get("created_at", datetime.utcnow()),
        resolved_at=doc.get("resolved_at")
    )

@router.get("/", response_model=List[AlertResponse])
async def list_alerts(
    severity: Optional[str] = Query(None),
    read: Optional[bool] = Query(None),
    resolved: Optional[bool] = Query(None)
):
    db = get_database()
    if db is None:
        return []
        
    query = {}
    if severity:
        query["severity"] = severity
    if read is not None:
        query["read"] = read
    if resolved is not None:
        query["resolved"] = resolved
        
    cursor = db.alerts.find(query).sort("created_at", -1)
    docs = await cursor.to_list(length=100)
    return [doc_to_alert(d) for d in docs]

@router.post("/", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def create_alert(alert_in: AlertCreate):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")
        
    doc = alert_in.model_dump()
    doc["read"] = False
    doc["resolved"] = False
    doc["created_at"] = datetime.utcnow()
    doc["resolved_at"] = None
    
    result = await db.alerts.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc_to_alert(doc)

@router.patch("/{id}/read", response_model=AlertResponse)
async def mark_alert_read(id: str):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")
        
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid alert ID format")
        
    res = await db.alerts.find_one_and_update(
        {"_id": oid},
        {"$set": {"read": True}},
        return_document=True
    )
    if not res:
        raise HTTPException(status_code=404, detail="Alert not found")
    return doc_to_alert(res)

@router.patch("/{id}/resolve", response_model=AlertResponse)
async def resolve_alert(id: str):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")
        
    try:
        oid = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid alert ID format")
        
    now = datetime.utcnow()
    res = await db.alerts.find_one_and_update(
        {"_id": oid},
        {"$set": {"resolved": True, "read": True, "resolved_at": now}},
        return_document=True
    )
    if not res:
        raise HTTPException(status_code=404, detail="Alert not found")
    return doc_to_alert(res)
