# Internship Management System (IMS)

This project is now organized into two folders: `frontend` for React and `backend` for Node/Express + MongoDB.

## Setup

### Backend
1. `cd backend`
2. copy `.env.example` to `.env` and configure `MONGO_URI` and `JWT_SECRET`.
3. `npm install`
4. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Folder structure

- `backend/`: Express API, Mongoose models
- `frontend/`: Vite + React SPA

## Notes
- Auth context now calls backend endpoints instead of Firebase.
- DB context now calls backend endpoints for internships, applications, certificates.
- Existing UI routing remains unchanged.
