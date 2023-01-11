const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
setting_detail = {};
global.__basedir = __dirname;
process.env.NODE_ENV = process.env.NODE_ENV || "development";
init();

function init() {
  process.setMaxListeners(0);
  require("./config/mongoose")();
  app = require("./config/express")();
  const port = "8080";
  app.listen(port);
  app.use(cors());
  const Setting = require("mongoose").model("setting");
  Setting.findOne({}, function (error, setting) {
    setting_detail = setting;
    console.log("Magic happens on port " + port);
  });
  try {
    // require("./crons/ftp_excel_item_update_cron");
    // require("./crons/new_user_wallet_cron");
    require("./crons/reg_notification_cron");
    require("./crons/user_journey_cron");
    // require("./crons/report_email_cron");
    require("./crons/upload_cron");
    // require("./crons/uc_cron");
  } catch (error) {
    console.log("error:CronJob ", error);
  }
  process.on("uncaughtException", function (err) {
    console.log("uncaughtException->>" + err);
    throw err;
  });
  exports = module.exports = app;
}
