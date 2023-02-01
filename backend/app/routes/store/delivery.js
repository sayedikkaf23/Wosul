var delivery = require("../../controllers/store/delivery"); // include delivery controller ////
const { authMiddleware } = require("../../middleware/checkAuth");

module.exports = function (app) {
  app.post(
    "/api/store/provider_location_track",
    authMiddleware,
    delivery.provider_location_track
  );

  app.post(
    "/api/store/order_list_for_delivery",
    authMiddleware,
    delivery.order_list_for_delivery
  );

  app.post("/api/store/history", authMiddleware, delivery.history);

  app.post(
    "/api/store/delivery_list_search_sort",
    authMiddleware,
    delivery.delivery_list_search_sort
  );

  app.post(
    "/api/store/store_notify_new_order",
    authMiddleware,
    delivery.store_notify_new_order
  );

  app.post(
    "/api/store/get_order_data",
    authMiddleware,
    delivery.get_order_data
  );
  app.post(
    "/api/store/order_list_search_sort",
    authMiddleware,
    delivery.order_list_search_sort
  );

  app.post(
    "/api/store/export_excel_history",
    authMiddleware,
    delivery.export_excel_history
  );

  app.post(
    "/api/store/get_order_list",
    authMiddleware,
    delivery.get_order_list
  );
};
