/**
 * Integration tests for retrieval endpoints (Phase 18)
 * These tests require MongoDB connection and ingested resumes
 */

import request from "supertest";
import { app } from "../src/app";
import { getDatabase } from "../src/config/database";

describe("Retrieval Endpoints Integration Tests", () => {
  let hasIngestedResumes = false;

  beforeAll(async () => {
    // Check if there are ingested resumes
    try {
      const db = await getDatabase();
      const collection = db.collection("resumes");
      const count = await collection.countDocuments({ embedding: { $exists: true, $ne: null } });
      hasIngestedResumes = count > 0;

      if (!hasIngestedResumes) {
        console.warn(
          "⚠️  No ingested resumes found. Some tests will be skipped. " +
          "Please run ingestion first to test full retrieval pipeline."
        );
      }
    } catch (error) {
      console.error("Failed to connect to database:", error);
    }
  });

  describe("GET /v1/search/readiness", () => {
    it("should return readiness status", async () => {
      const response = await request(app)
        .get("/v1/search/readiness")
        .expect(200);

      expect(response.body).toHaveProperty("ready");
      expect(response.body).toHaveProperty("resumeCount");
      expect(response.body).toHaveProperty("resumesWithEmbedding");

      if (hasIngestedResumes) {
        expect(response.body.ready).toBe(true);
        expect(response.body.resumeCount).toBeGreaterThan(0);
        expect(response.body.resumesWithEmbedding).toBeGreaterThan(0);
      }
    });
  });

  describe("POST /v1/embeddings", () => {
    it("should generate query embedding", async () => {
      const response = await request(app)
        .post("/v1/embeddings")
        .send({
          model: "mistral-embed",
          input: "Senior QA engineer with RAG experience",
        })
        .expect(200);

      expect(response.body).toHaveProperty("embedding");
      expect(response.body).toHaveProperty("model");
      expect(response.body).toHaveProperty("dimension");
      expect(Array.isArray(response.body.embedding)).toBe(true);
      expect(response.body.dimension).toBe(1024);
    }, 30000); // Increase timeout for API call
  });

  describe("POST /v1/search/bm25", () => {
    it("should reject invalid query", async () => {
      await request(app)
        .post("/v1/search/bm25")
        .send({})
        .expect(400);
    });

    it("should perform BM25 search with valid query", async () => {
      if (!hasIngestedResumes) {
        console.log("Skipping: No ingested resumes");
        return;
      }

      const response = await request(app)
        .post("/v1/search/bm25")
        .send({
          query: "QA architect RAG",
          topK: 10,
        })
        .expect(200);

      expect(response.body).toHaveProperty("mode", "bm25");
      expect(response.body).toHaveProperty("results");
      expect(Array.isArray(response.body.results)).toBe(true);
    }, 30000);

    it("should respect topK limit", async () => {
      if (!hasIngestedResumes) {
        console.log("Skipping: No ingested resumes");
        return;
      }

      const response = await request(app)
        .post("/v1/search/bm25")
        .send({
          query: "engineer",
          topK: 3,
        })
        .expect(200);

      expect(response.body.results.length).toBeLessThanOrEqual(3);
    }, 30000);
  });

  describe("POST /v1/search/vector", () => {
    it("should reject invalid query", async () => {
      await request(app)
        .post("/v1/search/vector")
        .send({ query: "" })
        .expect(400);
    });

    it("should perform vector search with valid query", async () => {
      if (!hasIngestedResumes) {
        console.log("Skipping: No ingested resumes");
        return;
      }

      const response = await request(app)
        .post("/v1/search/vector")
        .send({
          query: "Senior QA engineer with automation experience",
          topK: 10,
        })
        .expect(200);

      expect(response.body).toHaveProperty("mode", "vector");
      expect(response.body).toHaveProperty("results");
      expect(Array.isArray(response.body.results)).toBe(true);

      if (response.body.results.length > 0) {
        expect(response.body.results[0]).toHaveProperty("vectorScore");
      }
    }, 30000);
  });

  describe("POST /v1/search/hybrid", () => {
    it("should perform hybrid search", async () => {
      if (!hasIngestedResumes) {
        console.log("Skipping: No ingested resumes");
        return;
      }

      const response = await request(app)
        .post("/v1/search/hybrid")
        .send({
          query: "QA architect with RAG and DeepEval",
          topK: 10,
        })
        .expect(200);

      expect(response.body).toHaveProperty("mode", "hybrid-debug");
      expect(response.body).toHaveProperty("bm25");
      expect(response.body).toHaveProperty("vector");
      expect(response.body).toHaveProperty("timings");
      expect(Array.isArray(response.body.bm25)).toBe(true);
      expect(Array.isArray(response.body.vector)).toBe(true);
    }, 30000);
  });

  describe("POST /v1/search/hybrid/merged", () => {
    it("should merge and deduplicate hybrid results", async () => {
      if (!hasIngestedResumes) {
        console.log("Skipping: No ingested resumes");
        return;
      }

      const response = await request(app)
        .post("/v1/search/hybrid/merged")
        .send({
          query: "Senior engineer",
          topK: 10,
        })
        .expect(200);

      expect(response.body).toHaveProperty("results");
      expect(Array.isArray(response.body.results)).toBe(true);

      // Check for deduplication - no duplicate resumeIds
      if (response.body.results.length > 0) {
        const resumeIds = response.body.results.map((r: any) => r.resumeId);
        const uniqueIds = new Set(resumeIds);
        expect(uniqueIds.size).toBe(resumeIds.length);

        // Check sources array exists
        expect(response.body.results[0]).toHaveProperty("sources");
        expect(Array.isArray(response.body.results[0].sources)).toBe(true);
      }
    }, 30000);
  });

  describe("POST /v1/search/rerank", () => {
    it("should reject missing candidates", async () => {
      await request(app)
        .post("/v1/search/rerank")
        .send({
          query: "test",
        })
        .expect(400);
    });

    it("should reject empty candidates array", async () => {
      await request(app)
        .post("/v1/search/rerank")
        .send({
          query: "test",
          candidates: [],
        })
        .expect(400);
    });

    it("should rerank candidates with LLM", async () => {
      if (!hasIngestedResumes) {
        console.log("Skipping: No ingested resumes");
        return;
      }

      const response = await request(app)
        .post("/v1/search/rerank")
        .send({
          query: "Senior QA architect with RAG experience",
          candidates: [
            {
              resumeId: "test-id-1",
              snippet: "10 years of QA experience with RAG and LLM systems",
            },
          ],
          topK: 5,
        })
        .expect(200);

      expect(response.body).toHaveProperty("results");
      expect(Array.isArray(response.body.results)).toBe(true);

      if (response.body.results.length > 0) {
        expect(response.body.results[0]).toHaveProperty("rank");
        expect(response.body.results[0]).toHaveProperty("relevanceScore");
        expect(response.body.results[0]).toHaveProperty("reason");
      }
    }, 30000);
  });

  describe("POST /v1/search/summarize", () => {
    it("should reject missing query", async () => {
      await request(app)
        .post("/v1/search/summarize")
        .send({
          candidate: { resumeId: "test-id" },
        })
        .expect(400);
    });

    it("should generate candidate summary", async () => {
      const response = await request(app)
        .post("/v1/search/summarize")
        .send({
          query: "Senior QA architect",
          candidate: {
            resumeId: "test-id-1",
            name: "John Doe",
            role: "QA Engineer",
            skills: ["Python", "RAG"],
            snippet: "Experienced QA engineer with 10 years in automation",
          },
          style: "short",
        })
        .expect(200);

      expect(response.body).toHaveProperty("resumeId", "test-id-1");
      expect(response.body).toHaveProperty("summary");
      expect(response.body).toHaveProperty("style", "short");
      expect(typeof response.body.summary).toBe("string");
    }, 30000);
  });

  describe("POST /v1/search (Production Endpoint)", () => {
    it("should reject invalid query", async () => {
      await request(app)
        .post("/v1/search")
        .send({})
        .expect(400);
    });

    it("should reject invalid options", async () => {
      await request(app)
        .post("/v1/search")
        .send({
          query: "test",
          options: {
            bm25TopK: 150, // Too high
          },
        })
        .expect(400);
    });

    it("should perform full end-to-end search", async () => {
      if (!hasIngestedResumes) {
        console.log("Skipping: No ingested resumes");
        return;
      }

      const response = await request(app)
        .post("/v1/search")
        .send({
          query: "Senior QA architect with RAG, DeepEval and MCP experience",
          filters: {
            minYearsExperience: 5,
          },
          options: {
            finalTopK: 5,
            summarize: false,
          },
        })
        .expect(200);

      expect(response.body).toHaveProperty("query");
      expect(response.body).toHaveProperty("results");
      expect(response.body).toHaveProperty("degraded");
      expect(response.body).toHaveProperty("warnings");
      expect(response.body).toHaveProperty("timings");

      // Check timings structure
      expect(response.body.timings).toHaveProperty("embeddingMs");
      expect(response.body.timings).toHaveProperty("bm25Ms");
      expect(response.body.timings).toHaveProperty("vectorMs");
      expect(response.body.timings).toHaveProperty("rerankMs");
      expect(response.body.timings).toHaveProperty("summarizeMs");
      expect(response.body.timings).toHaveProperty("totalMs");

      // Check results structure
      expect(Array.isArray(response.body.results)).toBe(true);
      if (response.body.results.length > 0) {
        const result = response.body.results[0];
        expect(result).toHaveProperty("rank");
        expect(result).toHaveProperty("resumeId");
        expect(result).toHaveProperty("sources");
        expect(Array.isArray(result.sources)).toBe(true);
      }

      // Check warnings is an array
      expect(Array.isArray(response.body.warnings)).toBe(true);
    }, 60000); // Longer timeout for full pipeline

    it("should perform full search with summarization", async () => {
      if (!hasIngestedResumes) {
        console.log("Skipping: No ingested resumes");
        return;
      }

      const response = await request(app)
        .post("/v1/search")
        .send({
          query: "QA engineer with automation experience",
          options: {
            finalTopK: 3,
            summarize: true,
            summaryStyle: "short",
          },
        })
        .expect(200);

      expect(response.body).toHaveProperty("results");
      expect(response.body.timings.summarizeMs).toBeGreaterThanOrEqual(0);

      // If results exist, check for summaries
      if (response.body.results.length > 0) {
        // Summary might be undefined if summarization failed (degraded mode)
        // but the field should exist
        expect(response.body.results[0]).toHaveProperty("summary");
      }
    }, 60000);

    it("should respect finalTopK limit", async () => {
      if (!hasIngestedResumes) {
        console.log("Skipping: No ingested resumes");
        return;
      }

      const response = await request(app)
        .post("/v1/search")
        .send({
          query: "engineer",
          options: {
            finalTopK: 2,
          },
        })
        .expect(200);

      expect(response.body.results.length).toBeLessThanOrEqual(2);
    }, 60000);
  });
});
