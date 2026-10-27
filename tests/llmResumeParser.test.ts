import { LLMResumeParser } from "../src/modules/ingestion/services/LLMResumeParser";

describe("LLM resume parser", () => {
  it("rejects an invalid schema returned by the model", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({
        choices: [{ message: { content: JSON.stringify({ skills: "not-an-array" }) } }],
      }), { status: 200 }),
    );

    await expect(new LLMResumeParser().parseResume("resume text")).rejects.toThrow(
      "LLM parser returned invalid skills",
    );

    fetchMock.mockRestore();
  });
});