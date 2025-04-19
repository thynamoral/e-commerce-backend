import { registerAccountSchema } from "../validation-schema/auth.schema";
import asyncRequestHandler from "../utils/asyncRequestHandler";
import { registerAccount } from "../services/auth.service";
import { CREATED } from "../utils/httpStatus";

export const registerAccountHandler = asyncRequestHandler(async (req, res) => {
  // validation body
  const { email, password } = registerAccountSchema.parse(req.body);
  // call service
  await registerAccount({ email, password });
  // response
  res.status(CREATED).json({ message: "Account created successfully" });
});
