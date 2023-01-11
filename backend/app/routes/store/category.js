var category = require("../../controllers/store/category"); // include category controller ////

module.exports = function (app) {
  app.route("/api/store/add_category").post(category.add_category);
  app.route("/api/store/get_category_list").post(category.get_category_list);
  app.route("/api/store/update_category").post(category.update_category);
  app.route("/api/store/get_category_data").post(category.get_category_data);
  app
    .route("/api/get_category_item_detail")
    .post(category.get_category_item_detail);

  // app.route('/api/add_default_category').post(category.add_default_category);
};
