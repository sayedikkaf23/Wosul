var reports = require("../admin_controllers/reports"); // include report controller ////

module.exports = function (app) {
  app.route("/admin/report_outofstock_items").post(reports.outofstock_items);
  app.route("/admin/report_hidden_items").post(reports.hidden_items);
  app.route("/admin/report_items").post(reports.report_items);
  app.route("/admin/reports").post(reports.reports);
};
