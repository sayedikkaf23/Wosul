const { authMiddleware } = require("../../middleware/checkAuth");

var promo_code = require("../../controllers/user/promo_code"); // include promo_code controller ////

module.exports = function (app) {
  // app.route("/api/user/apply_promo_code").post(promo_code.apply_promo_code);
  app.post(
    "/api/user/apply_promo_code",
    authMiddleware,
    promo_code.apply_promo
  );
  app.post(
    "/api/user/get_timeslot_delivery_fees",
    authMiddleware,
    promo_code.get_timeslot_delivery_fees
  );
  // app.route("/api/v2/user/apply_promo").post(promo_code.apply_promo);
  app
    .route("/api/user/apply_loyalty_points")
    .post(promo_code.apply_loyalty_points);
  app
    .route("/api/user/get_store_promo_codes")
    .post(promo_code.get_store_promo_codes);
  app.route("/api/user/remove_promo_code").post(promo_code.remove_promo_code);
  app
    .route("/api/user/remove_loyalty_points")
    .post(promo_code.remove_loyalty_points);
  app
    .route("/api/user/get_user_loyalty_summary")
    .post(promo_code.get_user_loyalty_summary);
};
