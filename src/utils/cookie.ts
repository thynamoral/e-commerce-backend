import { CookieOptions, Response } from "express";
import { NODE_ENV } from "../configs/env.config";
import { fifteenMinutesFromNow, sevenDaysFromNow } from "./date";

export const ACESS_TOKEN_COOKIE_NAME = "accessToken";
export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
export const REFRESH_TOKEN_COOKIE_PATH = "/auth/token/refresh";

export const defaultCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "strict",
};

export const getAcessTokenCookieOptions = (): CookieOptions => ({
  ...defaultCookieOptions,
  expires: fifteenMinutesFromNow(),
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaultCookieOptions,
  expires: sevenDaysFromNow(),
  path: REFRESH_TOKEN_COOKIE_PATH,
});

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  res
    .cookie(ACESS_TOKEN_COOKIE_NAME, accessToken, getAcessTokenCookieOptions())
    .cookie(
      REFRESH_TOKEN_COOKIE_NAME,
      refreshToken,
      getRefreshTokenCookieOptions()
    );
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie(ACESS_TOKEN_COOKIE_NAME);
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    path: REFRESH_TOKEN_COOKIE_PATH,
  });
};
