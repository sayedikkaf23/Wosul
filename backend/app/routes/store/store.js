var stores = require("../../controllers/store/store"); // include store controller ////
const { authMiddleware } = require("../../middleware/checkAuth");
var utils = require("../../utils/utils");

module.exports = function (app) {
  app.route("/api/store/register").post(stores.store_register);
  app.route("/api/store/login").post(stores.store_login);
  app.post("/api/store/update", authMiddleware, stores.store_update);
  app.post("/api/store/order_list", authMiddleware, stores.order_list);
  app.post(
    "/api/store/update_store_time",
    authMiddleware,
    stores.update_store_time
  );
  app.post("/api/store/logout", authMiddleware, stores.logout);
  app.post(
    "/api/store/update_device_token",
    authMiddleware,
    stores.update_device_token
  );
  app.post(
    "/api/store/otp_verification",
    authMiddleware,
    stores.store_otp_verification
  );
  app.route("/api/store/final_order_summury").post(stores.final_order_summury);

  app.post("/api/store/get_detail", authMiddleware, stores.get_detail);
  app.post(
    "/api/store/order_payment_status_set_on_cash_on_delivery",
    authMiddleware,
    stores.order_payment_status_set_on_cash_on_delivery
  );
  app.post(
    "/api/store/check_order_status",
    authMiddleware,
    stores.check_order_status
  );
  app.post("/api/store/get_store_data", authMiddleware, stores.get_store_data);
  app.post("/api/store/order_history", authMiddleware, stores.order_history);
  app.post(
    "/api/store/order_history_detail",
    authMiddleware,
    stores.order_history_detail
  );
  app.route("/api/store/verify_password").post(stores.verify_password);

  app.post(
    "/api/store/rating_to_provider",
    authMiddleware,
    stores.store_rating_to_provider
  );
  app.post(
    "/api/store/rating_to_user",
    authMiddleware,
    stores.store_rating_to_user
  );
  app.post(
    "/api/store/cancel_request",
    authMiddleware,
    stores.store_cancel_request
  );
  app.post(
    "/api/store/get_order_detail",
    authMiddleware,
    stores.get_order_detail
  );
  app.post("/api/store/get_user", authMiddleware, stores.get_user);
  app
    .route("/api/store/get_country_phone_number_length")
    .post(stores.get_country_phone_number_length);

  app.post(
    "/api/store/complete_order",
    authMiddleware,
    stores.store_complete_order
  );

  app.post(
    "/api/store/create_order",
    authMiddleware,
    stores.store_create_order
  );
  app.post(
    "/api/store/store_change_delivery_address",
    authMiddleware,
    stores.store_change_delivery_address
  );

  app.post(
    "/api/store/update_order",
    authMiddleware,
    stores.store_update_order
  );

  // NEW API
  app.post(
    "/api/store/check_request_status",
    authMiddleware,
    stores.check_request_status
  );

  app.route("/api/store/set_deliver_in").post(stores.set_deliver_in);

  // for getting services
  app.route("/api/store/get_services").post(stores.get_services);
};
