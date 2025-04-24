import { Router } from "express";
import {
  createFavoriteProductHandler,
  deleteFavoriteProductHandler,
  getUserFavoriteProductsHandler,
} from "../controllers/favorite-product.controller";

const favoriteProductRouter = Router();

favoriteProductRouter.post("/", createFavoriteProductHandler);
favoriteProductRouter.delete("/", deleteFavoriteProductHandler);
favoriteProductRouter.get("/", getUserFavoriteProductsHandler);

export default favoriteProductRouter;
