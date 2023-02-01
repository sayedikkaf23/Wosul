var provider_earning = require("../../controllers/provider/provider_earning"); // include provider controller ////
const { authMiddleware } = require("../../middleware/checkAuth");

module.exports = function (app) {
  app.post(
    "/api/provider/daily_earning",
    authMiddleware,
    provider_earning.provider_daily_earning
  );
  app.post(
    "/api/provider/weekly_earning",
    authMiddleware,
    provider_earning.provider_weekly_earning
  );
};
