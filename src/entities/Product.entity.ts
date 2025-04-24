export type Product = {
  product_id: string;
  product_name: string;
  price: number;
  category_id: string;
  slug: string;
  createdat: Date;
  updatedat: Date;
};

export type GetProductsResponse = {
  product_id: string;
  product_name: string;
  price: number;
  product_slug: string;
  category_id: string;
  category_name: string;
  category_slug: string;
};
