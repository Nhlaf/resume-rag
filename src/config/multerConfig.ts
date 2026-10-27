import { mkdirSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import multer from "multer";
import { env } from "./env";

const uploadDirectory = path.resolve(process.cwd(), "uploads");
mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (_req, file, callback) => {
    callback(null, `${randomUUID()}.pdf`);
  },
});

export const uploadResumePdf = multer({
  storage,
  limits: {
    fileSize: env.maxUploadSizeMb * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (extension !== ".pdf" || file.mimetype !== "application/pdf") {
      const error = new Error("Only PDF files are allowed");
      error.name = "INVALID_FILE_TYPE";
      callback(error);
      return;
    }

    callback(null, true);
  },
});