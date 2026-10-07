from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from typing import List, Optional

from app.models.weather import WeatherObservationCreate, WeatherObservationResponse
from app.db.mongodb import get_database
from app.services.weather_service import weather_service

router = APIRouter()

@router.get("/live")
async def get_live_weather(lat: float = Query(26.1445), lng: float = Query(91.7362)):
    return await weather_service.get_weather(lat, lng)

@router.post("/log", response_model=WeatherObservationResponse)
async def log_weather_observation(obs: WeatherObservationCreate):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")
        
    doc = obs.model_dump()
    doc["created_at"] = datetime.utcnow()
    if not doc.get("timestamp"):
        doc["timestamp"] = doc["created_at"]
        
    result = await db.weather_data.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return WeatherObservationResponse(**doc)

@router.get("/history", response_model=List[WeatherObservationResponse])
async def get_weather_history(location_name: Optional[str] = None, limit: int = 20):
    db = get_database()
    if db is None:
        return []
        
    query = {}
    if location_name:
        query["location_name"] = location_name
        
    cursor = db.weather_data.find(query).sort("timestamp", -1).limit(limit)
    docs = await cursor.to_list(length=limit)
    for d in docs:
        d["id"] = str(d["_id"])
    return [WeatherObservationResponse(**d) for d in docs]
