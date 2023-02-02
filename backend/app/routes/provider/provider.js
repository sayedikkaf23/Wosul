var providers = require("../../controllers/provider/provider"); // include provider controller ////
const { authMiddleware } = require("../../middleware/checkAuth");

module.exports = function (app) {
  app.post(
    "/api/provider/register",
    authMiddleware,
    providers.provider_register
  );

  app.post("/api/provider/login", authMiddleware, providers.provider_login);

  app.post("/api/provider/update", authMiddleware, providers.provider_update);

  app.post("/api/provider/logout", authMiddleware, providers.logout);

  app.post("/api/provider/get_detail", authMiddleware, providers.get_detail);

  app.post(
    "/api/provider/update_device_token",
    authMiddleware,
    providers.update_device_token
  );

  app.post(
    "/api/provider/change_status",
    authMiddleware,
    providers.change_status
  );

  app.post(
    "/api/provider/otp_verification",
    authMiddleware,
    providers.provider_otp_verification
  );

  app.post(
    "/api/provider/rating_to_store",
    authMiddleware,
    providers.provider_rating_to_store
  );

  app.post(
    "/api/provider/rating_to_user",
    authMiddleware,
    providers.provider_rating_to_user
  );

  app.post(
    "/api/provider/get_order_status",
    authMiddleware,
    providers.get_order_status
  );

  app.post(
    "/api/provider/update_location",
    authMiddleware,
    providers.update_location
  );

  // NEW API
  app.post(
    "/api/provider/get_requests",
    authMiddleware,
    providers.get_requests
  );

  app.post(
    "/api/provider/get_active_requests",
    authMiddleware,
    providers.get_active_requests
  );

  app.post(
    "/api/provider/get_request_count",
    authMiddleware,
    providers.get_request_count
  );

  app.post(
    "/api/provider/request_history_detail",
    authMiddleware,
    providers.request_history_detail
  );

  app.post(
    "/api/provider/request_history",
    authMiddleware,
    providers.request_history
  );

  app.post(
    "/api/provider/get_request_status",
    authMiddleware,
    providers.get_request_status
  );
};
