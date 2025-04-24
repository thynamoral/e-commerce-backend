import { createProductInventory } from "../services/product-inventory.service";
import asyncRequestHandler from "../utils/asyncRequestHandler";
import { CREATED } from "../utils/httpStatus";
import { createProductInventorySchema } from "../validation-schema/product-inventory.schema";

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
