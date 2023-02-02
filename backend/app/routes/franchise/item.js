var item = require("../../controllers/franchise/item"); // include item controller ////
const { authMiddleware } = require("../../middleware/checkAuth");

module.exports = function (app) {
  app.post("/api/franchise/add_item", authMiddleware, item.add_item);

  app.route("/api/franchise/upload_item_image").post(item.upload_item_image);
  app.route("/api/franchise/update_item_image").post(item.update_item_image);
  app.post(
    "/api/franchise/get_store_product_item_list",
    authMiddleware,
    item.get_store_product_item_list
  );
  app.post(
    "/api/franchise/get_for_store_product_item_list",
    authMiddleware,
    item.get_for_store_product_item_list
  );
  app.post("/api/franchise/get_item_list", authMiddleware, item.get_item_list);
  app.post("/api/franchise/update_item", authMiddleware, item.update_item);

  app.post("/api/franchise/get_item_data", authMiddleware, item.get_item_data);
  app.route("/api/franchise/is_item_in_stock").post(item.is_item_in_stock);

  app.post(
    "/api/franchise/delete_item_image",
    authMiddleware,
    item.delete_item_image
  );
};
