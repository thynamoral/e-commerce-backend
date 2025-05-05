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
export const FRONTEND_URL_PRODUCTION = getENV("FRONTEND_URL_PRODUCTION");
export const EMAIL_SENDER = getENV("EMAIL_SENDER");
export const APP_PASSWORD = getENV("APP_PASSWORD");
export const RESEND_API_KEY = getENV("RESEND_API_KEY");
export const JWT_ACESS_SECRET = getENV("JWT_ACESS_SECRET");
export const JWT_REFRESH_SECRET = getENV("JWT_REFRESH_SECRET");
export const CLOUDINARY_CLOUD_NAME = getENV("CLOUDINARY_CLOUD_NAME");
export const CLOUDINARY_API_KEY = getENV("CLOUDINARY_API_KEY");
export const CLOUDINARY_API_SECRET = getENV("CLOUDINARY_API_SECRET");
export const PRODUCT_IMAGE_FOLDER = getENV("PRODUCT_IMAGE_FOLDER");
