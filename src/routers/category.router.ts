import { Router } from "express";
import {
  createCategoryHandler,
  deleteCategoryHandler,
  getCategoriesHandler,
  getCurrentCategoryHandler,
  updateCategoryHandler,
} from "../controllers/category.controller";
import authenticate from "../middlewares/authenticate";
import authorize from "../middlewares/authorize";

const categoryRouter = Router();

// public routes
categoryRouter.get("/", getCategoriesHandler);
categoryRouter.get(
  "/:id",
  authenticate,
  authorize(["admin"]),
  getCurrentCategoryHandler
);

// protected routes
categoryRouter.post(
  "/",
  authenticate,
  authorize(["admin"]),
  createCategoryHandler
);
categoryRouter.put(
  "/:id",
  authenticate,
  authorize(["admin"]),
  updateCategoryHandler
);
categoryRouter.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  deleteCategoryHandler
);

export default categoryRouter;
