import { z } from "zod";

export const createProductSchema = z.object({
  product_name: z.string().min(1).max(255),
  price: z.number(),
  category_id: z.string().optional(),
});
