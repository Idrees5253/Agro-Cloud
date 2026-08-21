# Agro-Cloud — SIH Prototype

Cloud-native agri-advisory & market linkage platform.

## Run it locally (two terminals)

**Terminal 1 — backend:**
```bash
cd server
npm install
npm start
```
Runs on http://localhost:5000. Visit http://localhost:5000/api/health to confirm it's up.

**Terminal 2 — frontend:**
```bash
npm install
npm run dev
```
Runs on http://localhost:5173. Open that in your browser.

> The frontend works fine even if you skip the backend — every page falls back to local mock data automatically. Run the backend to see live data: real (heuristic) leaf-image analysis, a live sensor-jitter feed, and persisted scan history.

## What's built
- **Frontend**: React + Vite + Tailwind + React Router + Recharts. Dashboard, Disease Detection, Advisory, Market Linkage — see previous README section below for details.
- **Backend**: Node + Express + lowdb (file-based JSON persistence, zero native-compile dependencies — chosen deliberately so it installs cleanly on any laptop with no build tools).
  - `POST /api/disease/scan` — accepts a leaf photo + crop name, runs real pixel-level color analysis (green vs. yellow/brown ratio) to classify healthy vs. stressed tissue and severity, returns a diagnosis + treatment plan, and persists it to scan history. This is a genuine heuristic pipeline, not a hardcoded random result — the same API contract a trained CNN (e.g. MobileNet fine-tuned on PlantVillage) would slot into for production.
  - `GET /api/disease/scans` — scan history
  - `GET /api/advisory/*` — field conditions (simulated live sensor feed), alerts, NPK levels, irrigation schedule, moisture trend
  - `GET /api/market/*` — mandi price trend, mandi comparison, matched buyers, harvest window
  - `GET/POST /api/farmers` — farmer profiles

## Stack
Frontend: React, Vite, Tailwind CSS, React Router, Recharts, lucide-react
Backend: Node.js, Express, lowdb, multer, jimp (image processing), cors

## Next steps if time remains
1. Swap the heuristic classifier for a real pretrained plant-disease model (TensorFlow.js or a hosted API)
2. Add a landing/login screen
3. Deploy: frontend to Vercel/Netlify, backend to Render/Railway (both have free tiers)
