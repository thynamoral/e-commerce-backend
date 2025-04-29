import { RequestHandler } from "express";
import { assertAppError } from "../utils/assertAppError";
import { FORBIDDEN } from "../utils/httpStatus";
import db from "../configs/db.config";
import User from "../entities/User.entity";

const authorize =
  (allowedRoles: string[]): RequestHandler =>
  async (req, res, next) => {
    const userRole = req.role;
    const userId = req.user_id;

    // verify user_id match with user's role
    const { rows: user } = await db.query<User>(
      "SELECT * FROM users WHERE user_id = $1 AND role = $2",
      [userId, userRole]
    );
    assertAppError(
      user.length === 1,
      "Forbidden: You do not have permission to access this resource",
      FORBIDDEN
    );

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
