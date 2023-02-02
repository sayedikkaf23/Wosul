var delivery = require("../../controllers/franchise/delivery"); // include delivery controller ////
const { authMiddleware } = require("../../middleware/checkAuth");

module.exports = function (app) {
  app.post(
    "/api/franchise/provider_location_track",
    authMiddleware,
    delivery.provider_location_track
  );

  app.post(
    "/api/franchise/order_list_for_delivery",
    authMiddleware,
    delivery.order_list_for_delivery
  );
  app.post("/api/franchise/history", authMiddleware, delivery.history);

  app.post(
    "/api/franchise/delivery_list_search_sort",
    authMiddleware,
    delivery.delivery_list_search_sort
  );
  app.post(
    "/api/franchise/franchise_notify_new_order",
    authMiddleware,
    delivery.franchise_notify_new_order
  );
  app.post(
    "/api/franchise/get_order_data",
    authMiddleware,
    delivery.get_order_data
  );
  app.post(
    "/api/franchise/order_list_search_sort",
    authMiddleware,
    delivery.order_list_search_sort
  );
};
