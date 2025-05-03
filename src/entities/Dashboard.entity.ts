export type Dashboard = {
  title: string;
  url?: string;
  items?: Dashboard[];
};

export type ProductsListForDashboardResponse = {
  product_id: string;
  product_name: string;
  price: number;
  product_slug: string;
  category_id: string;
  category_name: string;
  category_slug: string;
  stock_quantity: number;
  sold_out: boolean;
  product_images?: ProductImage[];
  product_image_id: string;
  image_url: string;
};

type ProductImage = {
  product_image_id: string;
  image_url: string;
};

export type DashboardOverviewResponse = {
  total_non_admin_users: number;
  total_products: number;
  total_categories: number;
};
