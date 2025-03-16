import { loadEnvVariables } from "./src/configs/env";
import { defineConfig } from "drizzle-kit";

loadEnvVariables();

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
