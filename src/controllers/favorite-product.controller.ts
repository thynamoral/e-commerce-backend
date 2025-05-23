import {
  createFavoriteProduct,
  deleteFavoriteProduct,
  getUserFavoriteProducts,
} from "../services/favorite-product.service";
import asyncRequestHandler from "../utils/asyncRequestHandler";
import { CREATED, OK } from "../utils/httpStatus";
import { productIdSchema } from "../validation-schema/product.schema";

export const createFavoriteProductHandler = asyncRequestHandler(
  async (req, res) => {
    // get user_id from request
    const user_id = req.user_id!;
    // get product_id from request
    const { id: product_id } = productIdSchema.parse({
      id: req.body.product_id,
    });
    // call service
    await createFavoriteProduct(user_id, product_id);
    // response
    res
      .status(CREATED)
      .json({ message: "Favorite product created successfully" });
  }
);

export const deleteFavoriteProductHandler = asyncRequestHandler(
  async (req, res) => {
    // get user_id from request
    const user_id = req.user_id!;
    // get product_id from request
    const { id: product_id } = productIdSchema.parse({
      id: req.body.product_id,
    });
    // call service
    await deleteFavoriteProduct(user_id, product_id);
    // response
    res.status(OK).json({ message: "Favorite product deleted successfully" });
  }
);

export const getUserFavoriteProductsHandler = asyncRequestHandler(
  async (req, res) => {
    // get user_id from request
    const user_id = req.user_id!;
    // call service
    const favoriteProducts = await getUserFavoriteProducts(user_id);
    // response
    res
      .status(OK)
      .json(
        favoriteProducts.map((product) => ({
          ...product,
          price: Number(product.price),
        }))
      );
  }
);
