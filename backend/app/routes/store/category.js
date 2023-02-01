var category = require("../../controllers/store/category"); // include category controller ////
const { authMiddleware } = require("../../middleware/checkAuth");

module.exports = function (app) {
  app.route("/api/store/add_category").post(category.add_category);

  app.post(
    "/api/store/get_category_list",
    authMiddleware,
    category.get_category_list
  );

  app.route("/api/store/update_category").post(category.update_category);
  
  app.post(
    "/api/store/get_category_data",
    authMiddleware,
    category.get_category_data
  );
  app
    .route("/api/get_category_item_detail")
    .post(category.get_category_item_detail);

  // app.route('/api/add_default_category').post(category.add_default_category);
};
