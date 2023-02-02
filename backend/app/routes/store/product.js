var product = require("../../controllers/store/product"); // include product controller ////
const { authMiddleware } = require("../../middleware/checkAuth");

module.exports = function (app) {
  app.post("/api/store/add_product", authMiddleware, product.add_product);
  app.post(
    "/api/store/get_product_list",
    authMiddleware,
    product.get_product_list
  );
  app.post("/api/store/update_product", authMiddleware, product.update_product);
  app.post("/api/store/delete_product", authMiddleware, product.delete_product);
  app.post(
    "/api/store/get_product_data",
    authMiddleware,
    product.get_product_data
  );

  app
    .route("/api/webhook/store/update_product")
    .put(product.webhook_update_product);
  app
    .route("/api/get_product_item_detail")
    .post(product.get_product_item_detail);
};
