import { EmbeddingService } from "../src/modules/ingestion/services/EmbeddingService";

describe("embedding service", () => {
  it("builds embedding text with resume context", () => {
    const text = new EmbeddingService().buildEmbeddingText({
      name: "Rajesh Mohan Kumar",
      role: "Test Architect",
      skills: ["RAG", "Python"],
      company: "Testleaf",
      experienceSummary: "QA architecture",
      rawText: "Resume text",
    });

    expect(text).toContain("Rajesh Mohan Kumar");
    expect(text).toContain("RAG, Python");
    expect(text).toContain("Resume text");
  });

  it("rejects a non-numeric or wrong-sized vector", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: [{ embedding: [0.1, "invalid"] }] }), { status: 200 }),
    );

    await expect(new EmbeddingService().generateResumeEmbedding({
      skills: [],
      rawText: "Resume text",
    })).rejects.toThrow("invalid embedding vector");

    fetchMock.mockRestore();
  });
});