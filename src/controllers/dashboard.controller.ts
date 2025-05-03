import {
  getDashboardList,
  getDashboardOverview,
  getProductsList,
} from "../services/dashboard.service";
import asyncRequestHandler from "../utils/asyncRequestHandler";
import { OK } from "../utils/httpStatus";

export const getDashboardHandler = asyncRequestHandler(async (req, res) => {
  // call service
  const dashboardList = getDashboardList();
  // response
  res.status(OK).json(dashboardList);
});

export const getProductsListHandler = asyncRequestHandler(async (req, res) => {
  // call service
  const products = await getProductsList();
  // response
  res.status(OK).json(products);
});

export const getDashboardOverviewHandler = asyncRequestHandler(
  async (req, res) => {
    // call service
    const dashboardOverview = await getDashboardOverview();
    // response
    res.status(OK).json(dashboardOverview);
  }
);
