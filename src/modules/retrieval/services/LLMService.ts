import { env } from "../../../config/env";
import type { SearchCandidate } from "../types/retrieval.types";

export interface RerankResult {
  resumeId: string;
  rank: number;
  relevanceScore: number;
  reason?: string;
}

export interface SummarizeOptions {
  style?: "short" | "detailed";
  maxTokens?: number;
}

export class LLMService {
  /**
   * Re-rank candidates using Groq LLM
   */
  async rerankCandidates(
    query: string,
    candidates: SearchCandidate[],
    topK: number
  ): Promise<RerankResult[]> {
    if (!env.groqApiKey) {
      console.warn("GROQ_API_KEY not configured, skipping LLM re-ranking");
      return [];
    }

    if (candidates.length === 0) {
      return [];
    }

    try {
      // Prepare candidate data for LLM
      const candidatesForLLM = candidates.map((c, idx) => ({
        id: c.resumeId,
        index: idx,
        name: c.name || "Unknown",
        role: c.role || "Unknown",
        company: c.company,
        skills: c.skills?.slice(0, 10) || [], // Limit skills to avoid token overflow
        snippet: c.snippet?.substring(0, 300) || "", // Limit snippet length
      }));

      // Create the prompt
      const prompt = `You are an expert recruiter AI. Your task is to rank candidates based on their relevance to a job search query.

**Search Query:** "${query}"

**Candidates:**
${candidatesForLLM.map((c, i) => `
${i + 1}. ID: ${c.id}
   Name: ${c.name}
   Role: ${c.role}
   ${c.company ? `Company: ${c.company}` : ""}
   Skills: ${c.skills.join(", ") || "N/A"}
   Summary: ${c.snippet}
`).join("\n")}

**Instructions:**
1. Analyze each candidate's relevance to the search query
2. Rank the candidates from most to least relevant
3. Provide a relevance score (0.0 to 1.0) for each candidate
4. Provide a brief reason for each ranking
5. Return ONLY valid JSON in this exact format:

{
  "rankings": [
    {
      "resumeId": "candidate_id_here",
      "rank": 1,
      "relevanceScore": 0.95,
      "reason": "Strong match because..."
    }
  ]
}

**Important:**
- Include ALL candidates in the rankings
- Scores should be between 0.0 and 1.0
- Higher scores = more relevant
- Return ONLY the JSON object, no additional text`;

      // Call Groq API
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.groqModel,
          messages: [
            {
              role: "system",
              content: "You are an expert recruiter AI that ranks candidates. Always respond with valid JSON only.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("No content in Groq response");
      }

      // Parse the JSON response
      const parsed = JSON.parse(content);
      const rankings = parsed.rankings || [];

      // Validate rankings
      const validRankings = rankings.filter((r: any) => {
        return (
          r.resumeId &&
          typeof r.rank === "number" &&
          typeof r.relevanceScore === "number" &&
          r.relevanceScore >= 0 &&
          r.relevanceScore <= 1 &&
          candidates.some(c => c.resumeId === r.resumeId)
        );
      });

      // Sort by rank and limit to topK
      const sortedRankings = validRankings
        .sort((a: RerankResult, b: RerankResult) => a.rank - b.rank)
        .slice(0, topK);

      console.log(`LLM re-ranked ${sortedRankings.length} candidates from ${candidates.length} input candidates`);

      return sortedRankings;
    } catch (error) {
      console.error("LLM re-ranking error:", error);
      // Return empty array to allow fallback
      return [];
    }
  }

  /**
   * Generate candidate fit summary
   */
  async summarizeCandidateFit(
    query: string,
    candidate: SearchCandidate,
    options: SummarizeOptions = {}
  ): Promise<string> {
    if (!env.groqApiKey) {
      console.warn("GROQ_API_KEY not configured, skipping summarization");
      return "";
    }

    const style = options.style || "short";
    const maxTokens = options.maxTokens || (style === "short" ? 150 : 300);

    try {
      // Create the prompt based on style
      const styleInstruction =
        style === "short"
          ? "Write a concise 2-3 sentence summary (40-60 words)."
          : "Write a detailed paragraph summary (80-120 words).";

      const prompt = `You are an expert recruiter AI. Analyze how well this candidate fits the job requirements.

**Job Search Query:** "${query}"

**Candidate Information:**
- Name: ${candidate.name || "Unknown"}
- Role: ${candidate.role || "Unknown"}
- Company: ${candidate.company || "Not specified"}
- Skills: ${candidate.skills?.join(", ") || "Not specified"}
- Background: ${candidate.snippet?.substring(0, 400) || "No additional information"}

**Task:** ${styleInstruction}

**Focus on:**
1. How the candidate's experience aligns with the query
2. Key strengths relevant to the requirements
3. Any notable achievements or expertise

**Important:** Write ONLY the summary text, no additional formatting or labels.`;

      // Call Groq API
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.groqModel,
          messages: [
            {
              role: "system",
              content:
                "You are an expert recruiter AI that writes clear, professional candidate summaries. Be concise and focus on fit.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.5,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const summary = data.choices?.[0]?.message?.content?.trim();

      if (!summary) {
        throw new Error("No content in Groq response");
      }

      console.log(`Generated ${style} summary for candidate ${candidate.resumeId}: ${summary.length} chars`);

      return summary;
    } catch (error) {
      console.error("Summarization error:", error);
      // Return empty string to allow graceful degradation
      return "";
    }
  }

  /**
   * Extract metadata from raw text (optional, for future use)
   */
  async extractMetadata(rawText: string): Promise<Record<string, any>> {
    console.log("Metadata extraction - optional feature", { textLength: rawText.length });
    return {};
  }
}
