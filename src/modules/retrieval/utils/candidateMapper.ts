import type { ResumeDocument } from "../repositories/ResumeRepository";
import type { SearchCandidate } from "../types/retrieval.types";

/**
 * Map a resume document to a search candidate
 */
export function mapResumeToCandidate(
  resume: ResumeDocument,
  source: "bm25" | "vector",
  score?: number
): SearchCandidate {
  // Create snippet from raw text (limit to 500 characters)
  const snippet = resume.rawText?.substring(0, 500) ?? "";

  return {
    resumeId: typeof resume._id === "string" ? resume._id : resume._id.toString(),
    name: resume.name,
    role: resume.role,
    company: resume.company,
    skills: resume.skills ?? [],
    snippet,
    bm25Score: source === "bm25" ? score : undefined,
    vectorScore: source === "vector" ? score : undefined,
    sources: [source],
  };
}

/**
 * Create snippet for LLM re-ranking (size-controlled)
 */
export function createLLMSnippet(resume: ResumeDocument, maxLength: number = 800): string {
  const parts = [
    resume.name ? `Name: ${resume.name}` : "",
    resume.role ? `Role: ${resume.role}` : "",
    resume.company ? `Company: ${resume.company}` : "",
    resume.totalExperience ? `Experience: ${resume.totalExperience} years` : "",
    resume.skills?.length ? `Skills: ${resume.skills.join(", ")}` : "",
    resume.experienceSummary ? `Summary: ${resume.experienceSummary}` : "",
  ].filter(Boolean);

  const snippet = parts.join(" | ");
  return snippet.length > maxLength ? snippet.substring(0, maxLength) + "..." : snippet;
}
