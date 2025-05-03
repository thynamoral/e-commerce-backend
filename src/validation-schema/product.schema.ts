import { string, z } from "zod";

export const productIdSchema = z.object({
  id: z.string().uuid(),
});

export const createProductSchema = z.object({
  product_name: z.string().min(1).max(255),
  price: z.string(),
  category_id: z.string().optional(),
  stock_quantity: z.string(),
});

export const updateProductSchema = createProductSchema.extend({
  delete_image_ids: string().optional(),
});
