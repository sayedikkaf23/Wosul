var order = require("../admin_controllers/order"); // include order controller ////

module.exports = function (app) {
  app.route("/admin/orders_list").post(order.admin_orders);
  app
    .route("/api/admin/order_lists_search_sort")
    .post(order.order_lists_search_sort);
  app.route("/admin/deliveryman_track").post(order.deliveryman_track);
  app
    .route("/admin/order_list_location_track")
    .post(order.order_list_location_track);

  app
    .route("/admin/orders_list_export_excel")
    .get(order.orders_list_export_excel);

  //for admin notes
  app.route("/admin/add_notes").post(order.add_notes);

  //for add delivery boy
  app.route("/admin/add_delivery_boy").post(order.add_delivery_boy);

  //for get delivery boy list
  app.route("/admin/get_delivery_boys").get(order.get_delivery_boys);

  //for update delivery boy
  app.route("/admin/update_delivery_boy").post(order.update_delivery_boy);
};
