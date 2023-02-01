var wallet = require("../../controllers/user/wallet"); // include user controller ////
const { authMiddleware } = require("../../middleware/checkAuth");


module.exports = function (app) {
  app.post(
    "/api/user/add_wallet_amount",
    authMiddleware,
    wallet.add_wallet_amount
  );
  app.post(
    "/api/user/change_user_wallet_status",
    authMiddleware,
    wallet.change_user_wallet_status
  );
  app.post(
    "/api/admin/get_wallet_history",
    authMiddleware,
    wallet.get_wallet_history
  );
};
