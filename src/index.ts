import { loadEnvVariables } from "./configs/env";
import express, { Request, Response } from "express";
import authRouter from "./resources/auth/authRoute";
import cookieParser from "cookie-parser";
import { connectDB } from "./db";
import cors from "cors";
import { corsOptions } from "./configs/cors";

loadEnvVariables();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// auth routes
app.use("/api/auth", authRouter);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT!, async () => {
      console.log(`Server running at ${process.env.API_URL!}!`);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

startServer();
