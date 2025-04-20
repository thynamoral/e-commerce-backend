import {
  loginSchema,
  registerAccountSchema,
} from "../validation-schema/auth.schema";
import asyncRequestHandler from "../utils/asyncRequestHandler";
import authService from "../services/auth.service";
import { CREATED, OK } from "../utils/httpStatus";
import { clearAuthCookies, setAuthCookies } from "../utils/cookie";

export const registerAccountHandler = asyncRequestHandler(async (req, res) => {
  // validation body
  const { email, password } = registerAccountSchema.parse(req.body);
  // call service
  await authService.registerAccount({ email, password });
  // response
  res.status(CREATED).json({ message: "Account created successfully" });
});

export const loginHandler = asyncRequestHandler(async (req, res) => {
  // validation body
  const loginPayload = loginSchema.parse(req.body);
  // call service
  const { user, accessToken, refreshToken } =
    await authService.login(loginPayload);
  // set cookies
  setAuthCookies(res, accessToken, refreshToken);
  // response
  const { password, ...userWithoutPassword } = user;
  res
    .status(OK)
    .json({ user: userWithoutPassword, message: "Logged in successfully" });
});

export const logoutHandler = asyncRequestHandler(async (req, res) => {
  // clear cookies
  clearAuthCookies(res);
  // response
  res.status(OK).json({ message: "Logged out successfully" });
});
