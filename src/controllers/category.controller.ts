import {
  createCategory,
  deleteCategory,
  getCategories,
  getCurrentCategory,
  updateCategory,
} from "../services/category.service";
import asyncRequestHandler from "../utils/asyncRequestHandler";
import { CREATED, OK } from "../utils/httpStatus";
import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from "../validation-schema/category.schema";

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
  res.status(OK).json(categories);
});

export const getCurrentCategoryHandler = asyncRequestHandler(
  async (req, res) => {
    // get params and validate id
    const id = categoryIdSchema.parse(req.params.id);
    // call service
    const product = await getCurrentCategory(id);
    // response
    res.status(OK).json(product);
  }
);

export const updateCategoryHandler = asyncRequestHandler(async (req, res) => {
  // get params and validate id
  const id = categoryIdSchema.parse(req.params.id);
  const updateProductPayload = updateCategorySchema.parse(req.body);
  // call service
  await updateCategory(id, updateProductPayload);
  // response
  res.status(OK).json({ message: "Category updated successfully" });
});

export const deleteCategoryHandler = asyncRequestHandler(async (req, res) => {
  // get params and validate id
  const id = categoryIdSchema.parse(req.params.id);
  // call service
  await deleteCategory(id);
  // response
  res.status(OK).json({ message: "Category deleted successfully" });
});
