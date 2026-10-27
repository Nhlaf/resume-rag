/**
 * Unit tests for validation middleware (Phase 18)
 */

import { Request, Response, NextFunction } from "express";
import {
  validateSearchQuery,
  validateSearchOptions,
  validateSearchFilters,
  validateRerankCandidates,
} from "../src/middleware/validation";

// Mock Express objects
const mockRequest = (body: any): Partial<Request> => ({
  body,
});

const mockResponse = (): Partial<Response> => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

describe("Validation Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateSearchQuery", () => {
    it("accepts valid query", () => {
      const req = mockRequest({ query: "Senior QA engineer" });
      const res = mockResponse();

      validateSearchQuery(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("rejects missing query", () => {
      const req = mockRequest({});
      const res = mockResponse();

      validateSearchQuery(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: "INVALID_SEARCH_QUERY",
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("rejects empty query", () => {
      const req = mockRequest({ query: "" });
      const res = mockResponse();

      validateSearchQuery(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("rejects whitespace-only query", () => {
      const req = mockRequest({ query: "   " });
      const res = mockResponse();

      validateSearchQuery(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Search query cannot be empty",
        })
      );
    });

    it("trims query automatically", () => {
      const req = mockRequest({ query: "  test query  " });
      const res = mockResponse();

      validateSearchQuery(req as Request, res as Response, mockNext);

      expect(req.body.query).toBe("test query");
      expect(mockNext).toHaveBeenCalled();
    });

    it("rejects non-string query", () => {
      const req = mockRequest({ query: 123 });
      const res = mockResponse();

      validateSearchQuery(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Search query must be a string",
        })
      );
    });

    it("rejects query exceeding max length", () => {
      const longQuery = "a".repeat(2001);
      const req = mockRequest({ query: longQuery });
      const res = mockResponse();

      validateSearchQuery(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: "QUERY_TOO_LONG",
        })
      );
    });
  });

  describe("validateSearchOptions", () => {
    it("accepts valid options", () => {
      const req = mockRequest({
        query: "test",
        options: {
          bm25TopK: 20,
          vectorTopK: 20,
          rerankTopN: 10,
          finalTopK: 5,
          summaryStyle: "short",
          summarize: true,
        },
      });
      const res = mockResponse();

      validateSearchOptions(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("rejects invalid bm25TopK (too high)", () => {
      const req = mockRequest({
        options: { bm25TopK: 150 },
      });
      const res = mockResponse();

      validateSearchOptions(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: "INVALID_TOP_K",
        })
      );
    });

    it("rejects invalid bm25TopK (too low)", () => {
      const req = mockRequest({
        options: { bm25TopK: 0 },
      });
      const res = mockResponse();

      validateSearchOptions(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("rejects non-integer topK", () => {
      const req = mockRequest({
        options: { bm25TopK: 20.5 },
      });
      const res = mockResponse();

      validateSearchOptions(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("rejects invalid summaryStyle", () => {
      const req = mockRequest({
        options: { summaryStyle: "verbose" },
      });
      const res = mockResponse();

      validateSearchOptions(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: "INVALID_SUMMARY_STYLE",
        })
      );
    });

    it("accepts 'short' summaryStyle", () => {
      const req = mockRequest({
        options: { summaryStyle: "short" },
      });
      const res = mockResponse();

      validateSearchOptions(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("accepts 'detailed' summaryStyle", () => {
      const req = mockRequest({
        options: { summaryStyle: "detailed" },
      });
      const res = mockResponse();

      validateSearchOptions(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("validateSearchFilters", () => {
    it("accepts valid filters", () => {
      const req = mockRequest({
        filters: {
          minYearsExperience: 10,
          location: "San Francisco",
          skills: ["Python", "RAG"],
        },
      });
      const res = mockResponse();

      validateSearchFilters(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("rejects invalid minYearsExperience (too high)", () => {
      const req = mockRequest({
        filters: { minYearsExperience: 100 },
      });
      const res = mockResponse();

      validateSearchFilters(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: "INVALID_FILTER",
        })
      );
    });

    it("accepts minYearsExperience = 0", () => {
      const req = mockRequest({
        filters: { minYearsExperience: 0 },
      });
      const res = mockResponse();

      validateSearchFilters(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("rejects empty location string", () => {
      const req = mockRequest({
        filters: { location: "" },
      });
      const res = mockResponse();

      validateSearchFilters(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("rejects non-array skills", () => {
      const req = mockRequest({
        filters: { skills: "Python" },
      });
      const res = mockResponse();

      validateSearchFilters(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("rejects skills array with empty strings", () => {
      const req = mockRequest({
        filters: { skills: ["Python", ""] },
      });
      const res = mockResponse();

      validateSearchFilters(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("validateRerankCandidates", () => {
    it("accepts valid candidates array", () => {
      const req = mockRequest({
        query: "test",
        candidates: [
          { resumeId: "resume-1", name: "John Doe" },
          { resumeId: "resume-2", name: "Jane Smith" },
        ],
      });
      const res = mockResponse();

      validateRerankCandidates(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("rejects missing candidates", () => {
      const req = mockRequest({ query: "test" });
      const res = mockResponse();

      validateRerankCandidates(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: "MISSING_CANDIDATES",
        })
      );
    });

    it("rejects empty candidates array", () => {
      const req = mockRequest({
        query: "test",
        candidates: [],
      });
      const res = mockResponse();

      validateRerankCandidates(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: "EMPTY_CANDIDATES",
        })
      );
    });

    it("rejects candidates missing resumeId", () => {
      const req = mockRequest({
        query: "test",
        candidates: [{ name: "John Doe" }],
      });
      const res = mockResponse();

      validateRerankCandidates(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: "INVALID_CANDIDATE",
        })
      );
    });

    it("rejects too many candidates (>50)", () => {
      const candidates = Array.from({ length: 51 }, (_, i) => ({
        resumeId: `resume-${i}`,
      }));
      const req = mockRequest({
        query: "test",
        candidates,
      });
      const res = mockResponse();

      validateRerankCandidates(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode: "TOO_MANY_CANDIDATES",
        })
      );
    });
  });
});
