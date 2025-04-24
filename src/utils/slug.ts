import db from "../configs/db.config";

const allowedTable = ["products", "categories"];

export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

export const generateUniqueSlug = async (text: string, tableName: string) => {
  // check if table is allowed
  if (!allowedTable.includes(tableName)) {
    throw new Error(`Table ${tableName} is not allowed`);
  }

  let baseSlug = slugify(text);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const { rows } = await db.query(
      `SELECT slug FROM ${tableName} WHERE slug = $1 LIMIT 1`,
      [slug]
    );

    if (rows.length === 0) {
      return slug;
    }
    slug = `${baseSlug}-${counter++}`;
  }
};
