# Project NER: AI-Based Smart Logistics & Accessibility Intelligence Platform for North Eastern Region

> **Educational Prototype Notice:** Inspired by the Smart India Hackathon (SIH) problem statement. Built as a college prototype demonstrating AI-driven terrain risk prediction, dynamic alternative routing, and logistics monitoring.

---

## 🚀 Live Local URLs (Currently Running)

- **Frontend Web Application:** [http://localhost:5173/](http://localhost:5173/)
- **FastAPI Interactive Docs (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Check:** [http://localhost:8000/](http://localhost:8000/)

---

## 🛠 Manual Execution Instructions (Step-by-Step)

If you ever restart your machine or open new terminals, follow these steps to run both services:

### 1. Prerequisites Check
Ensure the local MongoDB service is running:
```powershell
sc.exe query MongoDB
```
*(If stopped, start it with `net start MongoDB` as Administrator).*

---

### 2. Start Backend (Terminal 1)

Open a terminal in the project root:
```powershell
cd "d:\practice programm\AI\NER\backend"
```

Activate the Python virtual environment and run Uvicorn:
```powershell
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
```
> The backend will automatically load the pre-trained Scikit-learn Random Forest model from memory and connect to MongoDB.

---

### 3. Start Frontend (Terminal 2)

Open a second terminal:
```powershell
cd "d:\practice programm\AI\NER\frontend"
```

Start the Vite development server:
```powershell
npm run dev
```

Then open your browser and navigate to:
**[http://localhost:5173](http://localhost:5173)**

---

## 👥 Demo Personas & Test Credentials

The top navigation bar includes an instant **1-Click Role Switcher** (`Coordinator`, `Driver`, `Admin`, `Observer`). You can also log in manually:

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Logistics Coordinator** | `coordinator@ner.gov.in` | `coord123` | Dispatch supply convoys, reroute high-risk shipments. |
| **Field Driver** | `driver@ner.gov.in` | `driver123` | Simulated GPS tracking, report route obstructions. |
| **System Admin** | `admin@ner.gov.in` | `admin123` | Full access, resolve incidents, override risk states. |
| **Regional Observer** | `observer@ner.gov.in` | `obs123` | View public hazard maps, verify crowdsourced reports. |

---

## 🗺 Interactive Demonstration Guide for Project Evaluation

1. **Regional Command Center (`/`):**
   - Inspect the live Leaflet map showing moving truck markers and road hazard warning triangles.
   - Observe the **Corridor Risk Monitor** displaying real-time weather and AI landslide risk for NH-29, NH-6, NH-13, NH-10, NH-27, and NH-102.
2. **Supply Shipments & GPS Simulation (`/shipments`):**
   - Click on any active convoy (e.g. `NER-MED-8401` carrying Critical Vaccines).
   - Click the **"Simulate GPS"** button to watch the truck move step-by-step along the mountain route with live coordinate updates.
   - For shipments with `CRITICAL` risk, click **"Reroute"** to divert them to a safe bypass.
3. **Route Intelligence (`/routes`):**
   - Select preset mountain transit corridors (e.g. Guwahati ➔ Tawang or Silchar ➔ Imphal).
   - Compare the **Standard Highway** (high landslide probability) with the **Recommended Safe Alternative** (solid green bypass).
   - View the waypoint-by-waypoint slope gradient, 24h rainfall, and AI risk breakdown.
4. **Disruption Board (`/incidents`):**
   - View reported landslides and road washouts.
   - Click **"Report Road Disruption"** and click anywhere on the Leaflet map to pick coordinates and report an obstacle.
5. **AI Prediction Sandbox (`/analytics`):**
   - Adjust sliders for 24h rainfall, 72h soil saturation, slope gradient, and cargo weight.
   - Click **"Run ML Inference"** to see live Random Forest model prediction outputs.

---

## 📂 Re-seeding Data or Re-training Models (Optional)

- To re-train the Random Forest models:
  ```powershell
  cd "d:\practice programm\AI\NER\backend"
  .\venv\Scripts\python.exe data\train_models.py
  ```
- To reset and seed demo consignments & users in MongoDB:
  ```powershell
  cd "d:\practice programm\AI\NER\backend"
  .\venv\Scripts\python.exe data\seed_data.py
  ```
