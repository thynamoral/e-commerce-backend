import { loadEnvVariables } from "./configs/env";
import express, { Request, Response } from "express";

loadEnvVariables();

const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json("Hello world!");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running at ${process.env.API_URL}!`);
});
