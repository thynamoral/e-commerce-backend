import { loadEnvVariables } from "../configs/env";
import { User } from "../db/schema/users";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

loadEnvVariables();

export type TokenSign = {
  userId: string;
  role: string;
};

const ACCESS_TOKEN_SECRET: Secret = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET: Secret = process.env.REFRESH_TOKEN_SECRET!;

export const generateAccessToken = (userId: string, role: string) => {
  const options: SignOptions = {
    expiresIn: "15m",
  };
  return jwt.sign({ userId, role }, ACCESS_TOKEN_SECRET, options);
};

export const generateRefreshToken = (userId: string, role: string) => {
  const options: SignOptions = {
    expiresIn: "7d",
  };
  return jwt.sign({ userId, role }, REFRESH_TOKEN_SECRET, options);
};

export const verifyAccessToken = (accessToken: string) => {
  const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET) as TokenSign;
  if (!decoded) return null;
  else return decoded;
};

export const verifyRefreshToken = (refreshToken: string) => {
  const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as TokenSign;
  if (!decoded) return null;
  else return decoded;
};
