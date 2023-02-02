var sub_category = require("../../controllers/store/sub_category"); // include product controller ////
const { authMiddleware } = require("../../middleware/checkAuth");

module.exports = function (app) {
  app.post(
    "/api/store/add_sub_category",
    authMiddleware,
    sub_category.add_sub_category
  );
  app.post(
    "/api/store/update_sub_category",
    authMiddleware,
    sub_category.update_sub_category
  );
};
