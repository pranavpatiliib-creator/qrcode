# College Food Distribution Barcode Scanner

## 1) Top-Level Instructions
This project is a full-stack barcode scanner system for one-time food distribution verification.

Backend:
- Node.js + Express REST API
- MongoDB persistence
- Duplicate prevention through unique index on `studentId`
- Endpoint: `POST /api/scan`

Frontend:
- Mobile-friendly scanner page using `html5-qrcode`
- Camera scanning + manual input fallback
- Offline queue in `localStorage` + sync when online

---

## 2) Folder Structure
```text
.
|-- package.json
|-- .env.example
|-- src
|   |-- server.js
|   |-- config
|   |   |-- db.js
|   |   `-- env.js
|   |-- middleware
|   |   |-- errorHandlers.js
|   |   `-- validateScan.js
|   |-- models
|   |   `-- Scan.js
|   `-- routes
|       `-- scanRoutes.js
|-- public
|   `-- index.html
`-- README.md
```

---

## 3) Database Schema
Collection: `scans`

Fields:
- `studentId` (String, required, unique, indexed)
- `scannedAt` (Date, default now)
- `source` (String enum: `camera`, `manual`, `sync`)

Unique duplicate enforcement:
- Done by Mongoose schema `unique: true` + MongoDB unique index on `studentId`.
- Duplicate attempts trigger MongoDB error code `11000`, mapped to response: `already taken`.

---

## 4) API Contract
### POST `/api/scan`
Request JSON:
```json
{
  "id": "STU12345",
  "source": "camera"
}
```

Success responses:
- New ID:
```json
{
  "status": "success",
  "message": "allowed",
  "data": {
    "id": "STU12345",
    "scannedAt": "2026-02-16T00:00:00.000Z"
  }
}
```

- Existing ID:
```json
{
  "status": "success",
  "message": "already taken",
  "data": {
    "id": "STU12345"
  }
}
```

Validation errors return `400`; server errors return `500`.

---

## 5) Setup & Run
### Prerequisites
- Node.js 18+
- MongoDB local instance OR MongoDB Atlas URI

### Install
```bash
npm install
```

### Configure environment
```bash
cp .env.example .env
```
Edit `.env` and set:
- `MONGODB_URI`
- `PORT`
- `ALLOWED_ORIGINS` (frontend URL(s))

### Development
```bash
npm run dev
```
Open: `http://localhost:8080`

### Production
```bash
npm start
```

---

## 6) Cloud Deployment (Render / Railway / Heroku)

### Common settings
- Build command: `npm install`
- Start command: `npm start`
- Required environment variables:
  - `NODE_ENV=production`
  - `PORT` (provided automatically by most platforms)
  - `MONGODB_URI`
  - `ALLOWED_ORIGINS` (your deployed frontend domain)

### Render
1. Create a new Web Service from your repo.
2. Set environment variables above.
3. Deploy; Render will expose the app URL.

### Railway
1. Create project -> Deploy from GitHub.
2. Add variables in Railway dashboard.
3. Redeploy after setting `MONGODB_URI`.

### Heroku
1. Create app and connect repo.
2. Set config vars using dashboard or CLI.
3. Deploy main branch.

For all platforms, use MongoDB Atlas for managed cloud DB and IP/network access rules.

---

## 7) Offline Mode Fallback (Sample Design)
Current implementation in `public/index.html`:
- If offline or fetch fails, scanned IDs are queued in `localStorage` (`offline_scan_queue_v1`).
- On `online` event (or page load), queue is replayed to backend with `source: sync`.
- If backend returns duplicate, it is naturally resolved by server uniqueness and marked as already processed.

Production recommendation:
- Prefer IndexedDB over localStorage for larger queues and reliability.
- Add signed operator sessions and per-device metadata for audit trail.

---

## 8) Security Best Practices
- Use HTTPS only in production.
- Restrict CORS with exact trusted origins (`ALLOWED_ORIGINS`).
- Keep request body size small (`10kb` limit already set).
- Use `helmet` for secure HTTP headers.
- Validate all incoming IDs (format and length).
- Store secrets only in environment variables; never commit `.env`.
- Add authentication/authorization for operator access (recommended next step).
- Add rate limiting (`express-rate-limit`) for abuse prevention.

---

## 9) npm Scripts
- `npm run dev` -> start with nodemon
- `npm start` -> production start
- `npm test` -> placeholder
- `npm run lint` -> placeholder

---

## 10) Testing with Multiple Phones
1. Deploy backend publicly (Render/Railway/Heroku).
2. Ensure `ALLOWED_ORIGINS` includes the scanner webpage origin.
3. Open the scanner URL on 2+ phones.
4. Scan the same barcode on phone A, then phone B.
5. Expected behavior:
   - first scan -> `allowed`
   - second scan -> `already taken`
6. Disable internet on one phone, scan IDs, then reconnect.
7. Verify queued scans sync and duplicates are still blocked.

---

## 11) Quick Manual API Test
Use curl or Postman:

```bash
curl -X POST http://localhost:8080/api/scan \
  -H "Content-Type: application/json" \
  -d '{"id":"STU12345","source":"manual"}'
```

Repeat the same request; second call should return `already taken`.