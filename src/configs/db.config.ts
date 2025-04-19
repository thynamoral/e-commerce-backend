import { neon } from "@neondatabase/serverless";
import { DATABASE_URL } from "./env.config";
import { Pool } from "pg";

const db = new Pool({
  connectionString: DATABASE_URL,
});

export const connectDB = async () => {
  try {
    const result = await db.query("SELECT version();");
    if (result.rows.length > 0) {
      console.log("Database connected successfully");
    }
  } catch (error) {
    throw new Error("Database connection failed");
  }
};

export default db;
