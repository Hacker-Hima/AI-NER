from datetime import datetime, timezone
from pymongo import MongoClient
import bcrypt

def get_hash(pwd: str) -> str:
    return bcrypt.hashpw(pwd.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed_database():
    client = MongoClient("mongodb://localhost:27017")
    db = client["ner_logistics_db"]
    
    print("Clearing all 9 collections in ner_logistics_db...")
    db.users.delete_many({})
    db.vehicles.delete_many({})
    db.shipments.delete_many({})
    db.routes.delete_many({})
    db.incidents.delete_many({})
    db.alerts.delete_many({})
    db.gps_tracking.delete_many({})
    db.weather_data.delete_many({})
    db.risk_predictions.delete_many({})
    
    now = datetime.now(timezone.utc)
    
    # 1. Users
    print("1. Seeding test users across 4 SIH roles...")
    users = [
        {
            "full_name": "Tenzing Norbu",
            "email": "admin@ner.gov.in",
            "hashed_password": get_hash("admin123"),
            "role": "admin",
            "phone": "+919436012345",
            "region": "Arunachal Pradesh",
            "created_at": now
        },
        {
            "full_name": "Ananya Sharma",
            "email": "coordinator@ner.gov.in",
            "hashed_password": get_hash("coord123"),
            "role": "logistics_coordinator",
            "phone": "+919435098765",
            "region": "Assam",
            "created_at": now
        },
        {
            "full_name": "Rajesh Jamatia",
            "email": "driver@ner.gov.in",
            "hashed_password": get_hash("driver123"),
            "role": "field_driver",
            "phone": "+919862011223",
            "region": "Tripura",
            "created_at": now
        },
        {
            "full_name": "Lalthan Pachuau",
            "email": "observer@ner.gov.in",
            "hashed_password": get_hash("obs123"),
            "role": "regional_observer",
            "phone": "+919863044556",
            "region": "Mizoram",
            "created_at": now
        }
    ]
    user_results = db.users.insert_many(users)
    driver_id = str(user_results.inserted_ids[2])

    # 2. Vehicles
    print("2. Seeding fleet vehicles...")
    vehicles = [
        {
            "registration_number": "AS-01-HC-4821",
            "vehicle_type": "Tata 407 4x4 Hill Terrain Truck",
            "capacity_tonnes": 4.5,
            "fuel_type": "Diesel",
            "driver_id": driver_id,
            "status": "IN_TRANSIT",
            "fuel_efficiency_kmpl": 7.2,
            "current_location": {
                "name": "NH-13 Bhalukpong Gate",
                "lat": 27.0125,
                "lng": 92.6512
            },
            "last_maintenance_date": now,
            "next_maintenance_date": now,
            "created_at": now,
            "updated_at": now
        },
        {
            "registration_number": "AS-11-BC-9014",
            "vehicle_type": "Ashok Leyland 1618 Heavy Hauler",
            "capacity_tonnes": 12.0,
            "fuel_type": "Diesel",
            "driver_id": driver_id,
            "status": "IN_TRANSIT",
            "fuel_efficiency_kmpl": 4.1,
            "current_location": {
                "name": "NH-37 Jiribam Crossing",
                "lat": 24.8012,
                "lng": 93.1250
            },
            "last_maintenance_date": now,
            "next_maintenance_date": now,
            "created_at": now,
            "updated_at": now
        },
        {
            "registration_number": "NL-07-A-3329",
            "vehicle_type": "BharatBenz 2823C Petroleum Tanker",
            "capacity_tonnes": 16.0,
            "fuel_type": "Diesel",
            "driver_id": None,
            "status": "AVAILABLE",
            "fuel_efficiency_kmpl": 3.8,
            "current_location": {
                "name": "Numaligarh Refinery Depot",
                "lat": 26.6025,
                "lng": 93.7541
            },
            "last_maintenance_date": now,
            "next_maintenance_date": now,
            "created_at": now,
            "updated_at": now
        },
        {
            "registration_number": "ML-05-D-7718",
            "vehicle_type": "Mahindra Bolero Hill Maxi-Truck",
            "capacity_tonnes": 2.5,
            "fuel_type": "Diesel",
            "driver_id": None,
            "status": "MAINTENANCE",
            "fuel_efficiency_kmpl": 9.5,
            "current_location": {
                "name": "Shillong PWD Central Workshop",
                "lat": 25.5788,
                "lng": 91.8933
            },
            "last_maintenance_date": now,
            "next_maintenance_date": now,
            "created_at": now,
            "updated_at": now
        }
    ]
    veh_results = db.vehicles.insert_many(vehicles)
    veh_id_1 = str(veh_results.inserted_ids[0])

    # 3. Road Incidents & Hazards
    print("3. Seeding road incidents & landslides...")
    incidents = [
        {
            "title": "Severe Landslide near Sela Pass",
            "category": "LANDSLIDE",
            "severity": "CRITICAL",
            "location": {
                "type": "Point",
                "coordinates": [92.0984, 27.5042]
            },
            "landmark": "NH-13 Km 84, near Sela Lake",
            "description": "Heavy debris and mudflow completely blocking both carriage lanes. BRO dozers deployed.",
            "reported_by_name": "BRO Border Patrol Unit 4",
            "status": "VERIFIED",
            "verification_count": 9,
            "created_at": now,
            "resolved_at": None
        },
        {
            "title": "Flash Flood & Mud Runoff on NH-6",
            "category": "FLASH_FLOOD",
            "severity": "CRITICAL",
            "location": {
                "type": "Point",
                "coordinates": [92.3541, 25.1852]
            },
            "landmark": "East Jaintia Hills, Sonapur Tunnel Approach",
            "description": "Culvert overflow with 1.5ft water depth. Light motor vehicles stranded.",
            "reported_by_name": "Shillong Transit Authority",
            "status": "VERIFIED",
            "verification_count": 6,
            "created_at": now,
            "resolved_at": None
        },
        {
            "title": "Subsidence and Rockfall on NH-29",
            "category": "ROAD_DAMAGE",
            "severity": "MODERATE",
            "location": {
                "type": "Point",
                "coordinates": [93.8421, 25.7142]
            },
            "landmark": "Old Chumukedima Pagla Pahar stretch",
            "description": "Pavement fractured due to slope instability. Single lane crawling traffic.",
            "reported_by_name": "Nagaland Police Traffic Cell",
            "status": "ACTIVE",
            "verification_count": 3,
            "created_at": now,
            "resolved_at": None
        }
    ]
    db.incidents.insert_many(incidents)

    # 4. Supply Shipments
    print("4. Seeding essential supply consignments...")
    shipments = [
        {
            "tracking_number": "NER-MED-8401",
            "cargo_type": "Critical Vaccines & ICU Meds",
            "priority": "CRITICAL",
            "weight_tonnes": 3.2,
            "origin": {
                "name": "Guwahati Central Medical Depot",
                "lat": 26.1445,
                "lng": 91.7362
            },
            "destination": {
                "name": "Tawang District Hospital",
                "lat": 27.5861,
                "lng": 91.8594
            },
            "status": "IN_TRANSIT",
            "current_location": {
                "name": "En-route near Bhalukpong",
                "lat": 27.0125,
                "lng": 92.6512
            },
            "assigned_driver_id": driver_id,
            "assigned_driver_name": "Rajesh Jamatia",
            "risk_score": 0.74,
            "risk_level": "CRITICAL",
            "estimated_delay_mins": 140,
            "notes": "Alert: Active Landslide reported near Sela pass ahead. Rerouting recommended.",
            "created_at": now,
            "updated_at": now
        },
        {
            "tracking_number": "NER-RAT-4219",
            "cargo_type": "Emergency Rice & Pulse Rations",
            "priority": "HIGH",
            "weight_tonnes": 8.5,
            "origin": {
                "name": "Silchar FCI Granary",
                "lat": 24.8333,
                "lng": 92.7789
            },
            "destination": {
                "name": "Imphal Relief Logistics Hub",
                "lat": 24.8170,
                "lng": 93.9368
            },
            "status": "IN_TRANSIT",
            "current_location": {
                "name": "NH-37 Jiribam Crossing",
                "lat": 24.8012,
                "lng": 93.1250
            },
            "assigned_driver_id": driver_id,
            "assigned_driver_name": "Rajesh Jamatia",
            "risk_score": 0.32,
            "risk_level": "MODERATE",
            "estimated_delay_mins": 35,
            "notes": "Intermittent light drizzle. Transit stable.",
            "created_at": now,
            "updated_at": now
        },
        {
            "tracking_number": "NER-FUL-1092",
            "cargo_type": "Aviation & Diesel Fuel Tanker",
            "priority": "HIGH",
            "weight_tonnes": 14.0,
            "origin": {
                "name": "Numaligarh Refinery Depot",
                "lat": 26.6025,
                "lng": 93.7541
            },
            "destination": {
                "name": "Dimapur Supply Node",
                "lat": 25.9062,
                "lng": 93.7271
            },
            "status": "SCHEDULED",
            "current_location": {
                "name": "Numaligarh Depot Bay 3",
                "lat": 26.6025,
                "lng": 93.7541
            },
            "assigned_driver_id": None,
            "assigned_driver_name": "Pending Dispatcher Assignment",
            "risk_score": 0.18,
            "risk_level": "LOW",
            "estimated_delay_mins": 10,
            "notes": "Vehicle scheduled for dawn departure.",
            "created_at": now,
            "updated_at": now
        }
    ]
    ship_results = db.shipments.insert_many(shipments)
    ship_id_1 = str(ship_results.inserted_ids[0])

    # 5. Alerts
    print("5. Seeding logistics alerts...")
    alerts = [
        {
            "alert_type": "INCIDENT_AHEAD",
            "severity": "CRITICAL",
            "title": "Severe Landslide Ahead of Shipment NER-MED-8401",
            "message": "Landslide blocking NH-13 near Sela Pass within 35 km of vehicle AS-01-HC-4821. Safe alternative bypass recommended.",
            "related_vehicle_id": "AS-01-HC-4821",
            "related_shipment_id": ship_id_1,
            "read": False,
            "resolved": False,
            "created_at": now,
            "resolved_at": None
        },
        {
            "alert_type": "WEATHER_WARNING",
            "severity": "HIGH",
            "title": "Heavy Precipitation Alert: Meghalaya Escarpment",
            "message": "Open-Meteo recorded >85mm cumulative precipitation along NH-6. Watch for flash flood runoffs.",
            "related_vehicle_id": None,
            "related_shipment_id": None,
            "read": True,
            "resolved": False,
            "created_at": now,
            "resolved_at": None
        }
    ]
    db.alerts.insert_many(alerts)

    # 6. GPS Breadcrumbs
    print("6. Seeding GPS tracking points...")
    gps_points = [
        {
            "vehicle_id": "AS-01-HC-4821",
            "shipment_id": ship_id_1,
            "latitude": 27.0125,
            "longitude": 92.6512,
            "speed_kmh": 36.5,
            "heading_deg": 315.0,
            "timestamp": now
        },
        {
            "vehicle_id": "AS-11-BC-9014",
            "shipment_id": None,
            "latitude": 24.8012,
            "longitude": 93.1250,
            "speed_kmh": 44.0,
            "heading_deg": 85.0,
            "timestamp": now
        }
    ]
    db.gps_tracking.insert_many(gps_points)

    print("All 9 collections populated successfully!")

if __name__ == "__main__":
    seed_database()
