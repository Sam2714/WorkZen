# WorkZen — Deployment Guide

## Step 1 — MongoDB Atlas (Database)

1. Go to **https://cloud.mongodb.com** → Create free account
2. Create a **free M0 cluster** (takes ~2 min)
3. Click **Connect** → **Drivers** → copy the connection string
4. Replace `<username>` and `<password>` with your DB user credentials
5. Save this string — you need it for backend env vars

---

## Step 2 — Backend on Railway

1. Go to **https://railway.app** → Login with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select `Sam2714/WorkZen` → set **Root Directory** to `backend`
4. Add these **Environment Variables** in Railway dashboard:

```
PORT              = 4000
NODE_ENV          = production
MONGODB_URI       = mongodb+srv://...your Atlas URI...
JWT_SECRET        = ...your 64-char random string...
JWT_EXPIRES_IN    = 7d
CLIENT_URL        = https://your-vercel-url.vercel.app
```

5. Railway auto-deploys. Copy your **public domain** (e.g. `workzen-api.up.railway.app`)

### Generate JWT_SECRET
Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Step 3 — Frontend on Vercel

1. Go to **https://vercel.com** → Login with GitHub
2. Click **Add New Project** → Import `Sam2714/WorkZen`
3. Set **Root Directory** to `frontend`
4. Add **Environment Variable**:

```
VITE_API_BASE_URL = https://workzen-api.up.railway.app/api
```

5. Click **Deploy** — Vercel builds and gives you a live URL

---

## Step 4 — Update CORS on Railway

After Vercel gives you a URL (e.g. `https://workzen-abc.vercel.app`):

1. Go back to Railway → your backend service → Variables
2. Update `CLIENT_URL` to your Vercel URL
3. Railway auto-redeploys

---

## Step 5 — Verify Everything Works

Test these URLs in your browser or Postman:

```
GET  https://workzen-api.up.railway.app/api/health
→ { "status": "ok" }

POST https://workzen-api.up.railway.app/api/auth/register
Body: { "name": "Sam", "email": "sam@test.com", "password": "test123" }
→ { "success": true, "data": { "user": {...}, "token": "..." } }
```

---

## Local Development

### Backend
```bash
cd backend
cp .env.example .env
# Fill in your MONGODB_URI and JWT_SECRET
npm install
npm run dev
# Running on http://localhost:4000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

---

## Project URLs (fill in after deployment)

| Service  | URL |
|---|---|
| Frontend | `https://_____.vercel.app` |
| Backend  | `https://_____.up.railway.app` |
| Database | MongoDB Atlas cluster |
