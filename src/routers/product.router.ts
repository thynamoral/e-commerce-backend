import { Router } from "express";
import { createProductHandler } from "../controllers/product.controller";

const productRouter = Router();

productRouter.post("/", createProductHandler);

export default productRouter;
