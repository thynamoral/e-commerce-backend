import cors from "cors";
import { NODE_ENV, FRONTEND_URL, FRONTEND_URL_PRODUCTION } from "./env.config";

const corsOptions = {
  origin: NODE_ENV === "development" ? FRONTEND_URL : FRONTEND_URL_PRODUCTION,
  credentials: true,
};

export default cors(corsOptions);
