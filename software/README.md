# Software Workspace Structure

This workspace is organized by responsibility:

- `backend/` → Go API + backend scripts
- `frontend/` → Web app (primary) + Capacitor packaging
- `database/` → PostgreSQL/TimescaleDB migrations and DB scripts

Legacy frontend code is archived at `frontend/legacy/mobile-expo/`.

## Best-Practice Notes

- Keep executable scripts in each domain's `scripts/` folder.
- Keep one main `README.md` per domain folder.
- Keep migrations versioned and append-only in `database/migrations/`.
- Keep compatibility wrappers at root only when needed for smooth transition.

## Architecture Notes

- [Three-Layer Dashboard Model](./docs/THREE_LAYER_DASHBOARD_MODEL.md)

## Recommended Day-to-Day Commands

### Backend

```powershell
cd backend
.\start-backend.ps1
```

### Frontend (Web)

```powershell
cd frontend\web
npm install
npm start
```

### Database Check

```powershell
cd database
.\check-db.ps1
```
