# SchemaCraft

Production-ready database schema generation from plain-English app descriptions.

You describe the product. SchemaCraft returns a normalized schema (tables, columns, relationships, indexes) and export formats—so you can spend less time debating foreign keys and more time shipping.

---

## What you get

- **Schema generation**: tables, columns, constraints, relationships, indexes
- **Export formats**: PostgreSQL, MySQL, Prisma, Drizzle
- **Strict JSON output**: predictable and easy to consume
- **Deployable stack**: FastAPI backend + Next.js frontend

---

## Tech stack

**Backend**
- Python + FastAPI
- LLM provider via env vars: Groq or OpenAI

**Frontend**
- Next.js + React + TypeScript
- Tailwind CSS
- shadcn-style component structure (`src/components/ui`)

---

## Repo structure

```text
.
├─ backend/
│  ├─ app/
│  │  ├─ main.py
│  │  ├─ config.py
│  │  ├─ routes/
│  │  └─ services/
│  └─ requirements.txt
└─ frontend/
	 ├─ src/
	 ├─ package.json
	 └─ next.config.ts
```

---

## Local development

### Backend (FastAPI)

```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Helpful URLs:
- Health: `http://127.0.0.1:8000/api/health`
- Docs: `http://127.0.0.1:8000/docs`

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

---

## Environment variables

### Backend

Pick **one** provider (yes, one):

**Groq**
- `LLM_PROVIDER=groq`
- `GROQ_API_KEY=...`

**OpenAI**
- `LLM_PROVIDER=openai`
- `OPENAI_API_KEY=...`

**CORS** (recommended JSON list):
- `CORS_ORIGINS=["http://localhost:3000"]`

### Frontend

- `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000` (local)
- `NEXT_PUBLIC_API_URL=https://<your-backend-service>.onrender.com` (production)

---

## Deploy on Render

SchemaCraft deploys cleanly on Render as **two Web Services**.

### 1) Backend (Render → Web Service)

- **Root Directory:** `backend`
- **Build Command:**
	```bash
	pip install -r requirements.txt
	```
- **Start Command:**
	```bash
	uvicorn app.main:app --host 0.0.0.0 --port $PORT
	```
- **Environment Variables:**
	- `LLM_PROVIDER` and the matching API key
	- `CORS_ORIGINS` (see below)

### 2) Frontend (Render → Web Service)

- **Root Directory:** `frontend`
- **Build Command:**
	```bash
	npm ci && npm run build
	```
- **Start Command:**
	```bash
	npm run start
	```
- **Environment Variables:**
	- `NEXT_PUBLIC_API_URL=https://<your-backend-service>.onrender.com`

---

## Production CORS (already deployed frontend)

Frontend URL:
- `https://schemacraf-31.onrender.com`

Set this on the **backend** Render service:

```bash
CORS_ORIGINS=["https://schemacraf-31.onrender.com"]
```

Note (because browsers are pedantic): **Origins don’t include trailing slashes**.

---

## Troubleshooting

### CORS blocked in browser
- Backend is missing the frontend origin in `CORS_ORIGINS`
- Use JSON list format:
	- `CORS_ORIGINS=["https://schemacraf-31.onrender.com"]`

### Frontend can’t reach backend
- `NEXT_PUBLIC_API_URL` is missing/wrong
- Backend is down/sleeping (Render free tier likes naps)

### Health says LLM isn’t configured
- You didn’t set `GROQ_API_KEY` or `OPENAI_API_KEY`
- Or `LLM_PROVIDER` doesn’t match the key you set

---

# Made with Love by Prakshil Patell

