import { Router } from "express";
import {
  getDashboardHandler,
  getProductsListHandler,
} from "../controllers/dashboard.controller";

const dashboardRouter = Router();

dashboardRouter.get("/", getDashboardHandler);
dashboardRouter.get("/products", getProductsListHandler);

export default dashboardRouter;
