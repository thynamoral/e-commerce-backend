import { CookieOptions, Response } from "express";
import { NODE_ENV } from "../configs/env.config";
import { fifteenMinutesFromNow, sevenDaysFromNow } from "./date";

const isProduction = NODE_ENV === "production";

export const defaultCookieOptions: CookieOptions = {
  sameSite: isProduction ? "none" : "lax",
  httpOnly: true,
  secure: isProduction,
};

export const getAcessTokenCookieOptions = (): CookieOptions => ({
  ...defaultCookieOptions,
  expires: fifteenMinutesFromNow(),
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaultCookieOptions,
  expires: sevenDaysFromNow(),
});

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  return res
    .cookie("accessToken", accessToken, getAcessTokenCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());
};

export const clearAuthCookies = (res: Response) => {
  return res
    .clearCookie("accessToken", defaultCookieOptions)
    .clearCookie("refreshToken", {
      ...defaultCookieOptions,
    });
};
