var requests = require("../../controllers/store/request"); // include request controller ////
const { authMiddleware } = require("../../middleware/checkAuth");
module.exports = function (app) {
  app.post(
    "/api/store/create_request",
    authMiddleware,
    requests.create_request
  );

  app.post(
    "/api/provider/change_request_status",
    authMiddleware,
    requests.change_request_status
  );

  app.post(
    "/api/provider/complete_request",
    authMiddleware,
    requests.complete_request
  );

  app.post(
    "/api/provider/show_request_invoice",
    authMiddleware,
    requests.show_request_invoice
  );

  app.post(
    "/api/provider/provider_cancel_or_reject_request",
    authMiddleware,
    requests.provider_cancel_or_reject_request
  );

  app.post(
    "/api/provider/get_invoice",
    authMiddleware,
    requests.provider_get_invoice
  );
  app.route("/api/store/get_vehicle_list").post(requests.get_vehicle_list);

  app.post(
    "/api/store/get_vehicles_list",
    authMiddleware,
    requests.get_vehicles_list
  );
};
