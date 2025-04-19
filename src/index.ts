import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { PORT } from "./configs/env.config";
import errorHandlder from "./utils/errorHandler";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(errorHandlder);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
