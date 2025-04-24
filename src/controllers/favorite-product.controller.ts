import { createFavoriteProduct } from "../services/favorite-product.service";
import asyncRequestHandler from "../utils/asyncRequestHandler";
import { CREATED } from "../utils/httpStatus";
import { productIdSchema } from "../validation-schema/product.schema";

export const createFavoriteProductHandler = asyncRequestHandler(
  async (req, res) => {
    // get user_id from request
    const user_id = req.user_id!;
    // get product_id from request
    const { id: product_id } = productIdSchema.parse({
      id: req.body.product_id,
    });
    // create favorite product
    await createFavoriteProduct(user_id, product_id);
    // response
    res
      .status(CREATED)
      .json({ message: "Favorite product created successfully" });
  }
);
