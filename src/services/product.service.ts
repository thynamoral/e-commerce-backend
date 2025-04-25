import { z } from "zod";
import {
  createProductSchema,
  updateProductSchema,
} from "../validation-schema/product.schema";
import db from "../configs/db.config";
import { GetProductsResponse, Product } from "../entities/Product.entity";
import { assertAppError } from "../utils/assertAppError";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../utils/httpStatus";
import { generateUniqueSlug } from "../utils/slug";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

export const createProduct = async (
  createProductPayload: z.infer<typeof createProductSchema>,
  images?: Express.Multer.File[]
) => {
  const { product_name, price, category_id } = createProductPayload;
  const productSlug = await generateUniqueSlug(product_name, "products");

  // create product
  const {
    rows: [createdProduct],
    rowCount,
  } = await db.query<Product>(
    "INSERT INTO products (product_name, price, slug, category_id) VALUES ($1, $2, $3, $4) RETURNING *",
    [product_name, Number(price), productSlug, category_id]
  );
  assertAppError(
    rowCount === 1,
    "Failed to create product",
    INTERNAL_SERVER_ERROR
  );

  // upload images
  const image_urls: string[] = [];
  if (images) {
    await Promise.all(
      images.map(async (image) => {
        // image validation
        if (!image.mimetype.startsWith("image/")) {
          assertAppError(false, "Only image files are allowed!", BAD_REQUEST);
        }

        if (image.size > 5 * 1024 * 1024) {
          assertAppError(
            false,
            "Image size should be less than 5MB",
            BAD_REQUEST
          );
        }

        // upload image to cloudinary
        const result = await uploadToCloudinary(
          image.buffer,
          image.originalname
        );
        image_urls.push(result.secure_url);

        // save image url to database
        const { rowCount: savedImageUrl } = await db.query(
          "INSERT INTO product_images (product_id, image_url) VALUES ($1, $2) RETURNING *",
          [createdProduct.product_id, result.secure_url]
        );
        assertAppError(
          savedImageUrl === 1,
          "Failed to save image url to database",
          INTERNAL_SERVER_ERROR
        );
      })
    );
    console.log(`Upload images to cloudinary successfully`);
    console.log(image_urls);
  }

  return createdProduct;
};

export const getProducts = async (
  search?: string,
  category?: string,
  page: number = 1,
  limit: number = 6
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

export const getCurrentProduct = async (id: string) => {
  const {
    rows: [product],
  } = await db.query<Product>(
    `
        SELECT 
      products.product_id, products.product_name, products.price, products.slug AS product_slug,
      categories.category_id, categories.category_name, categories.slug AS category_slug
    FROM products
    LEFT JOIN categories ON products.category_id = categories.category_id 
    WHERE products.product_id = $1
    `,
    [id]
  );
  assertAppError(product, "Product not found", BAD_REQUEST);
  return product;
};

export const updateProduct = async (
  id: string,
  updateProductPayload: z.infer<typeof updateProductSchema>
) => {
  // find product by id
  const {
    rows: [existedProduct],
  } = await db.query<Product>(
    `
      SELECT * FROM products WHERE product_id = $1
    `,
    [id]
  );
  assertAppError(existedProduct, "Product not found", BAD_REQUEST);

  // update product
  const { product_name, price, category_id } = updateProductPayload;
  const {
    rows: [updatedProduct],
    rowCount,
  } = await db.query<Product>(
    `
      UPDATE products
      SET product_name = $1, price = $2, category_id = $3
      WHERE product_id = $4
      RETURNING *
    `,
    [product_name, price, category_id, id]
  );
  assertAppError(
    rowCount === 1,
    "Failed to update product",
    INTERNAL_SERVER_ERROR
  );
  return updatedProduct;
};

export const deleteProduct = async (id: string) => {
  // find product by id
  const {
    rows: [existedProduct],
  } = await db.query<Product>(
    `
      SELECT * FROM products WHERE product_id = $1
    `,
    [id]
  );
  assertAppError(existedProduct, "Product not found", BAD_REQUEST);

  // delete product
  const { rowCount } = await db.query(
    `
      DELETE FROM products WHERE product_id = $1
    `,
    [id]
  );
  assertAppError(
    rowCount === 1,
    "Failed to delete product",
    INTERNAL_SERVER_ERROR
  );
};
