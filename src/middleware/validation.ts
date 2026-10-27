import { Request, Response, NextFunction } from "express";

/**
 * Validation middleware (Phase 17)
 * Protects APIs from malformed or oversized requests
 */

// Maximum query length (characters)
const MAX_QUERY_LENGTH = 2000;

// Maximum request body size (bytes) - enforced at app level
export const MAX_REQUEST_BODY_SIZE = "10mb";

/**
 * Validate search query
 */
export function validateSearchQuery(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { query } = req.body;

  // Query is required
  if (!query) {
    res.status(400).json({
      success: false,
      errorCode: "INVALID_SEARCH_QUERY",
      message: "Search query is required",
    });
    return;
  }

  // Query must be a string
  if (typeof query !== "string") {
    res.status(400).json({
      success: false,
      errorCode: "INVALID_SEARCH_QUERY",
      message: "Search query must be a string",
    });
    return;
  }

  // Trim and check if empty
  const trimmedQuery = query.trim();
  if (trimmedQuery.length === 0) {
    res.status(400).json({
      success: false,
      errorCode: "INVALID_SEARCH_QUERY",
      message: "Search query cannot be empty",
    });
    return;
  }

  // Check maximum length
  if (trimmedQuery.length > MAX_QUERY_LENGTH) {
    res.status(400).json({
      success: false,
      errorCode: "QUERY_TOO_LONG",
      message: `Search query exceeds maximum length of ${MAX_QUERY_LENGTH} characters`,
      maxLength: MAX_QUERY_LENGTH,
      actualLength: trimmedQuery.length,
    });
    return;
  }

  // Store trimmed query back to body
  req.body.query = trimmedQuery;

  next();
}

/**
 * Validate search options
 */
export function validateSearchOptions(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { options = {} } = req.body;

  // Validate topK parameters
  if (options.bm25TopK !== undefined) {
    if (!Number.isInteger(options.bm25TopK) || options.bm25TopK < 1 || options.bm25TopK > 100) {
      res.status(400).json({
        success: false,
        errorCode: "INVALID_TOP_K",
        message: "bm25TopK must be an integer between 1 and 100",
      });
      return;
    }
  }

  if (options.vectorTopK !== undefined) {
    if (!Number.isInteger(options.vectorTopK) || options.vectorTopK < 1 || options.vectorTopK > 100) {
      res.status(400).json({
        success: false,
        errorCode: "INVALID_TOP_K",
        message: "vectorTopK must be an integer between 1 and 100",
      });
      return;
    }
  }

  if (options.rerankTopN !== undefined) {
    if (!Number.isInteger(options.rerankTopN) || options.rerankTopN < 1 || options.rerankTopN > 50) {
      res.status(400).json({
        success: false,
        errorCode: "INVALID_RERANK_N",
        message: "rerankTopN must be an integer between 1 and 50",
      });
      return;
    }
  }

  if (options.finalTopK !== undefined) {
    if (!Number.isInteger(options.finalTopK) || options.finalTopK < 1 || options.finalTopK > 20) {
      res.status(400).json({
        success: false,
        errorCode: "INVALID_FINAL_K",
        message: "finalTopK must be an integer between 1 and 20",
      });
      return;
    }
  }

  // Validate summary style
  if (options.summaryStyle !== undefined) {
    if (options.summaryStyle !== "short" && options.summaryStyle !== "detailed") {
      res.status(400).json({
        success: false,
        errorCode: "INVALID_SUMMARY_STYLE",
        message: "summaryStyle must be either 'short' or 'detailed'",
      });
      return;
    }
  }

  // Validate summarize flag
  if (options.summarize !== undefined) {
    if (typeof options.summarize !== "boolean") {
      res.status(400).json({
        success: false,
        errorCode: "INVALID_SUMMARIZE_FLAG",
        message: "summarize must be a boolean",
      });
      return;
    }
  }

  next();
}

/**
 * Validate search filters
 */
export function validateSearchFilters(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { filters = {} } = req.body;

  // Validate minYearsExperience
  if (filters.minYearsExperience !== undefined) {
    if (
      !Number.isInteger(filters.minYearsExperience) ||
      filters.minYearsExperience < 0 ||
      filters.minYearsExperience > 50
    ) {
      res.status(400).json({
        success: false,
        errorCode: "INVALID_FILTER",
        message: "minYearsExperience must be an integer between 0 and 50",
      });
      return;
    }
  }

  // Validate location if provided
  if (filters.location !== undefined) {
    if (typeof filters.location !== "string" || filters.location.trim().length === 0) {
      res.status(400).json({
        success: false,
        errorCode: "INVALID_FILTER",
        message: "location must be a non-empty string",
      });
      return;
    }
  }

  // Validate skills array if provided
  if (filters.skills !== undefined) {
    if (!Array.isArray(filters.skills)) {
      res.status(400).json({
        success: false,
        errorCode: "INVALID_FILTER",
        message: "skills must be an array",
      });
      return;
    }

    // Check each skill is a string
    for (const skill of filters.skills) {
      if (typeof skill !== "string" || skill.trim().length === 0) {
        res.status(400).json({
          success: false,
          errorCode: "INVALID_FILTER",
          message: "Each skill must be a non-empty string",
        });
        return;
      }
    }
  }

  next();
}

/**
 * Validate rerank candidates
 */
export function validateRerankCandidates(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { candidates } = req.body;

  // Candidates array is required
  if (!candidates) {
    res.status(400).json({
      success: false,
      errorCode: "MISSING_CANDIDATES",
      message: "candidates array is required",
    });
    return;
  }

  // Must be an array
  if (!Array.isArray(candidates)) {
    res.status(400).json({
      success: false,
      errorCode: "INVALID_CANDIDATES",
      message: "candidates must be an array",
    });
    return;
  }

  // Must have at least one candidate
  if (candidates.length === 0) {
    res.status(400).json({
      success: false,
      errorCode: "EMPTY_CANDIDATES",
      message: "candidates array cannot be empty",
    });
    return;
  }

  // Validate each candidate has resumeId
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    
    if (!candidate.resumeId || typeof candidate.resumeId !== "string") {
      res.status(400).json({
        success: false,
        errorCode: "INVALID_CANDIDATE",
        message: `Candidate at index ${i} is missing a valid resumeId`,
      });
      return;
    }
  }

  // Limit number of candidates
  if (candidates.length > 50) {
    res.status(400).json({
      success: false,
      errorCode: "TOO_MANY_CANDIDATES",
      message: "Cannot rerank more than 50 candidates at once",
      maxCandidates: 50,
      providedCandidates: candidates.length,
    });
    return;
  }

  next();
}

/**
 * Handle request body size limit exceeded (413)
 */
export function handlePayloadTooLarge(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err.type === "entity.too.large") {
    res.status(413).json({
      success: false,
      errorCode: "PAYLOAD_TOO_LARGE",
      message: "Request body exceeds maximum size limit",
      maxSize: MAX_REQUEST_BODY_SIZE,
    });
    return;
  }
  next(err);
}
