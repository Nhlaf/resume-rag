# Resume RAG

A full-stack resume search application. The TypeScript/Express API ingests PDF resumes, extracts candidate information, creates embeddings, and stores records in MongoDB. The React frontend provides a chat-style interface for keyword, vector, and hybrid candidate search.

## Features

- Upload and ingest resumes from PDF files.
- Extract and parse resume text into candidate details and skills.
- Generate resume and search-query embeddings with Mistral.
- Search resumes with MongoDB Atlas Search (BM25) and Atlas Vector Search.
- Merge and rank hybrid search results, with optional Groq-powered parsing and re-ranking.
- Check API, database, and retrieval readiness.

## Project layout

```text
src/             Express + TypeScript backend
tests/           Backend Jest tests
recruitbot-web/  React + TypeScript + Vite frontend
uploads/         Temporary resume uploads (not tracked by Git)
```

## Requirements

- Node.js 20 or newer and npm.
- A MongoDB deployment. Atlas is required for the configured Atlas Search and Vector Search pipelines.
- A Mistral API key for embedding generation.
- A Groq API key if using the LLM parser or re-ranking.

Create the required Atlas indexes on the `resumes` collection:

- Atlas Search index: `resume_search_index`
- Atlas Vector Search index: `vector_index`, using the `embedding` field and the configured embedding dimension (1024 by default).

## Setup

### Backend

From the repository root:

```bash
npm ci
```

Copy `.env.example` to `.env` and set your MongoDB URI and Mistral API key. Configure a Groq API key if you enable LLM features.

Start the API:

```bash
npm run dev
```

The backend listens on `http://localhost:3000` by default.

### Frontend

In a second terminal:

```bash
cd recruitbot-web
npm ci
```

Create `recruitbot-web/.env.development` with the backend URL:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=RecruitBot
```

Start the frontend:

```bash
npm run dev
```

Vite prints the local frontend URL (normally `http://localhost:5173`). The local environment files are ignored by Git.

## API overview

All API routes use the `/v1` prefix.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/v1/health` | Check API health |
| `GET` | `/v1/health/db` | Check MongoDB connectivity |
| `GET` | `/v1/resume/health` | Check ingestion module health |
| `POST` | `/v1/resume/ingest` | Upload, parse, embed, and store a PDF resume (`file` form field) |
| `GET` | `/v1/search/readiness` | Check retrieval prerequisites |
| `POST` | `/v1/search` | Run end-to-end candidate search |
| `POST` | `/v1/search/bm25` | Run lexical search |
| `POST` | `/v1/search/vector` | Run semantic search |
| `POST` | `/v1/search/hybrid` | Run hybrid lexical and semantic search |

Example search request:

```bash
curl -X POST http://localhost:3000/v1/search \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"senior backend engineer with MongoDB experience\"}"
```

Ingested resumes and query embeddings must use the same embedding model and dimension. Retrieval readiness also depends on having resume data available in MongoDB.

## Development

Run backend tests and build the backend:

```bash
npm test
npm run build
```

Build the frontend from `recruitbot-web/`:

```bash
npm run build
```

See [FRONTEND_WEB_INSTRUCTIONS.md](./FRONTEND_WEB_INSTRUCTIONS.md) and the phase-wise implementation guides in the repository for additional design and implementation details.
