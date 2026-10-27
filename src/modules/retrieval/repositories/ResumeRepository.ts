import type { Collection, Document, ObjectId } from "mongodb";
import { ObjectId as MongoObjectId } from "mongodb";
import { getDatabase } from "../../../config/database";

export interface ResumeDocument {
  _id: ObjectId | string;
  rawText: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  company?: string;
  role?: string;
  education?: string;
  totalExperience?: number;
  relevantExperience?: number;
  skills: string[];
  jobTitles: string[];
  experienceSummary?: string;
  embedding?: number[];
  embeddingModel?: string;
  embeddingDimension?: number;
}

export class ResumeRepository {
  private collection: Collection<Document> | null = null;

  private async getCollection(): Promise<Collection<Document>> {
    if (!this.collection) {
      const database = await getDatabase();
      this.collection = database.collection("resumes");
    }
    return this.collection;
  }

  /**
   * Fetch a resume by ID
   */
  async findById(resumeId: string | ObjectId): Promise<ResumeDocument | null> {
    try {
      const collection = await this.getCollection();
      
      // Convert string to ObjectId if needed
      let queryId: any;
      if (typeof resumeId === "string") {
        // Try to create ObjectId if it looks like a valid ObjectId
        if (MongoObjectId.isValid(resumeId)) {
          queryId = new MongoObjectId(resumeId);
        } else {
          queryId = resumeId;
        }
      } else {
        queryId = resumeId;
      }
      
      const resume = await collection.findOne({ _id: queryId } as any);
      if (!resume) return null;
      
      return {
        ...resume,
        _id: resume._id.toString(),
      } as ResumeDocument;
    } catch (error) {
      console.error("Error finding resume by ID:", error);
      return null;
    }
  }

  /**
   * Fetch multiple resumes by IDs
   */
  async findByIds(resumeIds: (string | ObjectId)[]): Promise<ResumeDocument[]> {
    try {
      const collection = await this.getCollection();
      
      // Convert string IDs to ObjectId if needed
      const queryIds = resumeIds.map(id => {
        if (typeof id === "string" && MongoObjectId.isValid(id)) {
          return new MongoObjectId(id);
        }
        return id;
      });
      
      const resumes = await collection
        .find({ _id: { $in: queryIds } } as any)
        .toArray();
      
      return resumes.map(resume => ({
        ...resume,
        _id: resume._id.toString(),
      })) as ResumeDocument[];
    } catch (error) {
      console.error("Error finding resumes by IDs:", error);
      return [];
    }
  }

  /**
   * Count total resumes
   */
  async count(): Promise<number> {
    try {
      const collection = await this.getCollection();
      return await collection.countDocuments();
    } catch (error) {
      console.error("Error counting resumes:", error);
      return 0;
    }
  }

  /**
   * Get all resumes (with optional limit)
   */
  async findAll(limit?: number): Promise<ResumeDocument[]> {
    try {
      const collection = await this.getCollection();
      const query = collection.find({});
      
      if (limit) {
        query.limit(limit);
      }
      
      const resumes = await query.toArray();
      
      return resumes.map(resume => ({
        ...resume,
        _id: resume._id.toString(),
      })) as ResumeDocument[];
    } catch (error) {
      console.error("Error finding all resumes:", error);
      return [];
    }
  }

  /**
   * Find resumes by filter
   */
  async findByFilter(filter: {
    minYearsExperience?: number;
    skills?: string[];
    location?: string;
    company?: string;
  }): Promise<ResumeDocument[]> {
    try {
      const collection = await this.getCollection();
      const mongoFilter: any = {};

      // Apply experience filter
      if (filter.minYearsExperience !== undefined) {
        mongoFilter.totalExperience = { $gte: filter.minYearsExperience };
      }

      // Apply skills filter (any of the skills)
      if (filter.skills && filter.skills.length > 0) {
        mongoFilter.skills = { $in: filter.skills };
      }

      // Apply location filter
      if (filter.location) {
        mongoFilter.location = { $regex: filter.location, $options: "i" };
      }

      // Apply company filter
      if (filter.company) {
        mongoFilter.company = { $regex: filter.company, $options: "i" };
      }

      const resumes = await collection.find(mongoFilter).toArray();
      
      return resumes.map(resume => ({
        ...resume,
        _id: resume._id.toString(),
      })) as ResumeDocument[];
    } catch (error) {
      console.error("Error finding resumes by filter:", error);
      return [];
    }
  }

  /**
   * BM25 lexical search using MongoDB Atlas Search
   */
  async searchBM25(
    query: string,
    topK: number,
    filters?: { minYearsExperience?: number }
  ): Promise<Array<ResumeDocument & { score: number }>> {
    try {
      const collection = await this.getCollection();

      // Build the Atlas Search aggregation pipeline
      const pipeline: any[] = [
        {
          $search: {
            index: "resume_search_index", // Atlas Search index name
            compound: {
              must: [
                {
                  text: {
                    query: query,
                    path: ["rawText", "skills", "jobTitles", "experienceSummary", "role", "company"],
                    fuzzy: {
                      maxEdits: 1,
                    },
                  },
                },
              ],
            },
          },
        },
        {
          $addFields: {
            score: { $meta: "searchScore" },
          },
        },
      ];

      // Add experience filter if provided
      if (filters?.minYearsExperience !== undefined) {
        pipeline.push({
          $match: {
            totalExperience: { $gte: filters.minYearsExperience },
          },
        });
      }

      // Limit results
      pipeline.push({ $limit: topK });

      const results = await collection.aggregate(pipeline).toArray();

      return results.map((doc) => ({
        ...doc,
        _id: doc._id.toString(),
        score: doc.score || 0,
      })) as Array<ResumeDocument & { score: number }>;
    } catch (error) {
      console.error("BM25 search error:", error);
      // Return empty array on error to allow graceful degradation
      return [];
    }
  }

  /**
   * Vector semantic search using MongoDB Atlas Vector Search
   */
  async searchVector(
    queryEmbedding: number[],
    topK: number,
    filters?: { minYearsExperience?: number }
  ): Promise<Array<ResumeDocument & { vectorScore: number }>> {
    try {
      const collection = await this.getCollection();

      // Build the vector search aggregation pipeline
      const pipeline: any[] = [
        {
          $vectorSearch: {
            index: "vector_index", // Atlas Vector Search index name
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates: topK * 10, // Over-fetch for better recall
            limit: topK,
          },
        },
        {
          $addFields: {
            vectorScore: { $meta: "vectorSearchScore" },
          },
        },
      ];

      // Add experience filter if provided
      if (filters?.minYearsExperience !== undefined) {
        pipeline.push({
          $match: {
            totalExperience: { $gte: filters.minYearsExperience },
          },
        });
      }

      const results = await collection.aggregate(pipeline).toArray();

      return results.map((doc) => ({
        ...doc,
        _id: doc._id.toString(),
        vectorScore: doc.vectorScore || 0,
      })) as Array<ResumeDocument & { vectorScore: number }>;
    } catch (error) {
      console.error("Vector search error:", error);
      // Return empty array on error to allow graceful degradation
      return [];
    }
  }
}
