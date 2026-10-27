import { SKILLS } from "../src/config/skills";
import { escapeRegex } from "../src/modules/ingestion/utils/regex";

describe("resume skills dictionary", () => {
  it("contains the documented skills", () => {
    expect(SKILLS).toContain("Selenium");
    expect(SKILLS).toContain("MCP (Model Context Protocol)");
  });

  it("escapes regex characters in skill names", () => {
    const pattern = new RegExp(escapeRegex("C#"), "i");

    expect(pattern.test("C# automation")).toBe(true);
    expect(pattern.test("Csharp automation")).toBe(false);
  });
});