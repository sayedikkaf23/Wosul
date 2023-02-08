const { authMiddleware } = require("../../middleware/checkAuth");

var carts = require("../../controllers/user/cart"); // include carts controller ////

module.exports = function (app) {
  app.post(
    "/api/user/add_item_in_cart",
    authMiddleware,
    carts.add_item_in_cart
  );
  app
    .route("/api/v2/user/add_update_item_in_cart")
    .post(carts.add_update_item_in_cart_v2);
  app
    .route("/api/v2/user/create_and_update_cart")
    .post(carts.create_and_update_cart);
  app.post(
    "/api/user/add_item_in_ramadan_cart",
    authMiddleware,
    carts.add_item_in_ramadan_cart
  );
  app.post("/api/user/get_cart", authMiddleware, carts.get_cart);
  app.post("/api/user/clear_cart", authMiddleware, carts.clear_cart);
  app.route("/api/user/get_payment_gateway").post(carts.get_payment_gateway);
  app
    .route("/api/user/change_delivery_address")
    .post(carts.change_delivery_address);
  app
    .route("/api/user/check_delivery_available")
    .post(carts.check_delivery_available);
  app.route("/api/user/country_city_list").post(carts.country_city_list);
  app.route("/api/user/checkout").post(carts.checkout_payment);
  app.route("/api/user/deduct_amount").post(carts.deduct_amount);
  app.post(
    "/api/user/ramadan_add_item_in_cart",
    authMiddleware,
    carts.ramadan_add_item_in_cart
  );
  app
    .route("/api/user/request_card_payment_by_instrument")
    .post(carts.request_card_payment_by_instrument);
  app.route("/api/user/card_online_payment").post(carts.card_online_payment);

  app.route("/api/user/get_item_modifiers").post(carts.get_item_modifiers);
};
