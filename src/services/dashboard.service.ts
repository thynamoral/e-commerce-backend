import { Dashboard } from "../entities/Dashboard.entity";

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
