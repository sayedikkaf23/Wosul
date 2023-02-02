var wallet_request = require("../admin_controllers/wallet_request"); // include wallet_request controller ////
const { authMiddleware } = require("../middleware/checkAuth");

module.exports = function (app) {
  app.post(
    "/api/admin/create_wallet_request",
    authMiddleware,
    wallet_request.create_wallet_request
  );
  app.post(
    "/api/admin/get_wallet_request_list",
    authMiddleware,
    wallet_request.get_wallet_request_list
  );
  app
    .route("/admin/approve_wallet_request_amount")
    .post(wallet_request.approve_wallet_request_amount);
  app
    .route("/admin/transfer_wallet_request_amount")
    .post(wallet_request.transfer_wallet_request_amount);
  app
    .route("/admin/complete_wallet_request_amount")
    .post(wallet_request.complete_wallet_request_amount);
  app
    .route("/admin/cancel_wallet_request")
    .post(wallet_request.cancel_wallet_request);

  app
    .route("/admin/get_wallet_request_list_search_sort")
    .post(wallet_request.get_wallet_request_list_search_sort);

  app
    .route("/admin/get_wallet_request_bank_detail")
    .post(wallet_request.get_wallet_request_bank_detail);
};
