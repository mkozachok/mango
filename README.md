# Black Honey — Reputation Dashboard (MVP)

## Prereqs
- Node.js (LTS recommended)
- MongoDB (local or remote)

## Setup
1. Copy env:
   - `backend/.env.example` → `backend/.env`
2. Install deps from repo root:
   - `npm install`

## Run (dev)
- Backend:
  - `npm run dev:backend`
- Frontend:
  - `npm run dev:frontend`

## Import Google Maps reviews (Apify)
1. Set `APIFY_API_KEY` and `MONGODB_URI` in `backend/.env`.
2. Run import for one or more Google Maps URLs:
   - `npm run import:reviews --workspace backend -- "https://www.google.com/maps/place/..." "https://www.google.com/maps/place/..."`
   - Or set `GOOGLE_MAPS_URLS` (newline-separated) in `backend/.env` and run `npm run import:reviews --workspace backend`

## Backend models
- `backend/src/models/Location.ts`
- `backend/src/models/Review.ts`

