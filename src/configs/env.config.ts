const getENV = (key: string, defaultValue?: string) => {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is missing`);
  }

  return value;
};

export const PORT = getENV("PORT");
export const DATABASE_URL = getENV("DATABASE_URL");
