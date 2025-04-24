import {
  createProductInventory,
  getCurrentProductInventory,
  updateProductInventory,
} from "../services/product-inventory.service";
import asyncRequestHandler from "../utils/asyncRequestHandler";
import { CREATED, OK } from "../utils/httpStatus";
import {
  createProductInventorySchema,
  productInventoryIdSchema,
  updateProductInventorySchema,
} from "../validation-schema/product-inventory.schema";

export const createProductInventoryHandler = asyncRequestHandler(
  async (req, res) => {
    // validation body
    const createProductInventoryPayload = createProductInventorySchema.parse(
      req.body
    );
    // call service
    await createProductInventory(createProductInventoryPayload);
    // response
    res
      .status(CREATED)
      .json({ message: "Product inventory created successfully" });
  }
);

export const getCurrentProductInventoryHandler = asyncRequestHandler(
  async (req, res) => {
    // get params and validate id
    const id = productInventoryIdSchema.parse(req.params.id);
    // call service
    const productInventory = await getCurrentProductInventory(id);
    // response
    res.status(OK).json(productInventory);
  }
);

export const updateProductInventoryHandler = asyncRequestHandler(
  async (req, res) => {
    // get params and validate id
    const id = req.params.id;
    const updateProductInventoryPayload = updateProductInventorySchema.parse({
      ...req.body,
      product_id: id,
    });
    // call service
    await updateProductInventory(id, updateProductInventoryPayload);
    // response
    res.status(OK).json({ message: "Product inventory updated successfully" });
  }
);
