import { getDatabase } from "../../../config/database";
import { env } from "../../../config/env";
import type { ReadinessResponse } from "../types/retrieval.types";

export class RetrievalValidationService {
  /**
   * Check if the retrieval system has the prerequisite data from ingestion
   */
  static async checkReadiness(): Promise<ReadinessResponse> {
    try {
      const database = await getDatabase();
      const collection = database.collection("resumes");

      // Count total resumes
      const resumeCount = await collection.countDocuments();

      if (resumeCount === 0) {
        return {
          ready: false,
          reason: "No ingested resume embeddings are available",
        };
      }

      // Count resumes with embeddings
      const resumesWithEmbedding = await collection.countDocuments({
        embedding: { $exists: true, $ne: null },
        embeddingDimension: { $exists: true },
      });

      if (resumesWithEmbedding === 0) {
        return {
          ready: false,
          reason: "No ingested resume embeddings are available",
        };
      }

      // Get a sample resume to check embedding properties
      const sampleResume = await collection.findOne({
        embedding: { $exists: true, $ne: null },
        embeddingDimension: { $exists: true },
      });

      if (!sampleResume) {
        return {
          ready: false,
          reason: "No ingested resume embeddings are available",
        };
      }

      const embeddingModel = sampleResume.embeddingModel || env.mistralEmbedModel;
      const embeddingDimension = sampleResume.embeddingDimension || env.embeddingDimension;

      // Check dimension compatibility
      if (embeddingDimension !== env.embeddingDimension) {
        return {
          ready: false,
          reason: `Embedding dimension mismatch: stored=${embeddingDimension}, configured=${env.embeddingDimension}`,
        };
      }

      return {
        ready: true,
        collection: "resumes",
        resumeCount,
        resumesWithEmbedding,
        embeddingModel,
        embeddingDimension,
      };
    } catch (error) {
      console.error("Readiness check failed:", error);
      return {
        ready: false,
        reason: "Database connection or query failed",
      };
    }
  }
}
