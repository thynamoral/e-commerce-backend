import { loadEnvVariables } from "../configs/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

loadEnvVariables();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

pool.on("error", (err) => {
  console.error("Database connection pool error:", err);
});

export const db = drizzle({client: pool});

export async function connectDB() {
  try {
    await db.execute("SELECT 1"); 
    console.log("Database connected successfully!");
  } catch (error: any) {
      throw new Error("Database connection failed!");
  }
}
