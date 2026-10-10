import os
import numpy as np
import pandas as pd

def generate_kaggle_synthetic_ner_dataset(n_samples=5000, output_path=None):
    """
    Generates a benchmark synthetic Kaggle-formatted dataset for 
    North Eastern Region (NER) Mountain Landslide Risk & Logistics Disruption.
    Modeled after Kaggle Landslide Susceptibility & Mountain Freight Telemetry datasets.
    """
    np.random.seed(42)
    
    states = [
        "Assam", "Arunachal Pradesh", "Meghalaya", "Nagaland", 
        "Manipur", "Mizoram", "Tripura", "Sikkim"
    ]
    state_weights = [0.25, 0.18, 0.15, 0.12, 0.10, 0.08, 0.06, 0.06]
    assigned_states = np.random.choice(states, size=n_samples, p=state_weights)
    
    # State-based coordinate boundaries
    coords = []
    for s in assigned_states:
        if s == "Assam":
            lat = np.random.uniform(25.8, 27.2)
            lng = np.random.uniform(90.5, 95.0)
        elif s == "Arunachal Pradesh":
            lat = np.random.uniform(26.9, 28.5)
            lng = np.random.uniform(91.5, 96.0)
        elif s == "Meghalaya":
            lat = np.random.uniform(25.1, 26.0)
            lng = np.random.uniform(90.2, 92.8)
        elif s == "Nagaland":
            lat = np.random.uniform(25.4, 26.8)
            lng = np.random.uniform(93.4, 94.9)
        elif s == "Manipur":
            lat = np.random.uniform(24.0, 25.4)
            lng = np.random.uniform(93.0, 94.6)
        elif s == "Mizoram":
            lat = np.random.uniform(22.8, 24.3)
            lng = np.random.uniform(92.3, 93.4)
        elif s == "Tripura":
            lat = np.random.uniform(23.2, 24.4)
            lng = np.random.uniform(91.1, 92.3)
        else: # Sikkim
            lat = np.random.uniform(27.1, 27.8)
            lng = np.random.uniform(88.1, 88.9)
        coords.append((round(lat, 4), round(lng, 4)))
        
    lats = [c[0] for c in coords]
    lngs = [c[1] for c in coords]
    
    # 1. 24h precipitation in mm (monsoonal exponential distribution)
    precip_24h = np.random.exponential(scale=38.0, size=n_samples)
    precip_24h = np.clip(precip_24h, 0.0, 320.0)
    
    # 2. 72h accumulated rainfall (leads to severe slope pore saturation)
    precip_72h = precip_24h * np.random.uniform(1.8, 3.4, size=n_samples) + np.random.exponential(scale=22.0, size=n_samples)
    precip_72h = np.clip(precip_72h, 0.0, 750.0)
    
    # 3. Elevation difference in meters
    elevation_change = np.random.uniform(80.0, 2800.0, size=n_samples)
    
    # 4. Slope gradient in degrees (Himalayas & Barail ranges are steep)
    slope_gradient = np.random.uniform(6.0, 46.0, size=n_samples)
    
    # 5. Geological vulnerability index (historical landslide frequency)
    vulnerability_index = np.random.beta(a=2.2, b=2.8, size=n_samples)
    
    # 6. Cargo truck weight in tonnes
    cargo_weight = np.random.uniform(2.0, 22.0, size=n_samples)
    
    # 7. Soil Types (Kaggle categorical feature)
    soil_types = ["Sedimentary Shale", "Weathered Gneiss", "Alluvial Sandy Silt", "Clayey Loam", "Rocky Phyllite"]
    soil_col = np.random.choice(soil_types, size=n_samples, p=[0.30, 0.25, 0.20, 0.15, 0.10])
    
    # 8. Historical Landslide Count in last 5 years
    historical_events = np.random.poisson(lam=vulnerability_index * 6.0, size=n_samples)
    
    # Ground-truth physics risk score calculation
    risk_factor = (
        (precip_24h / 150.0) * 0.35 +
        (precip_72h / 350.0) * 0.25 +
        (slope_gradient / 40.0) * 0.20 +
        vulnerability_index * 0.20
    )
    risk_factor += np.random.normal(0, 0.04, size=n_samples)
    risk_factor = np.clip(risk_factor, 0.0, 1.25)
    
    # Target 1: Disruption Class (0: Safe/Low, 1: Moderate, 2: Critical)
    disruption_class = np.zeros(n_samples, dtype=int)
    disruption_class[risk_factor > 0.38] = 1
    disruption_class[risk_factor > 0.72] = 2
    
    # Target 2: Delay in Minutes (for regression)
    delay_mins = (
        (risk_factor * 190.0) +
        (cargo_weight * 3.6) +
        (elevation_change / 100.0 * 2.2) +
        np.random.normal(12.0, 8.0, size=n_samples)
    )
    delay_mins = np.clip(delay_mins, 8.0, 520.0)
    
    df = pd.DataFrame({
        "sample_id": [f"KAG-NER-{i+1:05d}" for i in range(n_samples)],
        "state": assigned_states,
        "latitude": lats,
        "longitude": lngs,
        "soil_type": soil_col,
        "precipitation_24h_mm": np.round(precip_24h, 2),
        "precipitation_72h_accumulated_mm": np.round(precip_72h, 2),
        "elevation_change_m": np.round(elevation_change, 1),
        "slope_gradient": np.round(slope_gradient, 1),
        "road_vulnerability_index": np.round(vulnerability_index, 3),
        "cargo_weight_tonnes": np.round(cargo_weight, 1),
        "historical_landslide_events": historical_events,
        "disruption_risk_score": np.round(risk_factor, 3),
        "disruption_class": disruption_class,
        "delay_minutes": np.round(delay_mins, 1)
    })
    
    if output_path is None:
        output_path = os.path.join(os.path.dirname(__file__), "kaggle_ner_landslide_logistics_synthetic.csv")
        
    df.to_csv(output_path, index=False)
    print(f"Generated {n_samples} Kaggle-format synthetic logistics records -> {output_path}")
    return df

if __name__ == "__main__":
    generate_kaggle_synthetic_ner_dataset()
