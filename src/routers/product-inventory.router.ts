import { Router } from "express";
import {
  createProductInventoryHandler,
  getCurrentProductInventoryHandler,
} from "../controllers/product-inventory.controller";

const productInventoryRouter = Router();

productInventoryRouter.post("/", createProductInventoryHandler);
productInventoryRouter.get("/:id", getCurrentProductInventoryHandler);

export default productInventoryRouter;
