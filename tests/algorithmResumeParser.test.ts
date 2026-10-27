import { AlgorithmResumeParser } from "../src/modules/ingestion/services/AlgorithmResumeParser";

describe("algorithm resume parser", () => {
  it("extracts supported fields without inventing values", () => {
    const parsedResume = new AlgorithmResumeParser().parseResume(
      "Rajesh Mohan Kumar\nTest Architect & Senior Agentic Test Engineer\nTestleaf Software Solutions Private Limited\nB.Tech - Information Technology\n13+ years of experience\nSelenium, Python, RAG",
    );

    expect(parsedResume).toMatchObject({
      name: "Rajesh Mohan Kumar",
      role: "Test Architect & Senior Agentic Test Engineer",
      company: "Testleaf Software Solutions Private Limited",
      education: "B.Tech - Information Technology",
      totalExperience: 13,
      skills: ["Selenium", "Python", "RAG"],
    });
    expect(parsedResume.email).toBeUndefined();
    expect(parsedResume.phone).toBeUndefined();
  });
});