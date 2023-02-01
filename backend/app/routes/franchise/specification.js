var specification = require("../../controllers/franchise/specification"); // include specification controller ////
const { authMiddleware } = require("../../middleware/checkAuth");

module.exports = function (app) {
  app.post(
    "/api/franchise/add_specification",
    authMiddleware,
    specification.add_specification
  );

  app.post(
    "/api/franchise/get_specification_list",
    authMiddleware,
    specification.get_specification_list
  );

  app.post(
    "/api/franchise/delete_specification",
    authMiddleware,
    specification.delete_specification
  );
};
