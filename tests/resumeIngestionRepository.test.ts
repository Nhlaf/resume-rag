import { ResumeIngestionRepository } from "../src/modules/ingestion/repositories/ResumeIngestionRepository";

describe("resume ingestion repository", () => {
  it("exposes the resume storage operation", () => {
    expect(typeof new ResumeIngestionRepository().storeResume).toBe("function");
  });
});