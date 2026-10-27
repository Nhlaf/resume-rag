import cors from "cors";
import express from "express";
import { getDatabase } from "./config/database";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./middleware/logger";
import { requestId } from "./middleware/requestId";
import { handlePayloadTooLarge, MAX_REQUEST_BODY_SIZE } from "./middleware/validation";
import { ingestionRoutes } from "./modules/ingestion/routes/ingestionRoutes";
import { retrievalRoutes } from "./modules/retrieval/routes/retrievalRoutes";

export const app = express();

app.use(cors());
app.use(requestId);
app.use(logger);

// Enforce request body size limit (Phase 17)
app.use(express.json({ limit: MAX_REQUEST_BODY_SIZE }));
app.use(handlePayloadTooLarge);

app.get("/v1/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    app: "resume-rag-backend",
    version: "1.0.0",
    uptime: process.uptime(),
  });
});

app.get("/v1/health/db", async (_req, res) => {
  const startedAt = Date.now();

  try {
    const database = await getDatabase();
    await database.listCollections({ name: "resumes" }).hasNext();

    res.status(200).json({
      status: "ok",
      database: "mongodb",
      connected: true,
      latencyMs: Date.now() - startedAt,
    });
  } catch (_error) {
    res.status(503).json({
      status: "error",
      database: "mongodb",
      connected: false,
      errorCode: "DB_CONNECTION_FAILED",
    });
  }
});

app.use("/v1", ingestionRoutes);
app.use("/v1", retrievalRoutes);

app.use(errorHandler);