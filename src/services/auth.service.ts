import db from "../configs/db.config";
import { FRONTEND_URL } from "../configs/env.config";
import User from "../entities/User.entity";
import { VerificationCode } from "../entities/VerificationCode.entity";
import { assertAppError } from "../utils/assertAppError";
import { comparePassword, hashPassword } from "../utils/bcrypt";
import { getVerifyEmailTemplate, sendEmail } from "../utils/email";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../utils/httpStatus";
import { VerificationType } from "../utils/verificationType";

type RegisterAccountParams = {
  email: string;
  password: string;
};

export const registerAccount = async (payload: RegisterAccountParams) => {
  // check if email exists
  const { rows: existedUser } = await db.query<User>(
    "SELECT * FROM users WHERE email = $1",
    [payload.email]
  );
  assertAppError(existedUser.length === 0, "Email already exists", BAD_REQUEST);

  // register account
  const { rows: createdUser, rowCount } = await db.query<User>(
    "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
    [payload.email, await hashPassword(payload.password)]
  );
  assertAppError(
    rowCount === 1,
    "Failed to register account",
    INTERNAL_SERVER_ERROR
  );

  // send email verification
  const { rows: createdVerificationCode } = await db.query<VerificationCode>(
    "INSERT INTO verification_codes (user_id, type) VALUES ($1, $2) RETURNING *",
    [createdUser[0].user_id, VerificationType.VERIFY_EMAIL]
  );
  const url = `${FRONTEND_URL}/email/verify/${createdVerificationCode[0].verification_code_id}`;
  const { error } = await sendEmail({
    to: createdUser[0].email,
    ...getVerifyEmailTemplate(url),
  });

  assertAppError(
    !error,
    "Failed to send email verification",
    INTERNAL_SERVER_ERROR
  );

  return createdUser[0];
};
