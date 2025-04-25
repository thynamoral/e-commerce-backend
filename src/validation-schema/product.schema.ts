import { z } from "zod";

export const productIdSchema = z.object({
  id: z.string().uuid(),
});

export const createProductSchema = z.object({
  product_name: z.string().min(1).max(255),
  price: z.string(),
  category_id: z.string().optional(),
});

export const updateProductSchema = createProductSchema;
