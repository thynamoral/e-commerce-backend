const getENV = (key: string, defaultValue?: string) => {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is missing`);
  }

  return value;
};

export const NODE_ENV = getENV("NODE_ENV");
export const PORT = getENV("PORT");
export const DATABASE_URL = getENV("DATABASE_URL");
export const SALT_ROUND = getENV("SALT_ROUND");
export const FRONTEND_URL = getENV("FRONTEND_URL");
export const EMAIL_SENDER = getENV("EMAIL_SENDER");
export const RESEND_API_KEY = getENV("RESEND_API_KEY");
export const JWT_ACESS_SECRET = getENV("JWT_ACESS_SECRET");
export const JWT_REFRESH_SECRET = getENV("JWT_REFRESH_SECRET");
