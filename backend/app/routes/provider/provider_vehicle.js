var provider_vehicle = require("../../controllers/provider/provider_vehicle"); // include provider_vehicle controller ////
const { authMiddleware } = require("../../middleware/checkAuth");

module.exports = function (app) {
  app.post(
    "/api/provider/add_vehicle",
    authMiddleware,
    provider_vehicle.add_vehicle
  );

  app.post(
    "/api/provider/update_vehicle_detail",
    authMiddleware,
    provider_vehicle.update_vehicle_detail
  );

  app.post(
    "/api/provider/get_vehicle_list",
    authMiddleware,
    provider_vehicle.get_vehicle_list
  );

  app.post(
    "/api/provider/select_vehicle",
    authMiddleware,
    provider_vehicle.select_vehicle
  );
};
