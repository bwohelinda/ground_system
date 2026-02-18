# Ground System Monorepo

This repository groups several related projects into an npm workspace:

- `backend` — Express + MySQL API server
-- `frontend/app` — Consolidated React frontend containing Booking, Admin and Registration pages

Quick commands:

- Install all workspaces: `npm run install-all`
- Start backend: `npm run start:backend`
 - Start frontend (all pages): `npm run start:frontend`

Notes:

 - Run `npm install` from the repo root to install workspace deps.
 - Then run `npm run start:frontend` to start the consolidated frontend on port 3000.
- For running multiple dev servers concurrently, consider installing `concurrently` or running terminals per workspace.
