import { SKILLS } from "../../../config/skills";
import {
	EMAIL_REGEX,
	EXPERIENCE_REGEX,
	PHONE_REGEX,
	escapeRegex,
} from "../utils/regex";
import { ParsedResume } from "../types/ingestion.types";

const ROLE_PATTERN = /architect|engineer|developer|manager|analyst|tester|lead|consultant|designer/i;
const EDUCATION_PATTERN = /\b(?:B\.?Tech|M\.?Tech|B\.?E|M\.?E|B\.?Sc|M\.?Sc|MBA|Bachelor|Master|Ph\.?D)\b/i;
const COMPANY_PATTERN = /\b(?:private limited|pvt\.?\s*ltd|limited|llp|inc\.?|corp\.?|company|solutions)\b/i;

export class AlgorithmResumeParser {
	parseResume(rawText: string): ParsedResume {
		const lines = rawText
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter(Boolean);
		const parsedResume: ParsedResume = {
			skills: this.detectSkills(rawText),
		};

		const email = rawText.match(EMAIL_REGEX)?.[0];
		const phone = rawText.match(PHONE_REGEX)?.[0];
		const experienceMatch = rawText.match(EXPERIENCE_REGEX);
		const role = lines.find((line) => ROLE_PATTERN.test(line));
		const company = lines.find((line) => COMPANY_PATTERN.test(line));
		const education = lines.find((line) => EDUCATION_PATTERN.test(line));

		if (email) parsedResume.email = email;
		if (phone) parsedResume.phone = phone;
		if (lines[0] && !EMAIL_REGEX.test(lines[0]) && !ROLE_PATTERN.test(lines[0])) {
			parsedResume.name = lines[0];
		}
		if (role) parsedResume.role = role;
		if (company) parsedResume.company = company;
		if (education) parsedResume.education = education;
		if (experienceMatch) parsedResume.totalExperience = Number(experienceMatch[1]);

		return parsedResume;
	}

	private detectSkills(rawText: string): string[] {
		return SKILLS.filter((skill) =>
			new RegExp(
				`(?<![A-Za-z0-9])${escapeRegex(skill)}(?![A-Za-z0-9])`,
				"i",
			).test(rawText),
		);
	}
}