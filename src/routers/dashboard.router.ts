import { Router } from "express";
import {
  getDashboardHandler,
  getDashboardOverviewHandler,
  getProductsListHandler,
} from "../controllers/dashboard.controller";

const dashboardRouter = Router();

dashboardRouter.get("/", getDashboardHandler);
dashboardRouter.get("/overview", getDashboardOverviewHandler);
dashboardRouter.get("/products", getProductsListHandler);

export default dashboardRouter;
