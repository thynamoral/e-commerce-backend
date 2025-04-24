import { Router } from "express";
import {
  createProductHandler,
  deleteProductHandler,
  getCurrentProductHandler,
  getProductsHandler,
  updateProductHandler,
} from "../controllers/product.controller";

const productRouter = Router();

productRouter.post("/", createProductHandler);
productRouter.get("/", getProductsHandler);
productRouter.get("/:id", getCurrentProductHandler);
productRouter.put("/:id", updateProductHandler);
productRouter.delete("/:id", deleteProductHandler);

export default productRouter;
