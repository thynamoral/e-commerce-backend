import { z } from "zod";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validation-schema/category.schema";
import { generateUniqueSlug } from "../utils/slug";
import db from "../configs/db.config";
import { Category } from "../entities/Category.entity";
import { assertAppError } from "../utils/assertAppError";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "../utils/httpStatus";

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

export const getCategories = async () => {
  const { rows: categories } = await db.query<Category>(
    "SELECT * FROM categories ORDER BY createdat DESC"
  );
  assertAppError(categories.length > 0, "Categories not found", NOT_FOUND);
  return categories;
};

export const getCurrentCategory = async (id: string) => {
  const {
    rows: [product],
  } = await db.query<Category>(
    `
    SELECT * FROM categories
    WHERE categories.category_id = $1
    `,
    [id]
  );
  assertAppError(product, "Product not found", NOT_FOUND);
  return product;
};

export const updateCategory = async (
  id: string,
  updateCategoryPayload: z.infer<typeof updateCategorySchema>
) => {
  // find category by id
  const {
    rows: [existedCategory],
  } = await db.query<Category>(
    `
      SELECT * FROM categories WHERE category_id = $1
    `,
    [id]
  );
  assertAppError(existedCategory, "Category not found", NOT_FOUND);

  // update category
  const { category_name } = updateCategoryPayload;
  const newCategorySlug = await generateUniqueSlug(category_name, "categories");
  const {
    rows: [updatedCategory],
    rowCount,
  } = await db.query<Category>(
    `
      UPDATE categories
      SET category_name = $1,
      slug = $2
      WHERE category_id = $3
      RETURNING *
    `,
    [category_name, newCategorySlug, id]
  );
  assertAppError(
    rowCount === 1,
    "Failed to update category",
    INTERNAL_SERVER_ERROR
  );
  return updatedCategory;
};
