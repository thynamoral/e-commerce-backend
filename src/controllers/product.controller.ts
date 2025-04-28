import {
  createProduct,
  deleteProduct,
  getCurrentProduct,
  getProducts,
  updateProduct,
} from "../services/product.service";
import asyncRequestHandler from "../utils/asyncRequestHandler";
import { CREATED, OK } from "../utils/httpStatus";
import {
  createProductSchema,
  productIdSchema,
  updateProductSchema,
} from "../validation-schema/product.schema";

export const createProductHandler = asyncRequestHandler(async (req, res) => {
  // validation body
  const createProductPayload = createProductSchema.parse(req.body);
  const files = req.files as Express.Multer.File[];
  // call service
  await createProduct(createProductPayload, files);
  // response
  res.status(CREATED).json({ message: "Product created successfully" });
});

type GetProductsQuery = {
  search?: string;
  category?: string | string[];
};

export const getProductsHandler = asyncRequestHandler(async (req, res) => {
  // get query params
  const { search, category } = req.query as GetProductsQuery;
  let categories: string[] | undefined;

  if (typeof category === "string") {
    categories = [category];
  } else if (Array.isArray(category)) {
    categories = category;
  }
  // call service
  const products = await getProducts(search, categories);
  // response
  res
    .status(OK)
    .json(
      products.map((product) => ({ ...product, price: Number(product.price) }))
    );
});

export const getCurrentProductHandler = asyncRequestHandler(
  async (req, res) => {
    // get params and validate id
    const { id } = productIdSchema.parse({ id: req.params.id });
    // call service
    const product = await getCurrentProduct(id);
    // response
    res.status(OK).json(product);
  }
);

export const updateProductHandler = asyncRequestHandler(async (req, res) => {
  // get params and validate id
  const { id } = productIdSchema.parse({ id: req.params.id });
  const updateProductPayload = updateProductSchema.parse(req.body);
  const files = req.files as Express.Multer.File[];
  // call service
  await updateProduct(id, updateProductPayload, files);
  // response
  res.status(OK).json({ message: "Product updated successfully" });
});

export const deleteProductHandler = asyncRequestHandler(async (req, res) => {
  // get params and validate id
  const { id } = productIdSchema.parse({ id: req.params.id });
  // call service
  await deleteProduct(id);
  // response
  res.status(OK).json({ message: "Product deleted successfully" });
});
