import db from "../configs/db.config";
import { FRONTEND_URL, JWT_REFRESH_SECRET } from "../configs/env.config";
import { Session } from "../entities/Session.entity";
import User from "../entities/User.entity";
import { VerificationCode } from "../entities/VerificationCode.entity";
import { assertAppError } from "../utils/assertAppError";
import { comparePassword, hashPassword } from "../utils/bcrypt";
import { convertToMs, sevenDaysFromNow, tenMinutesAgo } from "../utils/date";
import {
  getPasswordResetTemplate,
  getVerifyEmailTemplate,
  sendEmail,
} from "../utils/email";
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
} from "../utils/httpStatus";
import {
  defaultRefreshTokenSignOptions,
  RefreshTokenPayload,
  signToken,
  verifyToken,
} from "../utils/jwt";
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
  // rate limit to only 2 requests in last 10 minutes
  const { rows: existedVerificationCode, rowCount } =
    await db.query<VerificationCode>(
      "SELECT * FROM verification_codes WHERE user_id = $1 AND type = $2 AND createdat > $3",
      [user.user_id, VerificationType.VERIFY_EMAIL, tenMinutesAgo()]
    );
  assertAppError(
    existedVerificationCode.length < 2 && rowCount! <= 1,
    "Too many requests, please try again later",
    TOO_MANY_REQUESTS
  );

  const { rows: createdVerificationCode } = await db.query<VerificationCode>(
    "INSERT INTO verification_codes (user_id, type) VALUES ($1, $2) RETURNING *",
    [user.user_id, VerificationType.VERIFY_EMAIL]
  );
  const expiredMs = convertToMs(createdVerificationCode[0].expiredat);
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
  const refreshToken = signToken(
    { session_id: createdSession[0].session_id },
    { secret: defaultRefreshTokenSignOptions.secret }
  );

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
  const expiredMs = convertToMs(existedVerificationCode[0].expiredat);
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

type ForgotPasswordParams = {
  email: string;
};

const forgotPassword = async (forgotPasswordPayload: ForgotPasswordParams) => {
  // check if email exists
  const { rows: existedUser } = await db.query<User>(
    "SELECT * FROM users WHERE email = $1",
    [forgotPasswordPayload.email]
  );
  assertAppError(
    existedUser.length > 0,
    "Invalid email or password",
    BAD_REQUEST
  );

  // rate limit to only 2 requests in last 10 minutes
  const { rows: existedVerificationCode, rowCount } =
    await db.query<VerificationCode>(
      "SELECT * FROM verification_codes WHERE user_id = $1 AND type = $2 AND createdat > $3",
      [existedUser[0].user_id, VerificationType.RESET_PASSWORD, tenMinutesAgo()]
    );
  assertAppError(
    existedVerificationCode.length < 2 && rowCount! <= 1,
    "Too many requests, please try again later",
    TOO_MANY_REQUESTS
  );

  // add verification code
  const { rows: createdVerificationCode } = await db.query<VerificationCode>(
    "INSERT INTO verification_codes (user_id, type) VALUES ($1, $2) RETURNING *",
    [existedUser[0].user_id, VerificationType.RESET_PASSWORD]
  );
  assertAppError(
    createdVerificationCode.length === 1,
    "Failed to request password reset, Internal Server Error",
    INTERNAL_SERVER_ERROR
  );

  // send email verification
  const expiredMs = convertToMs(createdVerificationCode[0].expiredat);
  const url = `${FRONTEND_URL}/password/reset?code=${createdVerificationCode[0].verification_code_id}&exp=${expiredMs}`;
  const { error } = await sendEmail({
    to: existedUser[0].email,
    ...getPasswordResetTemplate(url),
  });
  assertAppError(
    !error,
    "Failed to request password reset, Internal Server Error",
    INTERNAL_SERVER_ERROR
  );
};

type ResetPasswordParams = {
  code: string;
  password: string;
  confirmPassword: string;
};

const resetPassword = async (resetPasswordPayload: ResetPasswordParams) => {
  // check if code exists and is not expired
  const { rows: existedVerificationCode } = await db.query<VerificationCode>(
    "SELECT * FROM verification_codes WHERE verification_code_id = $1 AND expiredat > $2 AND type = $3",
    [resetPasswordPayload.code, new Date(), VerificationType.RESET_PASSWORD]
  );
  assertAppError(
    existedVerificationCode.length > 0,
    "Invalid or expired verification code",
    NOT_FOUND
  );

  // update user
  const { rowCount: updatedRowCount } = await db.query<User>(
    "UPDATE users SET password = $1 WHERE user_id = $2",
    [
      await hashPassword(resetPasswordPayload.password),
      existedVerificationCode[0].user_id,
    ]
  );
  assertAppError(
    updatedRowCount === 1,
    "Failed to reset password",
    INTERNAL_SERVER_ERROR
  );

  // delete verification code
  const { rowCount: deletedRowCount } = await db.query<VerificationCode>(
    "DELETE FROM verification_codes WHERE verification_code_id = $1",
    [existedVerificationCode[0].verification_code_id]
  );
  assertAppError(
    deletedRowCount! > 0,
    "Failed to reset password",
    INTERNAL_SERVER_ERROR
  );

  // delete all user's sessions
  const { rowCount: deletedSessions } = await db.query<Session>(
    "DELETE FROM sessions WHERE user_id = $1",
    [existedVerificationCode[0].user_id]
  );
  assertAppError(
    deletedSessions! > 0,
    "Failed to reset password",
    INTERNAL_SERVER_ERROR
  );
};

const refreshToken = async (refreshToken: string) => {
  // verify refreshToken
  console.log(refreshToken);
  const { decodedPayload, error } = verifyToken<RefreshTokenPayload>(
    refreshToken,
    { secret: defaultRefreshTokenSignOptions.secret }
  );
  assertAppError(
    decodedPayload,
    "Invalid or expired refreshToken",
    UNAUTHORIZED
  );

  // verify session
  const { rows: existedSession } = await db.query<Session>(
    "SELECT * FROM sessions WHERE session_id = $1 AND expiredat > $2",
    [decodedPayload.session_id, new Date()]
  );
  assertAppError(
    existedSession.length > 0,
    "Invalid or expired session",
    UNAUTHORIZED
  );

  // sign tokens
  const { rows: user } = await db.query<User>(
    "SELECT * FROM users WHERE user_id = $1",
    [existedSession[0].user_id]
  );
  const accessToken = signToken({
    user_id: existedSession[0].user_id,
    session_id: existedSession[0].session_id,
    role: user[0].role,
  });

  return { accessToken };
};

export default {
  registerAccount,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
};
