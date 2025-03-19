import { loadEnvVariables } from "./configs/env";
import express, { Request, Response } from "express";
import authRouter from "./resources/auth/authRoute";
import cookieParser from "cookie-parser";
import passport from "passport";
import { configurePassport } from "./configs/passport";
import { connectDB } from "./db";

loadEnvVariables();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

configurePassport();

// auth routes
app.use("/api/auth", authRouter);

app.get("/api/test", (req: Request, res: Response) => {
  res.json([{ name: "test1" }, { name: "test2" }, { name: "test3" }]);
});

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
