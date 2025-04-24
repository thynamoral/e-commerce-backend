import { z } from "zod";
import { createProductSchema } from "../validation-schema/product.schema";
import db from "../configs/db.config";
import { GetProductsResponse, Product } from "../entities/Product.entity";
import { assertAppError } from "../utils/assertAppError";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../utils/httpStatus";
import { generateUniqueSlug } from "../utils/slug";

export const createProduct = async (
  createProductPayload: z.infer<typeof createProductSchema>
) => {
  const { product_name, price, category_id } = createProductPayload;
  const productSlug = await generateUniqueSlug(product_name, "products");
  const {
    rows: [createdProduct],
    rowCount,
  } = await db.query<Product>(
    "INSERT INTO products (product_name, price, slug, category_id) VALUES ($1, $2, $3, $4) RETURNING *",
    [product_name, price, productSlug, category_id]
  );
  assertAppError(
    rowCount === 1,
    "Failed to create product",
    INTERNAL_SERVER_ERROR
  );
  return createdProduct;
};

export const getProducts = async (
  search?: string,
  category?: string,
  page: number = 1,
  limit: number = 20
) => {
  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  const values: any[] = [];
  let index = 1;

  // full text search
  if (search) {
    conditions.push(`
      to_tsvector('english',
        coalesce(products.product_name, '') || ' ' ||
        coalesce(categories.category_name, '') || ' ' ||
        coalesce(categories.slug, '')
      ) @@ plainto_tsquery('english', $${index++})
    `);
    values.push(search);
  }

  // category slug filter
  if (category) {
    conditions.push(`categories.slug = $${index++}`);
    values.push(category);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const query = `
    SELECT 
      products.product_id, products.product_name, products.price, products.slug AS product_slug,
      categories.category_id, categories.category_name, categories.slug AS category_slug
    FROM products
    LEFT JOIN categories ON products.category_id = categories.category_id
    ${whereClause}
    ORDER BY products.createdat DESC
    LIMIT $${index++} OFFSET $${index}
  `;

  values.push(limit, offset);

  const { rows: products } = await db.query<GetProductsResponse>(query, values);
  assertAppError(products.length > 0, "Products not found", BAD_REQUEST);
  return products;
};
