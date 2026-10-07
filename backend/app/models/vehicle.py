from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class VehicleLocation(BaseModel):
    name: Optional[str] = "Depot"
    lat: float
    lng: float

class VehicleBase(BaseModel):
    registration_number: str
    vehicle_type: str = "Medium Cargo Truck (10T)"
    capacity_tonnes: float = 10.0
    fuel_type: str = "Diesel"
    driver_id: Optional[str] = None
    status: str = "AVAILABLE"  # AVAILABLE, ASSIGNED, IN_TRANSIT, MAINTENANCE, OFFLINE
    fuel_efficiency_kmpl: Optional[float] = 4.5
    last_maintenance_date: Optional[datetime] = None
    next_maintenance_date: Optional[datetime] = None

class VehicleCreate(VehicleBase):
    current_location: Optional[VehicleLocation] = None

class VehicleUpdate(BaseModel):
    registration_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    capacity_tonnes: Optional[float] = None
    status: Optional[str] = None
    driver_id: Optional[str] = None
    current_location: Optional[VehicleLocation] = None
    last_maintenance_date: Optional[datetime] = None
    next_maintenance_date: Optional[datetime] = None

class VehicleResponse(VehicleBase):
    id: str
    current_location: VehicleLocation
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
