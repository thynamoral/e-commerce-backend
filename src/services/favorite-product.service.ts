import db from "../configs/db.config";
import { FavoriteProduct } from "../entities/FavoriteProduct.entity";
import { assertAppError } from "../utils/assertAppError";
import { INTERNAL_SERVER_ERROR } from "../utils/httpStatus";

type FavoriteProductParams = (
  user_id: string,
  product_id: string
) => Promise<FavoriteProduct>;

export const createFavoriteProduct: FavoriteProductParams = async (
  user_id,
  product_id
) => {
  // create favorite product
  const {
    rows: [createdFavoriteProduct],
    rowCount,
  } = await db.query<FavoriteProduct>(
    "INSERT INTO favorite_products (user_id, product_id) VALUES ($1, $2) RETURNING *",
    [user_id, product_id]
  );
  assertAppError(
    rowCount === 1,
    "Failed to create favorite product",
    INTERNAL_SERVER_ERROR
  );
  return createdFavoriteProduct;
};
