import { z } from "zod";
import { productIdSchema } from "./product.schema";

export const createCategorySchema = z.object({
  category_name: z.string().min(1).max(255),
});

export const categoryIdSchema = z.string().uuid();

export const updateCategorySchema = createCategorySchema;
