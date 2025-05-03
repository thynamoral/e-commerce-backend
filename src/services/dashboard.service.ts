import db from "../configs/db.config";
import {
  Dashboard,
  ProductsListForDashboardResponse,
} from "../entities/Dashboard.entity";
import { assertAppError } from "../utils/assertAppError";
import { INTERNAL_SERVER_ERROR } from "../utils/httpStatus";

export const getDashboardList = () => {
  const dashboardList: Dashboard[] = [
    {
      title: "Dashboard",
      items: [
        {
          title: "Dashboard overview",
          url: "/dashboard/overview",
        },
      ],
    },
    {
      title: "Products",
      items: [
        {
          title: "Products list",
          url: "/dashboard/products-list",
        },
        {
          title: "Add product",
          url: "/dashboard/add-product",
        },
      ],
    },
    {
      title: "Orders",
      items: [
        {
          title: "Orders list",
          url: "/dashboard/orders-list",
        },
        {
          title: "Add order",
          url: "/dashboard/add-order",
        },
      ],
    },
  ];
  return dashboardList;
};

export const getProductsList = async () => {
  // query products
  const { rows: products } = await db.query<ProductsListForDashboardResponse>(
    `
    SELECT products.product_id, products.product_name, products.price, products.slug AS product_slug,
    product_inventories.stock_quantity, product_inventories.sold_out,
    categories.category_id, categories.category_name, categories.slug AS category_slug,
    product_images.product_image_id, product_images.image_url
    FROM products 
    LEFT JOIN product_inventories ON products.product_id = product_inventories.product_id
    LEFT JOIN categories ON products.category_id = categories.category_id
    INNER JOIN product_images ON products.product_id = product_images.product_id
    ORDER BY products.createdat DESC
    `
  );
  assertAppError(
    products.length > 0,
    "Failed to get products list for dashboard",
    INTERNAL_SERVER_ERROR
  );

  // group product images by product_id
  const productImagesGroupedByProductId = Object.values(
    products.reduce(
      (acc, product) => {
        if (!acc[product.product_id]) {
          acc[product.product_id] = {
            product_id: product.product_id,
            product_name: product.product_name,
            price: product.price,
            product_slug: product.product_slug,
            category_id: product.category_id,
            category_name: product.category_name,
            category_slug: product.category_slug,
            stock_quantity: product.stock_quantity,
            sold_out: product.sold_out,
            product_images: [],
          };
        }

        acc[product.product_id].product_images?.push({
          product_image_id: product.product_image_id,
          image_url: product.image_url,
        });

        return acc;
      },
      {} as Record<
        string,
        Omit<ProductsListForDashboardResponse, "image_url" | "product_image_id">
      >
    )
  );

  return productImagesGroupedByProductId;
};
