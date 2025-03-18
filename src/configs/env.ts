import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

export function loadEnvVariables() {
  // Load base .env
  const baseEnv = dotenv.config();
  dotenvExpand.expand(baseEnv);

  console.log(`Environment loaded: ${process.env.NODE_ENV}`);
}
