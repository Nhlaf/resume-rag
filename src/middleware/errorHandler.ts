import { ErrorRequestHandler } from "express";
import multer from "multer";

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  if (error?.type === "entity.parse.failed") {
    res.status(400).json({
      success: false,
      errorCode: "INVALID_JSON",
      message: "Request body must contain valid JSON",
      requestId: res.locals.requestId,
    });
    return;
  }

  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    res.status(413).json({
      success: false,
      errorCode: "FILE_TOO_LARGE",
      message: "Resume exceeds maximum upload size",
      requestId: res.locals.requestId,
    });
    return;
  }

  if (error?.name === "INVALID_FILE_TYPE") {
    res.status(415).json({
      success: false,
      errorCode: "INVALID_FILE_TYPE",
      message: "Only PDF files are allowed",
      requestId: res.locals.requestId,
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    success: false,
    errorCode: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
    requestId: res.locals.requestId,
  });
};