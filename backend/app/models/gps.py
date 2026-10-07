from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class GPSTrackingCreate(BaseModel):
    vehicle_id: str
    shipment_id: Optional[str] = None
    latitude: float
    longitude: float
    speed_kmh: Optional[float] = 42.0
    heading_deg: Optional[float] = 90.0
    timestamp: Optional[datetime] = None

class GPSTrackingResponse(BaseModel):
    id: str
    vehicle_id: str
    shipment_id: Optional[str] = None
    latitude: float
    longitude: float
    speed_kmh: float
    heading_deg: float
    timestamp: datetime

    class Config:
        from_attributes = True
