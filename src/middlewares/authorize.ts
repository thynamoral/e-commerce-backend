import { RequestHandler } from "express";
import { assertAppError } from "../utils/assertAppError";
import { FORBIDDEN } from "../utils/httpStatus";

const authorize =
  (allowedRoles: string[]): RequestHandler =>
  (req, res, next) => {
    const userRole = req.role;
    if (!allowedRoles.includes(userRole!)) {
      assertAppError(
        false,
        "Forbidden: You do not have permission to access this resource",
        FORBIDDEN
      );
    }

    next();
  };

export default authorize;
