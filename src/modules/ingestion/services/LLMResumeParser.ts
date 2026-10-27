import { env } from "../../../config/env";
import { ParsedResume } from "../types/ingestion.types";

type ChatCompletionResponse = {
	choices?: Array<{ message?: { content?: string }}>;
};

export class LLMResumeParser {
	async parseResume(rawText: string): Promise<ParsedResume> {
		if (!env.groqApiKey) {
			throw new Error("GROQ_API_KEY is not configured");
		}

		const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${env.groqApiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: env.groqModel,
				temperature: 0,
				response_format: { type: "json_object" },
				messages: [
					{
						role: "system",
						content: "Extract only evidence from the resume. Return JSON with optional name, email, phone, location, company, role, education, totalExperience, relevantExperience, jobTitles, experienceSummary, and skills. Do not invent values.",
					},
					{ role: "user", content: rawText },
				],
			}),
		});

		if (!response.ok) {
			throw new Error(`LLM parser request failed with status ${response.status}`);
		}

		const completion = (await response.json()) as ChatCompletionResponse;
		const content = completion.choices?.[0]?.message?.content;

		if (!content) {
			throw new Error("LLM parser returned empty content");
		}

		return this.validateResponse(JSON.parse(content));
	}

	private validateResponse(value: unknown): ParsedResume {
		if (!value || typeof value !== "object") {
			throw new Error("LLM parser returned an invalid object");
		}

		const candidate = value as Record<string, unknown>;
		if (candidate.skills !== undefined && !Array.isArray(candidate.skills)) {
			throw new Error("LLM parser returned invalid skills");
		}

		const optionalStringFields = [
			"name", "email", "phone", "location", "company", "role",
			"education", "experienceSummary",
		];
		for (const field of optionalStringFields) {
			if (candidate[field] !== undefined && typeof candidate[field] !== "string") {
				throw new Error(`LLM parser returned invalid ${field}`);
			}
		}

		for (const field of ["totalExperience", "relevantExperience"]) {
			if (candidate[field] !== undefined && typeof candidate[field] !== "number") {
				throw new Error(`LLM parser returned invalid ${field}`);
			}
		}

		return {
			...(candidate as Partial<ParsedResume>),
			skills: Array.isArray(candidate.skills) ? candidate.skills.filter(
				(skill): skill is string => typeof skill === "string",
			) : [],
		};
	}
}