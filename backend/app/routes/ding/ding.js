var ding = require("../../controllers/ding/ding");

module.exports = function (app) {
  app.route("/api/ding/get_currencies").post(ding.get_currencies);
  app.route("/api/ding/get_countries").post(ding.get_countries);
  app.route("/api/ding/get_regions").post(ding.get_regions);
  app.route("/api/ding/get_providers").post(ding.get_providers);
  app.route("/api/ding/get_products").post(ding.get_products);
  app.route("/api/ding/estimate_price").post(ding.estimate_price);
  app
    .route("/api/ding/get_product_description")
    .post(ding.get_product_description);
  app.route("/api/ding/ding_order_payment").post(ding.ding_order_payment);
  app.route("/api/ding/get_number").post(ding.get_number);
};
