import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { PORT } from "./configs/env.config";
import errorHandlder from "./utils/errorHandler";
import { connectDB } from "./configs/db.config";
import cors from "cors";
import authenticate from "./middlewares/authenticate";
import authorize from "./middlewares/authorize";
import authRouter from "./routers/auth.router";
import userRouter from "./routers/user.router";
import productRouter from "./routers/product.router";
import categoryRouter from "./routers/category.router";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
  })
);

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/products", productRouter);
app.use("/categories", authenticate, authorize(["admin"]), categoryRouter);

app.use(errorHandlder);

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);
});
