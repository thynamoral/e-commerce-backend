import { z } from "zod";
import { createCategorySchema } from "../validation-schema/category.schema";
import { generateUniqueSlug } from "../utils/slug";
import db from "../configs/db.config";
import { Category } from "../entities/Category.entity";
import { assertAppError } from "../utils/assertAppError";
import { INTERNAL_SERVER_ERROR } from "../utils/httpStatus";

export const createCategory = async (
  createCategoryPayload: z.infer<typeof createCategorySchema>
) => {
  // generate slug
  const slug = await generateUniqueSlug(
    createCategoryPayload.category_name,
    "categories"
  );
  // create category
  const {
    rows: [createdCategory],
    rowCount,
  } = await db.query<Category>(
    "INSERT INTO categories (category_name, slug) VALUES ($1, $2) RETURNING *",
    [createCategoryPayload.category_name, slug]
  );
  assertAppError(
    rowCount === 1,
    "Failed to create category",
    INTERNAL_SERVER_ERROR
  );
};
