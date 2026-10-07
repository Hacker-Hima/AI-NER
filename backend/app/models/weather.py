from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class WeatherObservationCreate(BaseModel):
    location_name: str
    latitude: float
    longitude: float
    temperature_c: float
    humidity_percent: Optional[float] = 78.0
    precipitation_24h_mm: float
    wind_speed_kmh: float
    weather_condition: Optional[str] = "Overcast Rain"
    visibility_km: Optional[float] = 6.5
    timestamp: Optional[datetime] = None

class WeatherObservationResponse(WeatherObservationCreate):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
