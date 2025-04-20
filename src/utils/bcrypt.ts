import { compare, hash } from "bcrypt";
import { SALT_ROUND } from "../configs/env.config";

export const hashPassword = async (password: string) => {
  return await hash(password, Number(SALT_ROUND));
};

export const comparePassword = async (password: string, hash: string) => {
  return await compare(password, hash);
};
