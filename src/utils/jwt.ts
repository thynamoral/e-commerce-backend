import jwt, { Secret, SignOptions, VerifyOptions } from "jsonwebtoken";
import User from "../entities/User.entity";
import { JWT_ACESS_SECRET, JWT_REFRESH_SECRET } from "../configs/env.config";

export type AcessTokenPayload = {
  user_id: string;
  session_id: string;
  role: string;
};
export type RefreshTokenPayload = {
  session_id: string;
};

type SecretAndSignOptions = SignOptions & {
  secret: Secret;
};

export const defaultSignOptions: SignOptions = {
  audience: ["user"],
};

export const defaultAcessTokenSignOptions: SecretAndSignOptions = {
  secret: JWT_ACESS_SECRET,
  expiresIn: "15m",
};

export const defaultRefreshTokenSignOptions: SecretAndSignOptions = {
  secret: JWT_REFRESH_SECRET,
  expiresIn: "7d",
};

export const signToken = (
  payload: AcessTokenPayload | RefreshTokenPayload,
  signOptions?: SecretAndSignOptions
) => {
  const { secret, ...restOptions } =
    signOptions || defaultAcessTokenSignOptions;
  return jwt.sign(payload, secret, {
    ...defaultSignOptions,
    ...restOptions,
  });
};

export const verifyToken = <TPayload extends object = AcessTokenPayload>(
  token: string,
  options?: VerifyOptions & { secret: Secret }
) => {
  const { secret = JWT_ACESS_SECRET, ...restOptions } = options || {};
  try {
    const decodedPayload = jwt.verify(token, secret, {
      ...defaultSignOptions,
      ...restOptions,
    }) as TPayload;
    return { decodedPayload };
  } catch (error: any) {
    console.log(error.name, error.message);
    return {
      error: error.message,
    };
  }
};
