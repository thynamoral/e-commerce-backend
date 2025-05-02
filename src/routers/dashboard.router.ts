import { Router } from "express";
import { getDashboardHandler } from "../controllers/dashboard.controller";

const dashboardRouter = Router();

dashboardRouter.get("/", getDashboardHandler);

export default dashboardRouter;
