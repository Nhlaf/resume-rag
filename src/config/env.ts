import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  mongodbUri: process.env.MONGODB_URI,
  mongodbDbName: process.env.MONGODB_DB_NAME ?? "resume_rag",
  maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB ?? 5),
  useLlmParser: process.env.USE_LLM_PARSER === "true",
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL ?? "meta-llama/llama-4-scout-17b-16e-instruct",
  mistralApiKey: process.env.MISTRAL_API_KEY,
  mistralEmbedModel: process.env.MISTRAL_EMBED_MODEL ?? "mistral-embed",
  embeddingDimension: Number(process.env.EMBEDDING_DIMENSION ?? 1024),
};