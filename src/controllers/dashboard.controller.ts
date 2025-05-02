import { getDashboardList } from "../services/dashboard.service";
import asyncRequestHandler from "../utils/asyncRequestHandler";

export const getDashboardHandler = asyncRequestHandler(async (req, res) => {
  // call service
  const dashboardList = getDashboardList();
  // response
  res.status(200).json(dashboardList);
});
