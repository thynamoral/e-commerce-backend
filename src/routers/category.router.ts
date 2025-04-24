import { Router } from "express";
import {
  createCategoryHandler,
  deleteCategoryHandler,
  getCategoriesHandler,
  getCurrentCategoryHandler,
  updateCategoryHandler,
} from "../controllers/category.controller";

const categoryRouter = Router();

// protected routes
categoryRouter.post("/", createCategoryHandler);
categoryRouter.get("/", getCategoriesHandler);
categoryRouter.get("/:id", getCurrentCategoryHandler);
categoryRouter.put("/:id", updateCategoryHandler);
categoryRouter.delete("/:id", deleteCategoryHandler);

export default categoryRouter;
