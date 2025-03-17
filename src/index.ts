import { loadEnvVariables } from "./configs/env";
import express, { Request, Response } from "express";
import authRouter from "./resources/auth/authRoute";
import cookieParser from "cookie-parser";
import passport from "passport";
import { configurePassport } from "./configs/passport";

loadEnvVariables();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

configurePassport();

// auth routes
app.use("/auth", authRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server running at ${process.env.API_URL}!`);
});
