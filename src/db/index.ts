import { loadEnvVariables } from "../configs/env";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

loadEnvVariables();

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });

export async function connectDB() {
  try {
    await db.execute("SELECT 1");
    console.log("Database connected successfully!");
  } catch (error: any) {
    throw new Error("Database connection failed!");
  }
}
