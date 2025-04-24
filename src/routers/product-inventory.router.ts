import { Router } from "express";
import {
  createProductInventoryHandler,
  getCurrentProductInventoryHandler,
  updateProductInventoryHandler,
} from "../controllers/product-inventory.controller";

const productInventoryRouter = Router();

productInventoryRouter.post("/", createProductInventoryHandler);
productInventoryRouter.get("/:id", getCurrentProductInventoryHandler);
productInventoryRouter.put("/:id", updateProductInventoryHandler);

export default productInventoryRouter;
