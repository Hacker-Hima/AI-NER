from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class LocationPoint(BaseModel):
    name: str
    lat: float
    lng: float

class TelemetryUpdate(BaseModel):
    lat: float
    lng: float
    timestamp: Optional[datetime] = None

class ShipmentCreate(BaseModel):
    cargo_type: str  # e.g., "Critical Medicines", "Emergency Food Rations", "Fuel Supplies", "General Freight"
    priority: str = "HIGH"  # "CRITICAL", "HIGH", "NORMAL"
    weight_tonnes: float = 2.5
    origin: LocationPoint
    destination: LocationPoint
    notes: Optional[str] = None
    assigned_driver_id: Optional[str] = None

class ShipmentResponse(BaseModel):
    id: str
    tracking_number: str
    cargo_type: str
    priority: str
    weight_tonnes: float
    origin: LocationPoint
    destination: LocationPoint
    status: str  # "SCHEDULED", "IN_TRANSIT", "DELAYED", "REROUTED", "DELIVERED", "HELD_UP"
    current_location: Dict[str, Any]
    assigned_driver_id: Optional[str] = None
    assigned_driver_name: Optional[str] = None
    risk_score: float = 0.0
    risk_level: str = "LOW"  # "LOW", "MODERATE", "HIGH"
    estimated_delay_mins: int = 0
    route_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ShipmentStatusUpdate(BaseModel):
    status: str
