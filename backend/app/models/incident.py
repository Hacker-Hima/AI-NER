from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class IncidentCreate(BaseModel):
    title: str
    category: str  # "LANDSLIDE", "FLASH_FLOOD", "ROAD_DAMAGE", "SNOW_BLOCKAGE", "PROTEST"
    severity: str = "MODERATE"  # "MINOR", "MODERATE", "CRITICAL"
    lat: float
    lng: float
    landmark: str
    description: str

class IncidentResponse(BaseModel):
    id: str
    reported_by_id: Optional[str] = None
    reported_by_name: Optional[str] = "Anonymous Citizen"
    title: str
    category: str
    severity: str
    lat: float
    lng: float
    landmark: str
    description: str
    status: str = "ACTIVE"  # "ACTIVE", "VERIFIED", "RESOLVED"
    verification_count: int = 1
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
