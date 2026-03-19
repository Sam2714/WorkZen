# WorkZen Architecture

## Overview

WorkZen is organized as two applications in one repository:

- `frontend/` contains the React and Vite client
- `backend/` contains the Node and Express API

## Frontend Responsibilities

- task planning UI
- focus mode and timer experiences
- local state and browser persistence during early development
- analytics and insight presentation

## Backend Responsibilities

- task CRUD endpoints
- focus session logging endpoints
- authentication and user scoping
- long-term persistence for tasks and sessions

## Data Flow

1. The frontend reads and writes tasks through `frontend/src/services/`.
2. During the early phase, services can use local storage.
3. In the next phase, the same services will call the backend API.
4. The backend persists tasks and focus sessions in the database.

## Open Decisions

- database choice: MongoDB or PostgreSQL
- authentication rollout timing
- production hosting setup for frontend and backend
