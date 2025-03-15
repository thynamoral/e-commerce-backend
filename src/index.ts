import express, { Request, Response } from "express";
import { loadEnvVariables } from "./configs/env";

loadEnvVariables();

const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json("Hello world!");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}!`);
});
