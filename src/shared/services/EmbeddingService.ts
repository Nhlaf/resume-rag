import { env } from "../../config/env";

type EmbeddingResponse = {
  data?: Array<{ embedding?: unknown }>;
};

export type ResumeEmbeddingInput = {
  name?: string;
  role?: string;
  skills: string[];
  company?: string;
  experienceSummary?: string;
  rawText: string;
};

export class EmbeddingService {
  /**
   * Build structured text from resume data for embedding
   */
  buildEmbeddingText(input: ResumeEmbeddingInput): string {
    return [
      input.name ?? "",
      input.role ?? "",
      input.skills.join(", "),
      input.company ?? "",
      input.experienceSummary ?? "",
      input.rawText,
    ].join("\n");
  }

  /**
   * Generate embedding for a resume (used during ingestion)
   */
  async generateResumeEmbedding(input: ResumeEmbeddingInput): Promise<number[]> {
    if (!env.mistralApiKey) {
      throw new Error("MISTRAL_API_KEY is not configured");
    }

    const text = this.buildEmbeddingText(input);
    return this.generateEmbedding(text);
  }

  /**
   * Generate embedding for a search query (used during retrieval)
   */
  async generateQueryEmbedding(query: string): Promise<number[]> {
    if (!env.mistralApiKey) {
      throw new Error("MISTRAL_API_KEY is not configured");
    }

    if (!query || query.trim().length === 0) {
      throw new Error("Query text cannot be empty");
    }

    return this.generateEmbedding(query);
  }

  /**
   * Core embedding generation method
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch("https://api.mistral.ai/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.mistralApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.mistralEmbedModel,
        input: [text],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Mistral embedding request failed with status ${response.status}: ${errorText}`
      );
    }

    const payload = (await response.json()) as EmbeddingResponse;
    const embedding = payload.data?.[0]?.embedding;

    if (
      !Array.isArray(embedding) ||
      embedding.length !== env.embeddingDimension ||
      embedding.some((value) => typeof value !== "number" || !Number.isFinite(value))
    ) {
      throw new Error("Mistral returned an invalid embedding vector");
    }

    return embedding;
  }
}
