from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AlertBase(BaseModel):
    alert_type: str  # ROUTE_RISK, INCIDENT_AHEAD, VEHICLE_DELAY, MAINTENANCE_DUE, WEATHER_WARNING
    severity: str = "MEDIUM"  # LOW, MEDIUM, HIGH, CRITICAL
    title: str
    message: str
    related_vehicle_id: Optional[str] = None
    related_shipment_id: Optional[str] = None
    related_route_id: Optional[str] = None

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    id: str
    read: bool = False
    resolved: bool = False
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
