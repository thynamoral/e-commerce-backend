import { Router } from "express";
import {
  createProductHandler,
  deleteProductHandler,
  getCurrentProductHandler,
  getProductsHandler,
  updateProductHandler,
} from "../controllers/product.controller";
import authenticate from "../middlewares/authenticate";
import authorize from "../middlewares/authorize";

const productRouter = Router();

// public routes
productRouter.get("/", getProductsHandler);
productRouter.get("/:id", getCurrentProductHandler);

// protected routes
productRouter.post(
  "/",
  authenticate,
  authorize(["admin"]),
  createProductHandler
);
productRouter.put(
  "/:id",
  authenticate,
  authorize(["admin"]),
  updateProductHandler
);
productRouter.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  deleteProductHandler
);

export default productRouter;
