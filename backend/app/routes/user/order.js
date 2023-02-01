const express = require("express");
var orders = require("../../controllers/user/order"); // include order controller ////
const { authMiddleware } = require("../../middleware/checkAuth");

module.exports = function (app) {
  app.route("/api/user/order_confirmation").post(orders.order_confirmation);
  app.route("/api/user/user_cancel_order").post(orders.user_cancel_order);
  app.route("/api/user/create_order").post(orders.create_order);
  app.route("/api/store/set_order_status").post(orders.set_order_status);
  app
    .route("/api/store/order_on_hold_payment")
    .post(orders.order_on_hold_payment);
  app
    .route("/api/store/store_cancel_or_reject_order")
    .post(orders.store_cancel_or_reject_order);

  app.route("/api/admin/admin_update_order").post(orders.admin_update_order);
  app
    .route("/api/admin/admin_change_order_store")
    .post(orders.admin_change_order_store);
  app
    .route("/api/admin/admin_revert_completed_order")
    .post(orders.admin_revert_completed_order);
  app.route("/api/user/show_invoice").post(orders.show_invoice);
  app.post("/api/get_order_detail", authMiddleware, orders.get_order_detail);
};
