import { z } from "zod";
import { createProductSchema } from "../validation-schema/product.schema";
import db from "../configs/db.config";
import { Product } from "../entities/Product.entity";
import { assertAppError } from "../utils/assertAppError";
import { INTERNAL_SERVER_ERROR } from "../utils/httpStatus";
import { generateUniqueSlug } from "../utils/slug";

export const createProduct = async (
  createProductPayload: z.infer<typeof createProductSchema>
) => {
  const { product_name, price, category_id } = createProductPayload;
  const productSlug = await generateUniqueSlug(product_name, "products");
  const {
    rows: [createdProduct],
    rowCount,
  } = await db.query<Product>(
    "INSERT INTO products (product_name, price, slug, category_id) VALUES ($1, $2, $3, $4) RETURNING *",
    [product_name, price, productSlug, category_id]
  );
  assertAppError(
    rowCount === 1,
    "Failed to create product",
    INTERNAL_SERVER_ERROR
  );
  return createdProduct;
};
