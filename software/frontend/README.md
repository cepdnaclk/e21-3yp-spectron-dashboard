# Frontend (Web + Capacitor)

Primary development flow is web-first in `web`, then package to native app using Capacitor.

## Prerequisites

- Node.js 18+ (`node -v`)
- npm (`npm -v`)
- Backend API running from `software/backend`

---

## Web Development (`frontend/web`)

### Setup

```powershell
cd web
npm install
```

Create `.env` file in `frontend/web`:

```env
REACT_APP_API_URL=http://localhost:8081
```

### Run (development)

```powershell
npm start
```

### Build

```powershell
npm run build
```

### Capacitor commands (optional)

```powershell
npm run cap:sync
npm run cap:add:android
```

## Notes

- Start backend first, then web app.
- If backend runs on a different port, update `REACT_APP_API_URL`.
- Use Capacitor after web UI is ready to produce the installable app.
