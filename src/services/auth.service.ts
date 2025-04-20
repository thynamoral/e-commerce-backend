import db from "../configs/db.config";
import { FRONTEND_URL } from "../configs/env.config";
import { Session } from "../entities/Session.entity";
import User from "../entities/User.entity";
import { VerificationCode } from "../entities/VerificationCode.entity";
import { assertAppError } from "../utils/assertAppError";
import { comparePassword, hashPassword } from "../utils/bcrypt";
import { getVerifyEmailTemplate, sendEmail } from "../utils/email";
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
} from "../utils/httpStatus";
import { defaultRefreshTokenSignOptions, signToken } from "../utils/jwt";
import { VerificationType } from "../utils/verificationType";

type RegisterAccountParams = {
  email: string;
  password: string;
};

const registerAccount = async (payload: RegisterAccountParams) => {
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
  const { error } = await sendEmailVerification(createdUser[0]);
  assertAppError(
    !error,
    "Failed to send email verification",
    INTERNAL_SERVER_ERROR
  );

  return createdUser[0];
};

const sendEmailVerification = async (user: User) => {
  const { rows: createdVerificationCode } = await db.query<VerificationCode>(
    "INSERT INTO verification_codes (user_id, type) VALUES ($1, $2) RETURNING *",
    [user.user_id, VerificationType.VERIFY_EMAIL]
  );
  const expiredMs = new Date(createdVerificationCode[0].expiredat).getTime();
  const url = `${FRONTEND_URL}/email/verify?code=${createdVerificationCode[0].verification_code_id}&exp=${expiredMs}`;
  const { error } = await sendEmail({
    to: user.email,
    ...getVerifyEmailTemplate(url),
  });
  return { error };
};

type LoginParams = {
  email: string;
  password: string;
};

const login = async (loginPayload: LoginParams) => {
  // check if email exists
  const { rows: existedUser } = await db.query<User>(
    "SELECT * FROM users WHERE email = $1",
    [loginPayload.email]
  );
  assertAppError(
    existedUser.length > 0,
    "Invalid email or password",
    UNAUTHORIZED
  );
  console.log(existedUser[0]);
  // check if user is verified
  assertAppError(
    existedUser[0].isverified,
    "Please verify your email address",
    UNAUTHORIZED
  );

  // check if password matches
  const isValidPassword = await comparePassword(
    loginPayload.password,
    existedUser[0].password
  );
  assertAppError(isValidPassword, "Invalid email or password", UNAUTHORIZED);

  // create session
  const { rows: createdSession, rowCount } = await db.query<Session>(
    "INSERT INTO sessions (user_id) VALUES ($1) RETURNING *",
    [existedUser[0].user_id]
  );
  assertAppError(
    rowCount === 1 && createdSession[0].session_id,
    "Internal Server Error",
    INTERNAL_SERVER_ERROR
  );

  // sign tokens
  const accessToken = signToken({
    user_id: existedUser[0].user_id,
    session_id: createdSession[0].session_id,
    role: existedUser[0].role,
  });
  const refreshToken = signToken({
    session_id: createdSession[0].session_id,
    ...defaultRefreshTokenSignOptions,
  });

  return { user: existedUser[0], accessToken, refreshToken };
};

const verifyEmail = async (code: string) => {
  // check if code exists
  const { rows: existedVerificationCode } = await db.query<VerificationCode>(
    "SELECT * FROM verification_codes WHERE verification_code_id = $1",
    [code]
  );
  assertAppError(
    existedVerificationCode.length > 0,
    "Invalid or expired verification code",
    BAD_REQUEST
  );

  // check if code is expired
  const expiredMs = new Date(existedVerificationCode[0].expiredat).getTime();
  assertAppError(
    expiredMs > Date.now(),
    "Invalid or expired verification code",
    BAD_REQUEST
  );

  // update user
  const { rowCount: updatedRowCount } = await db.query(
    "UPDATE users SET isverified = true WHERE user_id = $1",
    [existedVerificationCode[0].user_id]
  );
  assertAppError(
    updatedRowCount === 1,
    "Failed to verify email",
    INTERNAL_SERVER_ERROR
  );

  // delete verification code
  const { rowCount: deletedRowCount } = await db.query(
    "DELETE FROM verification_codes WHERE verification_code_id = $1",
    [existedVerificationCode[0].verification_code_id]
  );
  assertAppError(
    deletedRowCount === 1,
    "Failed to verify email",
    INTERNAL_SERVER_ERROR
  );
};

export default {
  registerAccount,
  login,
  verifyEmail,
};
