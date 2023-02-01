var product = require("../../controllers/franchise/product"); // include product controller ////
const { authMiddleware } = require("../../middleware/checkAuth");

module.exports = function (app) {
  app.post("/api/franchise/add_product", authMiddleware, product.add_product);
  app.post(
    "/api/franchise/get_product_list",
    authMiddleware,
    product.get_product_list
  );
  app.post(
    "/api/franchise/update_product",
    authMiddleware,
    product.update_product
  );

  app.post(
    "/api/franchise/get_product_data",
    authMiddleware,
    product.get_product_data
  );
  app.post(
    "/api/franchise/get_product_store_data",
    authMiddleware,
    product.get_product_store_data
  );
};
