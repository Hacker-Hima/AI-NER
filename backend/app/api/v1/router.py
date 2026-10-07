from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, 
    vehicles, 
    shipments, 
    routes, 
    incidents, 
    alerts, 
    gps, 
    weather, 
    predictions, 
    analytics
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["1. Authentication & Users"])
api_router.include_router(vehicles.router, prefix="/vehicles", tags=["2. Fleet & Vehicle Management"])
api_router.include_router(shipments.router, prefix="/shipments", tags=["3. Essential Supply Shipments"])
api_router.include_router(routes.router, prefix="/routes", tags=["4. GIS Routing & Safe Alternatives"])
api_router.include_router(incidents.router, prefix="/incidents", tags=["5. Road Hazards & Disruption Reports"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["6. Logistics Alerts"])
api_router.include_router(gps.router, prefix="/gps", tags=["7. GPS Tracking & Telemetry"])
api_router.include_router(weather.router, prefix="/weather", tags=["8. Weather Intelligence"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["9. AI Risk Predictions"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["10. Regional Accessibility Analytics"])
