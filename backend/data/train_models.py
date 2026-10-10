import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib

def generate_synthetic_ner_dataset(n_samples=2500):
    np.random.seed(42)
    
    # 1. 24h precipitation in mm (NER can receive extreme monsoonal spells: Cherrapunji/Mawsynram)
    precip_24h = np.random.exponential(scale=35.0, size=n_samples)
    precip_24h = np.clip(precip_24h, 0, 300)
    
    # 2. 72h accumulated precipitation (causes slope saturation)
    precip_72h = precip_24h * np.random.uniform(1.8, 3.2, size=n_samples) + np.random.exponential(scale=20.0, size=n_samples)
    precip_72h = np.clip(precip_72h, 0, 700)
    
    # 3. Elevation change in meters across mountain passes (e.g. Sela Pass, Barail range)
    elevation_change = np.random.uniform(100, 2600, size=n_samples)
    
    # 4. Slope gradient in degrees (steep terrain in Arunachal, Nagaland, Sikkim)
    slope_gradient = np.random.uniform(5, 45, size=n_samples)
    
    # 5. Geological vulnerability index (historical landslide frequency along corridor)
    vulnerability_index = np.random.beta(a=2, b=3, size=n_samples) # skewed towards 0.2 - 0.7
    
    # 6. Cargo truck weight in tonnes (heavier trucks suffer greater braking & torque delays)
    cargo_weight = np.random.uniform(1.5, 20.0, size=n_samples)
    
    # Calculate physics-grounded risk score
    # High rainfall + steep slope + high geological vulnerability = severe landslide probability
    risk_factor = (
        (precip_24h / 150.0) * 0.35 +
        (precip_72h / 350.0) * 0.25 +
        (slope_gradient / 40.0) * 0.20 +
        vulnerability_index * 0.20
    )
    
    # Add minor noise
    risk_factor += np.random.normal(0, 0.05, size=n_samples)
    risk_factor = np.clip(risk_factor, 0, 1.2)
    
    # Classification Target: 0 (Low), 1 (Moderate), 2 (Critical / Road Closed)
    disruption_class = np.zeros(n_samples, dtype=int)
    disruption_class[risk_factor > 0.40] = 1
    disruption_class[risk_factor > 0.75] = 2
    
    # Regression Target: Expected Delay in Minutes
    # Base mountain transit delay + steepness penalty + weather friction + weight
    delay_mins = (
        (risk_factor * 180) +
        (cargo_weight * 3.5) +
        (elevation_change / 100.0 * 2.0) +
        np.random.normal(15, 10, size=n_samples)
    )
    delay_mins = np.clip(delay_mins, 5, 540) # 5 mins to 9 hours max delay
    
    df = pd.DataFrame({
        "precipitation_24h_mm": precip_24h,
        "precipitation_72h_accumulated_mm": precip_72h,
        "elevation_change_m": elevation_change,
        "slope_gradient": slope_gradient,
        "road_vulnerability_index": vulnerability_index,
        "cargo_weight_tonnes": cargo_weight,
        "disruption_class": disruption_class,
        "delay_minutes": delay_mins
    })
    
    return df

def train_and_save_models():
    csv_path = os.path.join(os.path.dirname(__file__), "kaggle_ner_landslide_logistics_synthetic.csv")
    if not os.path.exists(csv_path):
        from data.generate_kaggle_dataset import generate_kaggle_synthetic_ner_dataset
        df = generate_kaggle_synthetic_ner_dataset(n_samples=5000, output_path=csv_path)
    else:
        print(f"Loading Kaggle synthetic dataset from {csv_path}...")
        df = pd.read_csv(csv_path)
    
    features = [
        "precipitation_24h_mm",
        "precipitation_72h_accumulated_mm",
        "elevation_change_m",
        "slope_gradient",
        "road_vulnerability_index",
        "cargo_weight_tonnes"
    ]
    
    X = df[features]
    y_class = df["disruption_class"]
    y_delay = df["delay_minutes"]
    
    X_train, X_test, y_class_train, y_class_test, y_delay_train, y_delay_test = train_test_split(
        X, y_class, y_delay, test_size=0.2, random_state=42
    )
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Disruption Classifier
    print("Training Random Forest Disruption Classifier on Kaggle data...")
    clf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    clf.fit(X_train_scaled, y_class_train)
    acc = clf.score(X_test_scaled, y_class_test)
    print(f"Classifier Test Accuracy: {acc * 100:.2f}%")
    
    # Train Delay Regressor
    print("Training Random Forest Delay Regressor on Kaggle data...")
    reg = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    reg.fit(X_train_scaled, y_delay_train)
    r2 = reg.score(X_test_scaled, y_delay_test)
    print(f"Regressor R2 Score: {r2:.4f}")
    
    # Target directory
    artifact_dir = os.path.join(os.path.dirname(__file__), "..", "app", "ml", "artifacts")
    os.makedirs(artifact_dir, exist_ok=True)
    
    clf_path = os.path.join(artifact_dir, "landslide_risk_model.joblib")
    reg_path = os.path.join(artifact_dir, "delay_regressor.joblib")
    scaler_path = os.path.join(artifact_dir, "scaler.joblib")
    
    joblib.dump(clf, clf_path)
    joblib.dump(reg, reg_path)
    joblib.dump(scaler, scaler_path)
    
    print(f"Model artifacts successfully written to:\n - {clf_path}\n - {reg_path}\n - {scaler_path}")

if __name__ == "__main__":
    train_and_save_models()
