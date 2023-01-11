var sub_category = require("../../controllers/store/sub_category"); // include product controller ////

module.exports = function (app) {
  app.route("/api/store/add_sub_category").post(sub_category.add_sub_category);
  app
    .route("/api/store/update_sub_category")
    .post(sub_category.update_sub_category);
};
