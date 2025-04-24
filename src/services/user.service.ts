import db from "../configs/db.config";
import User from "../entities/User.entity";
import { assertAppError } from "../utils/assertAppError";

export const getCurrentUser = async (user_id: string) => {
  // find user by user_id
  const {
    rows: [user],
  } = await db.query<User>("SELECT * FROM users WHERE user_id = $1", [user_id]);
  assertAppError(user, "User not found", 404);
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
