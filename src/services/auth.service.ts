import db from "../configs/db.config";
import { assertAppError } from "../utils/assertAppError";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../utils/httpStatus";

type RegisterAccountParams = {
  email: string;
  password: string;
};

export const registerAccount = async (payload: RegisterAccountParams) => {
  // check if email exists
  const { rows } = await db.query<{ email: string }>(
    "SELECT * FROM users WHERE email = $1",
    [payload.email]
  );
  assertAppError(rows.length === 0, "Email already exists", BAD_REQUEST);
};
