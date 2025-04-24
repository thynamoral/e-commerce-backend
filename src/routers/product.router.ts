import { Router } from "express";
import {
  createProductHandler,
  getProductsHandler,
} from "../controllers/product.controller";

const productRouter = Router();

productRouter.post("/", createProductHandler);
productRouter.get("/", getProductsHandler);

export default productRouter;
