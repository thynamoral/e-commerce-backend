import {
  createCategory,
  getCategories,
  getCurrentProduct,
} from "../services/category.service";
import asyncRequestHandler from "../utils/asyncRequestHandler";
import { CREATED, OK } from "../utils/httpStatus";
import {
  categoryIdSchema,
  createCategorySchema,
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
    const { id } = categoryIdSchema.parse({ id: req.params.id });
    // call service
    const product = await getCurrentProduct(id);
    // response
    res.status(OK).json(product);
  }
);

// export const updateCategoryHandler = asyncRequestHandler(
//   async (req, res) => {}
// );

// export const deleteCategoryHandler = asyncRequestHandler(
//   async (req, res) => {}
// );
