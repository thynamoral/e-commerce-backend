import { Router } from "express";
import {
  createProductHandler,
  getCurrentProductHandler,
  getProductsHandler,
} from "../controllers/product.controller";

const productRouter = Router();

productRouter.post("/", createProductHandler);
productRouter.get("/", getProductsHandler);
productRouter.get("/:id", getCurrentProductHandler);

export default productRouter;
