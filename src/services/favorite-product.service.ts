import db from "../configs/db.config";
import { FavoriteProduct } from "../entities/FavoriteProduct.entity";
import { assertAppError } from "../utils/assertAppError";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../utils/httpStatus";

type FavoriteProductParams = (
  user_id: string,
  product_id: string
) => Promise<any>;

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

export const deleteFavoriteProduct: FavoriteProductParams = async (
  user_id,
  product_id
) => {
  // delete favorite product
  const { rowCount } = await db.query(
    "DELETE FROM favorite_products WHERE user_id = $1 AND product_id = $2",
    [user_id, product_id]
  );
  assertAppError(
    rowCount === 1,
    "Failed to delete favorite product",
    INTERNAL_SERVER_ERROR
  );
};

export const getUserFavoriteProducts = async (user_id: string) => {
  // find favorite products by user_id
  const { rows: favoriteProducts } = await db.query<FavoriteProduct>(
    `
    SELECT products.product_id, products.product_name, products.price, products.slug AS product_slug,
    categories.category_id, categories.category_name, categories.slug AS category_slug
    FROM favorite_products
    INNER JOIN products ON favorite_products.product_id = products.product_id
    INNER JOIN categories ON products.category_id = categories.category_id
    WHERE favorite_products.user_id = $1
    `,
    [user_id]
  );
  return favoriteProducts;
};
