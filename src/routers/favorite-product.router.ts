import { Router } from "express";
import { createFavoriteProductHandler } from "../controllers/favorite-product.controller";

const favoriteProductRouter = Router();

favoriteProductRouter.post("/", createFavoriteProductHandler);

export default favoriteProductRouter;
