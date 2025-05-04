import {
  emailSchema,
  forgotPasswordSchema,
  loginSchema,
  registerAccountSchema,
  resetPasswordSchema,
} from "../validation-schema/auth.schema";
import asyncRequestHandler from "../utils/asyncRequestHandler";
import authService, { logout } from "../services/auth.service";
import { BAD_REQUEST, CREATED, OK, UNAUTHORIZED } from "../utils/httpStatus";
import {
  ACESS_TOKEN_COOKIE_NAME,
  clearAuthCookies,
  getAcessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  REFRESH_TOKEN_COOKIE_NAME,
  setAuthCookies,
} from "../utils/cookie";
import { assertAppError } from "../utils/assertAppError";
import { verificationCodeIdSchema } from "../validation-schema/verification-code.schema";

export const registerAccountHandler = asyncRequestHandler(async (req, res) => {
  // validation body
  const { email, password } = registerAccountSchema.parse(req.body);
  // call service
  await authService.registerAccount({ email, password });
  // response
  res
    .status(CREATED)
    .json({ message: "Please check your email to verify your account!" });
});

export const loginHandler = asyncRequestHandler(async (req, res) => {
  // validation body
  const loginPayload = loginSchema.parse(req.body);
  // call service
  const { user, accessToken, refreshToken } =
    await authService.login(loginPayload);
  // response
  const { password, createdat, updatedat, ...userWithoutPassword } = user;
  return setAuthCookies(res, accessToken, refreshToken)
    .status(OK)
    .json({ user: userWithoutPassword, message: "Logged in successfully" });
});

export const emailVerifyHandler = asyncRequestHandler(async (req, res) => {
  // validation query
  const { code } = req.query as { code: string | undefined };
  assertAppError(code, "Invalid verification code", BAD_REQUEST);
  const parsedCode = verificationCodeIdSchema.parse(code);
  // call service
  await authService.verifyEmail(parsedCode);
  // response
  res.status(OK).json({ message: "Email verified successfully" });
});

export const forgotPasswordHandler = asyncRequestHandler(async (req, res) => {
  // validation body
  const { email } = forgotPasswordSchema.parse({ email: req.body.email });
  // call service
  await authService.forgotPassword({ email });
  // response
  res.status(OK).json({
    message:
      "Password reset email sent successfully, Please check your email for further instructions!",
  });
});

export const resetPasswordHandler = asyncRequestHandler(async (req, res) => {
  // validation body
  const resetPasswordPayload = resetPasswordSchema.parse(req.body);
  // call service
  await authService.resetPassword(resetPasswordPayload);
  // response
  res.status(OK).json({
    message: "Password reset successfully",
  });
});

export const refreshTokenHandler = asyncRequestHandler(async (req, res) => {
  // validate refreshToken cookies
  const refreshToken = req.cookies.refreshToken as string | undefined;
  assertAppError(refreshToken, "refreshToken is required", UNAUTHORIZED);
  // call service
  const { accessToken } = await authService.refreshToken(refreshToken);

  return res
    .cookie(ACESS_TOKEN_COOKIE_NAME, accessToken, getAcessTokenCookieOptions())
    .status(OK)
    .json({
      message: "Token refreshed successfully",
    });
});

export const logoutHandler = asyncRequestHandler(async (req, res) => {
  await logout(req.user_id!);
  // response
  return clearAuthCookies(res)
    .status(OK)
    .json({ message: "Logged out successfully" });
});
