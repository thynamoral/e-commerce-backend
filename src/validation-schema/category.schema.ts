import { z } from "zod";

export const createCategorySchema = z.object({
  category_name: z.string().min(1).max(255),
});
