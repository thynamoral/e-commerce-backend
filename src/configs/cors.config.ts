import { CorsOptions } from "cors";
import { FRONTEND_URL, FRONTEND_URL_PRODUCTION } from "./env.config";

const allowedOrigins = [FRONTEND_URL, FRONTEND_URL_PRODUCTION];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
