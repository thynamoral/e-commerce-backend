import { z } from "zod";

export const productInventoryIdSchema = z.string().uuid();

export const createProductInventorySchema = z.object({
  product_id: z.string().uuid(),
  stock_quantity: z.number().default(0),
  sold_out: z.number().default(0),
});

export const updateProductInventorySchema = createProductInventorySchema;
