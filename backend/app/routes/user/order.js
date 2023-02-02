const express = require("express");
const { authMiddleware } = require("../../middleware/checkAuth");

var orders = require("../../controllers/user/order"); // include order controller ////

module.exports = function (app) {
  app.post(
    "/api/user/order_confirmation",
    authMiddleware,
    orders.order_confirmation
  );
  app.post(
    "/api/user/user_cancel_order",
    authMiddleware,
    orders.user_cancel_order
  );
  app.post("/api/user/create_order", authMiddleware, orders.create_order);
  app.post(
    "/api/store/set_order_status",
    authMiddleware,
    orders.set_order_status
  );
  app.post(
    "/api/store/order_on_hold_payment",
    authMiddleware,
    orders.order_on_hold_payment
  );
  app.post(
    "/api/store/store_cancel_or_reject_order",
    authMiddleware,
    orders.store_cancel_or_reject_order
  );

  app.route("/api/admin/admin_update_order").post(orders.admin_update_order);
  app
    .route("/api/admin/admin_change_order_store")
    .post(orders.admin_change_order_store);
  app
    .route("/api/admin/admin_revert_completed_order")
    .post(orders.admin_revert_completed_order);

  app.post("/api/user/show_invoice", authMiddleware, orders.show_invoice);
  app.post("/api/get_order_detail", authMiddleware, orders.get_order_detail);
};
