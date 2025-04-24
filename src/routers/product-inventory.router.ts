import { Router } from "express";
import { createProductInventoryHandler } from "../controllers/product-inventory.controller";

const productInventoryRouter = Router();

productInventoryRouter.post("/", createProductInventoryHandler);

export default productInventoryRouter;
