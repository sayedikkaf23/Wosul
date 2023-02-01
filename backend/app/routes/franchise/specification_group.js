var specification_group = require("../../controllers/franchise/specification_group"); // include specification_group controller ////
const { authMiddleware } = require("../../middleware/checkAuth");
module.exports = function (app) {
  app.post(
    "/api/franchise/add_specification_group",
    authMiddleware,
    specification_group.add_specification_group
  );
  app.post(
    "/api/franchise/get_specification_group",
    authMiddleware,
    specification_group.get_specification_group
  );
  app.post(
    "/api/franchise/delete_specification_group",
    authMiddleware,
    specification_group.delete_specification_group
  );

  app.post(
    "/api/franchise/get_specification_lists",
    authMiddleware,
    specification_group.get_specification_lists
  );
};
