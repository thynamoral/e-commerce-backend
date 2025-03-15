import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

export function loadEnvVariables() {
  // Load base .env
  const baseEnv = dotenv.config();
  dotenvExpand.expand(baseEnv);

  process.env.NODE_ENV = process.env.NODE_ENV || "development";

  // Load environment-specific file
  const envFile = `.env.${process.env.NODE_ENV}`;
  const envConfig = dotenv.config({ path: envFile });
  dotenvExpand.expand(envConfig);

  console.log(`Environment loaded: ${process.env.NODE_ENV || "development"}`);
}
