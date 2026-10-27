import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";

export class ResumeParserService {
	async extractTextFromPdf(filePath: string): Promise<string> {
		const fileBuffer = await readFile(filePath);
		const parser = new PDFParse({ data: fileBuffer });

		try {
			const parsedPdf = await parser.getText();
			return parsedPdf.text;
		} finally {
			await parser.destroy();
		}
	}
}