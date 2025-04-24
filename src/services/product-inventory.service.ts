import { z } from "zod";
import {
  createProductInventorySchema,
  updateProductInventorySchema,
} from "../validation-schema/product-inventory.schema";
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

export const getCurrentProductInventory = async (id: string) => {
  // find product inventory by id
  const {
    rows: [productInventory],
  } = await db.query<ProductInventory>(
    "SELECT * FROM product_inventories WHERE product_inventories.product_id = $1",
    [id]
  );
  assertAppError(productInventory, "Product inventory not found", NOT_FOUND);
  return productInventory;
};

export const updateProductInventory = async (
  product_id: string,
  updateProductInventoryPayload: z.infer<typeof updateProductInventorySchema>
) => {
  // find product inventory by id
  const {
    rows: [existedProductInventory],
  } = await db.query<ProductInventory>(
    "SELECT * FROM product_inventories WHERE product_id = $1",
    [product_id]
  );
  assertAppError(
    existedProductInventory,
    "Product inventory not found",
    NOT_FOUND
  );

  // update product inventory
  const { stock_quantity, sold_out } = updateProductInventoryPayload;
  const {
    rows: [updatedProductInventory],
    rowCount: updatedProductInventoryCount,
  } = await db.query<ProductInventory>(
    "UPDATE product_inventories SET stock_quantity = $1, sold_out = $2 WHERE product_id = $3",
    [stock_quantity, sold_out, product_id]
  );
  assertAppError(
    updatedProductInventoryCount === 1,
    "Failed to update product inventory",
    INTERNAL_SERVER_ERROR
  );
  return updatedProductInventory;
};
