import { Router } from "express";
import {
  createFavoriteProductHandler,
  deleteFavoriteProductHandler,
} from "../controllers/favorite-product.controller";

const favoriteProductRouter = Router();

favoriteProductRouter.post("/", createFavoriteProductHandler);
favoriteProductRouter.delete("/", deleteFavoriteProductHandler);

export default favoriteProductRouter;
