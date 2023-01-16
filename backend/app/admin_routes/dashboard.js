var dashboard = require("../admin_controllers/dashboard"); // include admin controller ////
const { authMiddleware } = require("../middleware/checkAuth");

module.exports = function (app) {
  app.post(
    "/admin/dashboard/last_six_month_payment_detail",
    dashboard.last_six_month_payment_detail
  );

  app.post(
    "/admin/dashboard/last_six_month_earning_detail",
    dashboard.last_six_month_earning_detail
  );

  app.post(
    "/admin/dashboard/last_fifteen_day_order_detail",
    dashboard.last_fifteen_day_order_detail
  );

  app.post("/admin/dashboard/order_detail", dashboard.order_detail);

  app.post(
    "/admin/dashboard/monthly_payment_detail",
    dashboard.monthly_payment_detail
  );

  app.post("/admin/dashboard/country_chart", dashboard.country_chart);

  app.post("/admin/dashboard/top_user_and_item", dashboard.top_user_and_item);

  app.post(
    "/admin/dashboard/admin_notify_new_order",
    dashboard.admin_notify_new_order
  );

  app.post("/admin/dashboard/get_carts", dashboard.admin_get_carts);
};
