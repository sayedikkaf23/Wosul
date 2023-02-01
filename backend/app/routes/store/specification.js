var specification = require("../../controllers/store/specification"); // include specification controller ////
const { authMiddleware } = require("../../middleware/checkAuth");

module.exports = function (app) {
  app.post(
    "/api/store/add_specification",
    authMiddleware,
    specification.add_specification
  );

  app.post(
    "/api/store/get_specification_list",
    authMiddleware,
    specification.get_specification_list
  );

  app.post(
    "/api/store/delete_specification",
    authMiddleware,
    specification.delete_specification
  );
};
