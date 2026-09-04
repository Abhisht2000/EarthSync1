# EARTHSYNC | Multi-Hazard Intelligence & Early Warning Platform

> **"SENSE THE EARTH. UNDERSTAND THE RISK. ACT BEFORE DISASTER."**
> 
> *Multi-Hazard Intelligence Prototype developed for the Smart India Hackathon (SIH)*

---

## 🌍 Executive Overview

**EARTHSYNC** is a next-generation environmental intelligence command center and early-warning operations platform. It continuously ingests physical telemetry streams from distributed sensor nodes (flood, wildfire, heatwave, landslide), applies explainable mathematical risk modeling, renders cinematic data visualizations, executes realistic scenario simulations (flood water surge, wildfire escalation, network failure), and triggers synthesized voice warnings.

Designed with an emergency operations mission-control aesthetic, EARTHSYNC prioritizes **speed-to-comprehension (under 10 seconds)**, **transparency (explainable reasoning without deceptive black-box claims)**, and **hardware readiness (seamless drop-in replacement for physical ESP32 nodes)**.

---

## ⚡ Key Features

1. **Mission Control Command Center (`/command-center`)**:
   - High-contrast dark operations theme with glassmorphic depth and projector-optimized typography.
   - Real-time KPIs: Active Sensor Nodes (12), Active Alerts, Monitored Basins (8), Telemetry Uptime SLA (99.8%).
   - Multi-Hazard Overview Cards (Flood, Wildfire, Heatwave, Landslide) with 1-click drill-down navigation.
   - Live sensor cards with continuous mini-sparklines (Water Level, Rainfall, Temperature, Humidity, Smoke, Wind).
   - Recharts telemetry stream with toggleable metric series, time labels, and alert reference thresholds.
   - Animated SVG radial risk gauge with glowing severity accents.

2. **Dedicated Flood Intelligence Room (`/flood`)**:
   - Dynamic rate-of-rise calculation: `(ΔWaterLevel / ΔTime)` in cm/min.
   - 4 synchronized live charts: Water Level, Dynamic Rate of Rise, Rainfall Status, Flood Risk Score.
   - Transparent Prototype Risk Assessment breakdown: Water Level (40%) + Rate of Rise (35%) + Rainfall (25%).

3. **Dedicated Wildfire Intelligence Room (`/wildfire`)**:
   - Multi-vector combustion correlation: Canopy Temperature, Relative Humidity, MQ-2 Smoke Anomaly, Wind Velocity.
   - 4 synchronized live charts: Temperature, Humidity, Smoke Particulates, Fire Risk Score.
   - Transparent Potential Wildfire Risk breakdown: Temperature (35%) + Humidity (25%) + Smoke Anomaly (40%).

4. **Interactive Geospatial Risk Map (`/risk-map`)**:
   - High-performance Leaflet map with Dark Matter tiles.
   - 12 simulated research sensor nodes with animated circular pulse beacons (Safe, Watch, High, Critical).
   - Interactive slide-out inspector drawer with live sensor payload, battery reserve, and link RSSI.

5. **Scenario Simulator (`/simulator`)**:
   - **NORMAL CONDITIONS**: Baseline equilibrium with natural micro-variations.
   - **START FLOOD**: Realistic hydrodynamic progression (30 → 40 → 50 → 60 → 70+ cm), tipping rain gauge activation, rate-of-rise surge, risk escalation into critical, and automated sirens.
   - **START WILDFIRE**: Thermal rise (27 → 34.6°C), canopy moisture drop (65 → 39%), smoke particulate spike (38 → 380 ppm), and wildfire warning.
   - **NETWORK FAILURE (Edge Mode)**: Simulates severed cloud connection (`🔴 OFFLINE`), engages autonomous local edge processing (`🟢 ACTIVE`), circular event buffering, and automatic synchronization upon link restoration.

6. **Synthesized Voice Alerts (Signature Feature)**:
   - Web Speech API integration (`SpeechSynthesisUtterance`).
   - Automated spoken alerts during high/critical threshold crossings.
   - **Debounce & Cooldown Logic**: 20-second suppression window per hazard category to prevent acoustic fatigue.
   - Voice configuration (speech rate, voice selector, test alert button).

7. **Multi-Sensor Correlation View**:
   - Demonstrates that single-sensor spikes do not trigger panic; multi-vector alignment is required.

8. **Sensor Fleet Diagnostics (`/sensor-network`)**:
   - Health diagnostics across all 12 nodes: Connection status, battery %, signal RSSI dBm, firmware version, and data staleness alerts.

---

## 🛠️ Architecture & Tech Stack

```
Frontend:
├── React 18 + TypeScript + Vite
├── Tailwind CSS (Command Center Palette)
├── Recharts (Responsive Time-Series Charts)
├── Lucide React (Operations Iconography)
├── Leaflet + CartoDB Dark Matter (Geospatial Grid)
└── Web Speech API (Voice Early Warning)

Backend & Ingest:
├── Node.js / Express (REST API)
├── ws (Real-Time WebSocket Server)
└── Arduino C++ (ESP32 Sample Firmware)
```

### Architecture Decoupling: `ISensorService`
The frontend does **not** hardcode mock data directly inside components. Instead, it accesses telemetry through the `ISensorService` abstraction:
- [`src/services/mockSensorService.ts`](file:///c:/Users/devan/OneDrive/Desktop/EarthSync/src/services/mockSensorService.ts): Generates continuous curves and scenario lifecycles.
- [`src/services/esp32SensorService.ts`](file:///c:/Users/devan/OneDrive/Desktop/EarthSync/src/services/esp32SensorService.ts): Connects to the live WebSocket server (`ws://localhost:5000/ws`) and ingests real ESP32 readings.

---

## 🚀 How to Run the Platform

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **npm**

### 2. Start the Backend Ingestion Server
Open a terminal in the project directory:
```bash
npm run server
```
*The server will start on port 5000 (`http://localhost:5000/api/health`).*

### 3. Start the Frontend Command Center
Open a second terminal:
```bash
npm run dev
```
*Open **`http://localhost:3000`** in your browser.*

---

## 📁 Key File Map

| Purpose | File Location |
| :--- | :--- |
| **Central State & Service Provider** | [`src/context/EarthSyncContext.tsx`](file:///c:/Users/devan/OneDrive/Desktop/EarthSync/src/context/EarthSyncContext.tsx) |
| **Explainable Risk Engine** | [`src/services/riskEngine.ts`](file:///c:/Users/devan/OneDrive/Desktop/EarthSync/src/services/riskEngine.ts) |
| **Realistic Mock & Scenario Engine** | [`src/services/mockSensorService.ts`](file:///c:/Users/devan/OneDrive/Desktop/EarthSync/src/services/mockSensorService.ts) |
| **Hardware ESP32 WebSocket Bridge** | [`src/services/esp32SensorService.ts`](file:///c:/Users/devan/OneDrive/Desktop/EarthSync/src/services/esp32SensorService.ts) |
| **Voice Synthesis & Debounce Service**| [`src/services/voiceAlertService.ts`](file:///c:/Users/devan/OneDrive/Desktop/EarthSync/src/services/voiceAlertService.ts) |
| **Custom SVG Vector Logo** | [`src/components/brand/EarthSyncLogo.tsx`](file:///c:/Users/devan/OneDrive/Desktop/EarthSync/src/components/brand/EarthSyncLogo.tsx) |
| **Cinematic Startup Splash** | [`src/components/brand/SplashScreen.tsx`](file:///c:/Users/devan/OneDrive/Desktop/EarthSync/src/components/brand/SplashScreen.tsx) |
| **Interactive Leaflet Map** | [`src/pages/RiskMap.tsx`](file:///c:/Users/devan/OneDrive/Desktop/EarthSync/src/pages/RiskMap.tsx) |
| **Express & WebSocket Backend** | [`server/index.js`](file:///c:/Users/devan/OneDrive/Desktop/EarthSync/server/index.js) |
| **ESP32 Arduino C++ Firmware** | [`server/esp32_sample.ino`](file:///c:/Users/devan/OneDrive/Desktop/EarthSync/server/esp32_sample.ino) |

---

## 🎯 Hackathon Demonstration Guide

### How to trigger Demo Mode:
1. Click the **DEMO** button on the top right navigation bar.
2. A floating scenario controller bar will appear at the bottom of the screen.
3. Click **FLOOD** to watch the water level climb, sparkline escalate, risk gauge cross 85%, critical alert trigger, and voice alert speak.
4. Click **WILDFIRE** to watch canopy temperature and smoke particulates climb, relative humidity plummet, and wildfire sirens trigger.
5. Click **EDGE OUTAGE** to demonstrate offline local buffering without data loss, followed by synchronization upon recovery.
6. Click **NORMAL** to smoothly restore the system to equilibrium.
