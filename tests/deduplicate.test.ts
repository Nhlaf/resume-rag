/**
 * Unit tests for candidate deduplication and merging (Phase 18)
 */

import { mergeCandidates, sortCandidatesByScore } from "../src/modules/retrieval/utils/deduplicate";
import type { SearchCandidate } from "../src/modules/retrieval/types/retrieval.types";

describe("Candidate Deduplication", () => {
  describe("mergeCandidates", () => {
    it("merges BM25 and vector candidates without duplicates", () => {
      const bm25Candidates: SearchCandidate[] = [
        {
          resumeId: "resume-1",
          name: "John Doe",
          bm25Score: 8.5,
          sources: ["bm25"],
          skills: [],
          snippet: "",
        },
        {
          resumeId: "resume-2",
          name: "Jane Smith",
          bm25Score: 7.2,
          sources: ["bm25"],
          skills: [],
          snippet: "",
        },
      ];

      const vectorCandidates: SearchCandidate[] = [
        {
          resumeId: "resume-2",
          name: "Jane Smith",
          vectorScore: 0.92,
          sources: ["vector"],
          skills: [],
          snippet: "",
        },
        {
          resumeId: "resume-3",
          name: "Bob Johnson",
          vectorScore: 0.85,
          sources: ["vector"],
          skills: [],
          snippet: "",
        },
      ];

      const merged = mergeCandidates(bm25Candidates, vectorCandidates);

      // Should have 3 unique candidates
      expect(merged).toHaveLength(3);

      // Resume-2 should appear once with both sources
      const resume2 = merged.find((c) => c.resumeId === "resume-2");
      expect(resume2).toBeDefined();
      expect(resume2?.sources).toContain("bm25");
      expect(resume2?.sources).toContain("vector");
      expect(resume2?.bm25Score).toBe(7.2);
      expect(resume2?.vectorScore).toBe(0.92);
    });

    it("handles empty BM25 results", () => {
      const vectorCandidates: SearchCandidate[] = [
        {
          resumeId: "resume-1",
          name: "John Doe",
          vectorScore: 0.88,
          sources: ["vector"],
          skills: [],
          snippet: "",
        },
      ];

      const merged = mergeCandidates([], vectorCandidates);

      expect(merged).toHaveLength(1);
      expect(merged[0].sources).toEqual(["vector"]);
    });

    it("handles empty vector results", () => {
      const bm25Candidates: SearchCandidate[] = [
        {
          resumeId: "resume-1",
          name: "John Doe",
          bm25Score: 8.5,
          sources: ["bm25"],
          skills: [],
          snippet: "",
        },
      ];

      const merged = mergeCandidates(bm25Candidates, []);

      expect(merged).toHaveLength(1);
      expect(merged[0].sources).toEqual(["bm25"]);
    });

    it("returns empty array when both inputs are empty", () => {
      const merged = mergeCandidates([], []);
      expect(merged).toHaveLength(0);
    });
  });

  describe("sortCandidatesByScore", () => {
    it("prioritizes candidates with both scores, then by combined score", () => {
      const candidates: SearchCandidate[] = [
        {
          resumeId: "resume-1",
          bm25Score: 5.0,
          vectorScore: 0.95,
          sources: ["bm25", "vector"],
          skills: [],
          snippet: "",
        },
        {
          resumeId: "resume-2",
          bm25Score: 8.0,
          vectorScore: 0.70,
          sources: ["bm25", "vector"],
          skills: [],
          snippet: "",
        },
        {
          resumeId: "resume-3",
          vectorScore: 0.85,
          sources: ["vector"],
          skills: [],
          snippet: "",
        },
      ];

      const sorted = sortCandidatesByScore(candidates);

      // Both resume-1 and resume-2 have both scores, so they rank higher than resume-3
      // Among those with both scores, resume-1 has better combined score
      expect(sorted[0].resumeId).toBe("resume-1");
      expect(sorted[1].resumeId).toBe("resume-2");
      expect(sorted[2].resumeId).toBe("resume-3");
    });

    it("handles candidates with only vector scores", () => {
      const candidates: SearchCandidate[] = [
        {
          resumeId: "resume-1",
          vectorScore: 0.70,
          sources: ["vector"],
          skills: [],
          snippet: "",
        },
        {
          resumeId: "resume-2",
          vectorScore: 0.90,
          sources: ["vector"],
          skills: [],
          snippet: "",
        },
      ];

      const sorted = sortCandidatesByScore(candidates);

      // Higher vector score should be first
      expect(sorted[0].resumeId).toBe("resume-2");
      expect(sorted[1].resumeId).toBe("resume-1");
    });

    it("handles empty array", () => {
      const sorted = sortCandidatesByScore([]);
      expect(sorted).toHaveLength(0);
    });
  });
});
