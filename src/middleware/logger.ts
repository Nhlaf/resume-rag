import { RequestHandler } from "express";
import { createSafeLogEntry } from "./safeLogger";

/**
 * Logger middleware (Phase 16)
 * Logs complete request/response lifecycle with component timings
 * Supports both ingestion and retrieval pipelines
 * Ensures no secrets or large text fields are logged
 */
export const logger: RequestHandler = (req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    const logEntry: any = {
      requestId: res.locals.requestId,
      endpoint: req.originalUrl,
      method: req.method,
      statusCode: res.statusCode,
    };

    // Add ingestion-specific fields
    if (res.locals.fileName) {
      logEntry.fileName = res.locals.fileName;
    }

    // Add component timings (Phase 16)
    if (res.locals.componentTimings) {
      logEntry.componentTimings = res.locals.componentTimings;
    } else if (res.locals.ingestionTimings) {
      // Legacy ingestion timings support
      Object.assign(logEntry, res.locals.ingestionTimings);
    }

    // Add warnings for degraded states (Phase 15-16)
    if (res.locals.warnings && res.locals.warnings.length > 0) {
      logEntry.warnings = res.locals.warnings;
    }

    // Add degraded flag (Phase 15-16)
    if (res.locals.degraded === true) {
      logEntry.degraded = true;
    }

    // Add fallback indicators (Phase 15-16)
    if (res.locals.bm25Fallback === true) {
      logEntry.bm25Fallback = true;
    }
    if (res.locals.vectorFallback === true) {
      logEntry.vectorFallback = true;
    }

    // Calculate total duration
    logEntry.durationMs = res.locals.componentTimings?.totalMs 
      ?? res.locals.ingestionTimings?.totalMs 
      ?? Date.now() - startedAt;

    // Sanitize and log as structured JSON (Phase 16)
    const safeLogEntry = createSafeLogEntry(logEntry);
    console.log(JSON.stringify(safeLogEntry));
  });

  next();
};