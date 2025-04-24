import { createCategory, getCategories } from "../services/category.service";
import asyncRequestHandler from "../utils/asyncRequestHandler";
import { CREATED } from "../utils/httpStatus";
import { createCategorySchema } from "../validation-schema/category.schema";

export const createCategoryHandler = asyncRequestHandler(async (req, res) => {
  // validate body
  const createProductPayload = createCategorySchema.parse(req.body);
  // call service
  await createCategory(createProductPayload);
  // response
  res.status(CREATED).json({ message: "Category created successfully" });
});

export const getCategoriesHandler = asyncRequestHandler(async (req, res) => {
  // call service
  const categories = await getCategories();
  // response
});

// export const getCurrentCategoryHandler = asyncRequestHandler(
//   async (req, res) => {}
// );

// export const updateCategoryHandler = asyncRequestHandler(
//   async (req, res) => {}
// );

// export const deleteCategoryHandler = asyncRequestHandler(
//   async (req, res) => {}
// );
