import { RequestHandler } from "express";
import { assertAppError } from "../utils/assertAppError";
import { UNAUTHORIZED } from "../utils/httpStatus";
import db from "../configs/db.config";
import User from "../entities/User.entity";
import { AppErrorCode } from "../utils/appError";

const authorize =
  (allowedRoles: string[]): RequestHandler =>
  async (req, res, next) => {
    try {
      const userId = req.user_id;

      const { rows: user } = await db.query<User>(
        "SELECT * FROM users WHERE user_id = $1",
        [userId]
      );

      assertAppError(
        user.length > 0 && allowedRoles.includes(user[0].role),
        "Unauthorized",
        UNAUTHORIZED,
        AppErrorCode.FORBIDDEN
      );

      next(); // only if authorized
    } catch (err) {
      next(err);
    }
  };

export default authorize;
