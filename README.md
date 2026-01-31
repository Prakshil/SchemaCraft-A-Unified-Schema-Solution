# SchemaCraft

> **Describe your app. Get a production-ready database.**

An AI-powered database schema generator that converts natural language into normalized, production-ready database schemas.

## Features

- **Natural Language Input** — Describe your application in plain English
- **Instant Schema Generation** — Get normalized tables, relationships, and indexes
- **Multiple Export Formats** — PostgreSQL, MySQL, Prisma, Drizzle, JSON
- **Visual Schema Browser** — Expandable table cards with column details
- **AI Recommendations** — Suggestions for improvements and optimizations

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Groq API Key (free at [console.groq.com](https://console.groq.com))

### Setup

```bash
# Clone
git clone https://github.com/yourusername/schemacraft.git
cd schemacraft

# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your GROQ_API_KEY to .env

# Frontend
cd ../frontend
npm install
```

### Run

```bash
# Terminal 1 — Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, Tailwind CSS, Framer Motion, Monaco Editor |
| Backend | FastAPI, Pydantic |
| AI | Groq (Llama 3.3 70B) |

## API

```
POST /api/generate
Body: { "description": "...", "complexity": "simple|standard|enterprise" }

POST /api/export
Body: { "schema": {...}, "format": "postgresql|mysql|prisma|drizzle" }

GET /api/examples
```

## Project Structure

```
schemacraft/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── system_prompt.py
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── services/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   └── package.json
└── README.md
```

## License

MIT
