import { ResumeIngestionService } from "../src/modules/ingestion/services/ResumeIngestionService";

describe("resume ingestion service", () => {
  it("exposes the complete ingestion operation", () => {
    expect(typeof new ResumeIngestionService().ingestResume).toBe("function");
  });
});