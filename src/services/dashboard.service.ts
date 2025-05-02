export const getDashboardList = () => {
  return [
    {
      title: "Main Menu",
      url: "/dashboard",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard/overview",
        },
        {
          title: "Products",
          url: "/dashboard/products",
        },
        {
          title: "Orders",
          url: "/dashboard/orders",
        },
      ],
    },
  ];
};
