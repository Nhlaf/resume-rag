import type { SearchCandidate } from "../types/retrieval.types";

/**
 * Merge BM25 and Vector candidate lists
 */
export function mergeCandidates(
  bm25Candidates: SearchCandidate[],
  vectorCandidates: SearchCandidate[]
): SearchCandidate[] {
  // Combine both lists
  const allCandidates = [...bm25Candidates, ...vectorCandidates];
  
  // Deduplicate
  return deduplicateCandidates(allCandidates);
}

/**
 * Deduplicate candidates by resumeId and merge sources
 */
export function deduplicateCandidates(candidates: SearchCandidate[]): SearchCandidate[] {
  const candidateMap = new Map<string, SearchCandidate>();

  for (const candidate of candidates) {
    const existing = candidateMap.get(candidate.resumeId);

    if (existing) {
      // Merge sources
      const mergedSources = Array.from(
        new Set([...existing.sources, ...candidate.sources])
      ) as ("bm25" | "vector")[];

      // Keep higher scores and merge all data
      candidateMap.set(candidate.resumeId, {
        ...existing,
        ...candidate, // Take latest candidate data
        sources: mergedSources,
        bm25Score: Math.max(existing.bm25Score ?? 0, candidate.bm25Score ?? 0) || undefined,
        vectorScore: Math.max(existing.vectorScore ?? 0, candidate.vectorScore ?? 0) || undefined,
        // Merge skills from both
        skills: Array.from(new Set([...(existing.skills ?? []), ...(candidate.skills ?? [])])),
      });
    } else {
      candidateMap.set(candidate.resumeId, candidate);
    }
  }

  return Array.from(candidateMap.values());
}

/**
 * Sort merged candidates by a simple scoring strategy
 * This is a fallback before LLM re-ranking
 */
export function sortCandidatesByScore(candidates: SearchCandidate[]): SearchCandidate[] {
  return candidates.sort((a, b) => {
    // Candidates with both scores rank higher
    const aHasBoth = (a.bm25Score ?? 0) > 0 && (a.vectorScore ?? 0) > 0;
    const bHasBoth = (b.bm25Score ?? 0) > 0 && (b.vectorScore ?? 0) > 0;

    if (aHasBoth && !bHasBoth) return -1;
    if (!aHasBoth && bHasBoth) return 1;

    // Simple average of normalized scores
    const aNormBm25 = Math.min((a.bm25Score ?? 0) / 2, 1); // Normalize BM25 to 0-1
    const aScore = (aNormBm25 + (a.vectorScore ?? 0)) / 2;

    const bNormBm25 = Math.min((b.bm25Score ?? 0) / 2, 1);
    const bScore = (bNormBm25 + (b.vectorScore ?? 0)) / 2;

    return bScore - aScore; // Descending
  });
}

