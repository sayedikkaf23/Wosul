var item = require("../../controllers/store/item"); // include item controller ////
const { authMiddleware } = require("../../middleware/checkAuth");

module.exports = function (app) {
  app
    .route("/api/store/user_order_confirmation_push")
    .post(item.user_order_confirmation_push);

  app
    .route("/api/store/user_substitute_confirmation_push")
    .post(item.user_substitute_confirmation_push);

  app.route("/api/store/update_cart_detail").post(item.update_cart_detail);

  // store app
  app.post(
    "/api/store/get_substitute_items",
    authMiddleware,
    item.get_substitute_items
  );

  // for store panel //
  app
    .route("/api/store/get_substitute_item_list")
    .post(item.get_substitute_item_list);
  app
    .route("/api/store/update_substitute_item")
    .post(item.update_substitute_item);

  app
    .route("/api/store/assign_substitute_item")
    .post(item.assign_substitute_item);
  app
    .route("/api/store/update_cart_item_price")
    .post(item.update_cart_item_price);
  app
    .route("/api/store/get_cart_items_prices_with_notifications")
    .post(item.get_cart_items_prices_with_notifications);
  app
    .route("/api/store/remove_item_substitute")
    .post(item.remove_item_substitute);
  app
    .route("/api/store/get_substitute_by_barcode")
    .post(item.get_substitute_by_barcode);

  app
    .route("/api/get_checked_substitute_items")
    .post(item.get_checked_substitute_items);
  app.route("/api/all_selected_item").post(item.all_selected_item);

  app.post(
    "/api/store/select_substitute_item",
    authMiddleware,
    item.select_substitute_item
  );

  app.post("/api/store/add_item", authMiddleware, item.add_item);

  app.route("/api/store/upload_item_image").post(item.upload_item_image);
  app.route("/api/store/update_item_image").post(item.update_item_image);
  app.post(
    "/api/store/get_store_product_item_list",
    authMiddleware,
    item.get_store_product_item_list
  );
  app.post("/api/store/get_item_list", authMiddleware, item.get_item_list);

  app.post("/api/store/update_item", authMiddleware, item.update_item);
  app.post("/api/store/delete_item", authMiddleware, item.delete_item);

  app.post("/api/store/get_item_data", authMiddleware, item.get_item_data);

  app.route("/api/store/is_item_in_stock").post(item.is_item_in_stock);

  app.post(
    "/api/store/delete_item_image",
    authMiddleware,
    item.delete_item_image
  );

  app.post("/api/get_item_detail", authMiddleware, item.get_item_detail);
  app
    .route("/api/store/update_sequence_number")
    .post(item.update_sequence_number);
  app.route("/api/get_item_by_barcode").post(item.get_item_by_barcode);

  app.get("/api/store/get_ingrediant", authMiddleware, item.get_ingrediant);

  app.post(
    "/api/store/get_ingrediant_by_id",
    authMiddleware,
    item.get_ingrediant_by_id
  );

  app.get(
    "/api/store/get_measuring_unit",
    authMiddleware,
    item.get_measuring_unit
  );

  app.get("/api/store/get_modifier", authMiddleware, item.get_modifier);

  app.get("/api/store/get_discount", authMiddleware, item.get_discount);

  app.get(
    "/api/store/get_measurement_category",
    authMiddleware,
    item.get_measurement_category
  );

  app.get("/api/store/get_measurement", authMiddleware, item.get_measurement);

  app.get("/api/store/get_supplier", authMiddleware, item.get_supplier);

  app.get("/api/store/get_brand", authMiddleware, item.get_brand);

};
