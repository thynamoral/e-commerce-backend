import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import errorHandlder from "./utils/errorHandler";
import { connectDB } from "./configs/db.config";
import { corsOptions } from "./configs/cors.config";
import { FRONTEND_URL_PRODUCTION, PORT } from "./configs/env.config";
import authenticate from "./middlewares/authenticate";
import authorize from "./middlewares/authorize";
import authRouter from "./routers/auth.router";
import userRouter from "./routers/user.router";
import productRouter from "./routers/product.router";
import categoryRouter from "./routers/category.router";
import favoriteProductRouter from "./routers/favorite-product.router";
import productInventoryRouter from "./routers/product-inventory.router";
import dashboardRouter from "./routers/dashboard.router";

const app = express();

app.use((req, res, next) => {
  // debug request origin
  console.log("Incoming request origin", req.headers.origin);
  console.log("Allow origin", FRONTEND_URL_PRODUCTION);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/products", productRouter);
app.use("/categories", categoryRouter);
app.use("/favorite-products", authenticate, favoriteProductRouter);
app.use(
  "/product-inventories",
  authenticate,
  authorize(["admin"]),
  productInventoryRouter
);
app.use("/dashboard", authenticate, authorize(["admin"]), dashboardRouter);

app.use(errorHandlder);

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);
});
