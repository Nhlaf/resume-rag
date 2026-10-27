import { Db, MongoClient } from "mongodb";
import { env } from "./env";

let client: MongoClient | undefined;
let connectionPromise: Promise<MongoClient> | undefined;

export const getDatabase = async (): Promise<Db> => {
  if (!env.mongodbUri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (!client) {
    client = new MongoClient(env.mongodbUri);
  }

  connectionPromise ??= client.connect().catch((error) => {
    connectionPromise = undefined;
    throw error;
  });

  await connectionPromise;
  return client.db(env.mongodbDbName);
};