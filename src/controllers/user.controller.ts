import { getCurrentUser } from "../services/user.service";
import asyncRequestHandler from "../utils/asyncRequestHandler";
import { OK } from "../utils/httpStatus";

export const getCurrentUserHandler = asyncRequestHandler(async (req, res) => {
  // call service
  const user = await getCurrentUser(req.user_id!);
  // response
  res.status(OK).json(user);
});
