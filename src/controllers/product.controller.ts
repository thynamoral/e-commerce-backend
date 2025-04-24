import { createProduct } from "../services/product.service";
import asyncRequestHandler from "../utils/asyncRequestHandler";
import { CREATED } from "../utils/httpStatus";
import { createProductSchema } from "../validation-schema/product.schema";

export const createProductHandler = asyncRequestHandler(async (req, res) => {
  // validation body
  const createProductPayload = createProductSchema.parse(req.body);
  // call service
  await createProduct(createProductPayload);
  // response
  res.status(CREATED).json({ message: "Product created successfully" });
});
