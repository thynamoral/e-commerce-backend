import { z } from "zod";
import { createProductInventorySchema } from "../validation-schema/product-inventory.schema";
import db from "../configs/db.config";
import { Product } from "../entities/Product.entity";
import { assertAppError } from "../utils/assertAppError";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "../utils/httpStatus";
import { ProductInventory } from "../entities/ProductInventory.entity";

export const createProductInventory = async (
  createProductInventoryPayload: z.infer<typeof createProductInventorySchema>
) => {
  const { product_id, stock_quantity, sold_out } =
    createProductInventoryPayload;
  // find a existed product
  const {
    rows: [existedProduct],
  } = await db.query<Product>("SELECT * FROM products WHERE product_id = $1", [
    product_id,
  ]);
  assertAppError(existedProduct, "Product not found", NOT_FOUND);

  // create a product inventory
  const {
    rows: [createdProductInventory],
    rowCount: createdProductInventoryCount,
  } = await db.query<ProductInventory>(
    "INSERT INTO product_inventories (product_id, stock_quantity, sold_out) VALUES ($1, $2, $3) RETURNING *",
    [product_id, stock_quantity, sold_out]
  );
  assertAppError(
    createdProductInventoryCount === 1,
    "Failed to create product inventory",
    INTERNAL_SERVER_ERROR
  );

  return createdProductInventory;
};
