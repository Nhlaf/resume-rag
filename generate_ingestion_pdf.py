from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Preformatted

output_path = "Ingestion_Pipeline_Overview.pdf"

doc = SimpleDocTemplate(
    output_path,
    pagesize=letter,
    rightMargin=0.65 * inch,
    leftMargin=0.65 * inch,
    topMargin=0.6 * inch,
    bottomMargin=0.6 * inch,
)

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="TitleCenter",
    parent=styles["Title"],
    alignment=TA_CENTER,
    fontSize=20,
    leading=25,
    spaceAfter=14,
))
styles.add(ParagraphStyle(
    name="SubtitleCenter",
    parent=styles["Normal"],
    alignment=TA_CENTER,
    fontSize=10,
    textColor="#555555",
    spaceAfter=18,
))
styles.add(ParagraphStyle(
    name="PhaseHeading",
    parent=styles["Heading2"],
    fontSize=14,
    leading=18,
    spaceBefore=10,
    spaceAfter=6,
    textColor="#17365D",
))
styles.add(ParagraphStyle(
    name="Small",
    parent=styles["Normal"],
    fontSize=9,
    leading=12,
))

story = []
story.append(Paragraph("Resume RAG Ingestion Pipeline", styles["TitleCenter"]))
story.append(Paragraph("Architecture overview and phase-by-phase code guide", styles["SubtitleCenter"]))
story.append(Paragraph("Application: resume-rag-backend", styles["Heading2"]))
story.append(Paragraph("Workspace: resume_rag", styles["Normal"]))
story.append(Spacer(1, 12))
story.append(Paragraph("Pipeline Flow", styles["Heading2"]))
story.append(Preformatted(
    "PDF upload\n"
    "  -> PDF validation\n"
    "  -> PDF text extraction\n"
    "  -> Text cleaning\n"
    "  -> Regex and skills detection\n"
    "  -> Structured resume parsing\n"
    "  -> Optional LLM parsing\n"
    "  -> Mistral embedding generation\n"
    "  -> MongoDB storage\n"
    "  -> Structured response and logs",
    styles["Code"],
))
story.append(Spacer(1, 10))
story.append(Paragraph(
    "The ingestion pipeline accepts a resume PDF, converts it into usable text, extracts structured metadata, "
    "creates a vector embedding, and stores the final record in MongoDB for future retrieval.",
    styles["Normal"],
))

phases = [
    ("Phase 1 - Project Scaffold + Shared Backend",
     "Creates the Node.js, TypeScript, and Express foundation shared by ingestion and future retrieval.",
     "Code: src/app.ts, src/server.ts, src/config/env.ts, src/config/database.ts, src/middleware/\n"
     "Endpoint: GET /v1/health\n"
     "Focus: server startup, environment loading, middleware, and basic health."),
    ("Phase 2 - MongoDB Connectivity",
     "Creates one reusable MongoDB client and checks database access.",
     "Code: src/config/database.ts\n"
     "Endpoint: GET /v1/health/db\n"
     "Focus: shared connection, resumes collection access, and latency reporting."),
    ("Phase 3 - Ingestion Module Structure",
     "Organizes ingestion as a self-contained module.",
     "Code: src/modules/ingestion/{routes,controllers,services,repositories,utils,types}\n"
     "Endpoint: GET /v1/resume/health\n"
     "Focus: clear ownership and separation of ingestion responsibilities."),
    ("Phase 4 - Secure PDF Upload",
     "Accepts PDF resumes safely as temporary files.",
     "Code: src/config/multerConfig.ts\n"
     "Endpoint: POST /v1/resume/upload\n"
     "Focus: PDF-only validation, 5 MB limit, uploads directory, UUID filenames, and missing-file handling."),
    ("Phase 5 - PDF Text Extraction",
     "Converts an uploaded PDF into raw text using pdf-parse.",
     "Code: src/modules/ingestion/services/ResumeParserService.ts\n"
     "Endpoint: POST /v1/resume/extract\n"
     "Focus: extraction, empty-text detection, and temporary-file cleanup."),
    ("Phase 6 - Text Cleaning",
     "Normalizes extracted text before parsing and embedding without changing its meaning.",
     "Code: src/modules/ingestion/utils/textCleaner.ts\n"
     "Endpoint: POST /v1/resume/clean\n"
     "Focus: line endings, repeated spaces, blank lines, control characters, and preservation of C#, C++, and .NET."),
    ("Phase 7 - Regex Utilities",
     "Provides deterministic reusable patterns for common resume fields.",
     "Code: src/modules/ingestion/utils/regex.ts\n"
     "Endpoint: none\n"
     "Focus: email, phone, and experience extraction such as 13+ years."),
    ("Phase 8 - Skills Dictionary + Detection",
     "Detects known technical skills deterministically from resume text.",
     "Code: src/config/skills.ts and ingestion controller\n"
     "Endpoint: POST /v1/resume/skills\n"
     "Focus: case-insensitive, boundary-aware matching for skills such as Selenium, Python, RAG, and DeepEval."),
    ("Phase 9 - Algorithm Resume Parser",
     "Converts cleaned text into structured JSON without requiring an LLM.",
     "Code: src/modules/ingestion/services/AlgorithmResumeParser.ts\n"
     "Endpoint: POST /v1/resume/parse\n"
     "Focus: supported fields such as name, role, company, education, experience, and skills; unsupported values are omitted."),
    ("Phase 10 - Optional LLM Parser",
     "Adds configuration-driven LLM parsing without replacing the deterministic parser.",
     "Code: src/modules/ingestion/services/LLMResumeParser.ts\n"
     "Endpoint: POST /v1/resume/llm-parse\n"
     "Focus: USE_LLM_PARSER selection, Groq integration, and schema validation of model output."),
    ("Phase 11 - Mistral Resume Embedding",
     "Converts resume context into a vector for future semantic retrieval.",
     "Code: src/modules/ingestion/services/EmbeddingService.ts\n"
     "Endpoint: POST /v1/resume/embed\n"
     "Focus: mistral-embed, meaningful context construction, numeric validation, and exactly 1024 dimensions."),
    ("Phase 12 - MongoDB Resume Storage",
     "Stores structured metadata and the embedding in the resumes collection.",
     "Code: src/modules/ingestion/repositories/ResumeIngestionRepository.ts\n"
     "Endpoint: POST /v1/resume/store\n"
     "Focus: root-level resume fields, embedding metadata, timestamps, and MongoDB resumeId."),
    ("Phase 13 - Full Resume Ingestion Service",
     "Orchestrates the complete ingestion process through one production endpoint.",
     "Code: src/modules/ingestion/services/ResumeIngestionService.ts\n"
     "Endpoint: POST /v1/resume/ingest\n"
     "Focus: extract, clean, parse, embed, store, timings, and temporary-file cleanup."),
    ("Phase 14 - Stable Error Handling",
     "Provides predictable HTTP statuses, error codes, messages, and request IDs.",
     "Code: src/middleware/errorHandler.ts and ingestion controllers\n"
     "Focus: FILE_REQUIRED, INVALID_FILE_TYPE, FILE_TOO_LARGE, RESUME_EXTRACTION_FAILED, "
     "RESUME_PARSE_FAILED, EMBEDDING_FAILED, and INGESTION_FAILED."),
    ("Phase 15 - Logging + Request IDs",
     "Makes requests traceable while protecting sensitive information.",
     "Code: src/middleware/requestId.ts and src/middleware/logger.ts\n"
     "Focus: requestId, endpoint, filename, status, stage timings, and total duration; no keys, raw text, or vectors in logs."),
    ("Phase 16 - Automated Verification",
     "Confirms the ingestion foundation is stable before retrieval development.",
     "Code: tests/*.test.ts\n"
     "Commands: npm run build and npm test\n"
     "Focus: unit tests, endpoint checks, MongoDB verification, embedding dimension, and final end-to-end ingestion."),
]

for heading, purpose, details in phases:
    story.append(Paragraph(heading, styles["PhaseHeading"]))
    story.append(Paragraph("<b>Purpose:</b> " + purpose, styles["Small"]))
    story.append(Spacer(1, 3))
    story.append(Preformatted(details, styles["Small"]))
    story.append(Spacer(1, 5))

story.append(PageBreak())
story.append(Paragraph("Final Verification Checklist", styles["Heading2"]))
checklist = [
    "npm run build passes.",
    "npm test passes.",
    "GET /v1/health returns HTTP 200.",
    "GET /v1/health/db returns connected: true.",
    "PDF-only upload validation works.",
    "PDF extraction returns non-empty rawText.",
    "Text cleaning preserves meaningful technical terms.",
    "Algorithm parsing returns supported structured fields.",
    "Mistral returns a numeric vector with dimension 1024.",
    "MongoDB contains the stored resume document.",
    "POST /v1/resume/ingest returns resumeId.",
    "Logs contain request IDs and timings but no secrets or sensitive payloads.",
]
for item in checklist:
    story.append(Paragraph("[ ] " + item, styles["Normal"]))
    story.append(Spacer(1, 4))

story.append(Spacer(1, 12))
story.append(Paragraph(
    "Security note: never place API keys, database passwords, or connection strings in documentation. "
    "Any credentials previously exposed should be revoked and regenerated.",
    styles["Small"],
))

doc.build(story)
print(output_path)
