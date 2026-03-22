# WorkZen

Work with intention. Focus without friction.

WorkZen is a productivity system that connects task planning, distraction-free focus sessions, and real session data so you do not just have tasks, you actually complete focused work on them.

## What It Does

| Layer | What it solves |
| --- | --- |
| Tasks | Organize and prioritize what needs doing |
| Focus Mode | Enter a distraction-free timed work session |
| Session Logging | Record what actually happened, not just what was planned |
| Insights | Understand your own focus behavior over time |

## Current Status

Runnable and publishable as a single full-stack app.

- [x] Frontend task management and focus UI
- [x] Session logging flow
- [x] Backend API for auth, tasks, and sessions
- [x] Production static serving through the backend
- [x] Local file-backed persistence for quick deployment
- [ ] Cloud database swap for multi-user persistence

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express
- JSON file store for lightweight local and pilot deployments

## How It Runs

- In development, run the frontend and backend separately.
- In production, build the frontend and start the backend.
- The backend will serve the compiled frontend from `frontend/dist`.
- App data is stored in `backend/data/database.json` at runtime.

## Getting Started

### Install

```bash
npm --prefix frontend install
npm --prefix backend install
```

### Development

```bash
npm run dev:backend
npm run dev:frontend
```

### Production Build And Run

```bash
npm run build
npm start
```

## Project Docs

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- [docs/DATA_MODEL.md](./docs/DATA_MODEL.md)
- [docs/ROADMAP.md](./docs/ROADMAP.md)
- [docs/PROJECT_SNAPSHOT.md](./docs/PROJECT_SNAPSHOT.md)

## Deployment Notes

- `npm run build` creates the frontend bundle in `frontend/dist`.
- `npm start` launches the backend, serves the frontend, and exposes the API on `PORT`.
- Set `CLIENT_URL` for local CORS development if you use a custom frontend origin.
- Set `DATA_FILE` if you want the JSON datastore in a different location.

## Chrome Side Panel Extension

- Local side panel preview: `npm --prefix frontend run dev`
- Open the preview at `http://localhost:5173`
- Build the extension bundle: `build-workzen-extension.bat`
- Load `frontend/dist` as an unpacked extension in `chrome://extensions` or `edge://extensions`
- Clicking the extension action opens WorkZen in the browser side panel

WorkZen is not another to-do list. It is the layer between planning and doing.
