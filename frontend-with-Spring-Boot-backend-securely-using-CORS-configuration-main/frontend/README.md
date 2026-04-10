# Demo Frontend

React + Vite frontend for the Spring Boot backend in this workspace.

## Features

- JWT login/register with auto token refresh on `401`
- Role-aware UI (admin vs user)
- Protected dashboard route
- Product management with all/my toggle
- Admin-only user management

## Backend expectation

- Backend running on `http://localhost:8082`
- Endpoints under `/api/user/*` and `/api/product/*`

If your backend is on a different URL, set `VITE_API_BASE_URL`.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Environment (optional)

Create `.env` in this folder:

```bash
VITE_API_BASE_URL=http://localhost:8082
```


