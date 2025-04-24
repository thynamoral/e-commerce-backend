import { createProduct, getProducts } from "../services/product.service";
import asyncRequestHandler from "../utils/asyncRequestHandler";
import { CREATED, OK } from "../utils/httpStatus";
import { createProductSchema } from "../validation-schema/product.schema";

export const createProductHandler = asyncRequestHandler(async (req, res) => {
  // validation body
  const createProductPayload = createProductSchema.parse(req.body);
  // call service
  await createProduct(createProductPayload);
  // response
  res.status(CREATED).json({ message: "Product created successfully" });
});

type GetProductsParams = {
  search?: string;
  category?: string;
};

export const getProductsHandler = asyncRequestHandler(async (req, res) => {
  // get params
  const { search, category } = req.query as GetProductsParams;
  // call service
  const products = await getProducts(search, category);
  // response
  res.status(OK).json(products);
});
