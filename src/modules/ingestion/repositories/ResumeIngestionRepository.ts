import { ObjectId } from "mongodb";
import { getDatabase } from "../../../config/database";
import { env } from "../../../config/env";
import { ParsedResume } from "../types/ingestion.types";

export type StoredResume = {
	_id?: ObjectId;
	fileName: string;
	rawText: string;
	embedding: number[];
	embeddingModel: string;
	embeddingDimension: number;
	createdAt: Date;
	updatedAt: Date;
} & ParsedResume;

export class ResumeIngestionRepository {
	async storeResume(
		fileName: string,
		resume: ParsedResume,
		rawText: string,
		embedding: number[],
	): Promise<string> {
		const database = await getDatabase();
		const now = new Date();
		const document: StoredResume = {
			fileName,
			rawText,
			...resume,
			embedding,
			embeddingModel: env.mistralEmbedModel,
			embeddingDimension: embedding.length,
			createdAt: now,
			updatedAt: now,
		};

		const result = await database.collection<StoredResume>("resumes").insertOne(document);
		return result.insertedId.toHexString();
	}
}