var store_earning = require("../../controllers/store/store_earning"); // include store_earning controller ////
const { authMiddleware } = require("../../middleware/checkAuth");

module.exports = function (app) {
  app.post(
    "/api/store/get_store_earning",
    authMiddleware,
    store_earning.get_store_earning
  );

  app.post(
    "/api/store/daily_earning",
    authMiddleware,
    store_earning.store_daily_earning
  );
  app.post(
    "/api/store/weekly_earning",
    authMiddleware,
    store_earning.store_weekly_earning
  );
};
