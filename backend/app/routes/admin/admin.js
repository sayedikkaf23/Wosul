var installation_setting = require("../../controllers/admin/installation_setting"); // include installation_setting controller ////
var admin = require("../../controllers/admin/admin"); // include admin_setting controller ////
var city = require("../../controllers/admin/city"); // include city controller ////
var country = require("../../controllers/admin/country"); // include country controller ////
var delivery = require("../../controllers/admin/delivery"); // include delivery controller ////
var service = require("../../controllers/admin/service"); // include service controller ////
var vehicle = require("../../controllers/admin/vehicle"); // include vehicle controller ////
var document = require("../../controllers/admin/document"); // include document controller ////
var ftp_server = require("../../controllers/admin/ftp_server"); // include ftp_server controller ////
const { authMiddleware } = require("../../middleware/checkAuth");

module.exports = function (app) {
  // START AUTO UPDATE DB QUERY API.
  app.route("/update_store_time").post(admin.update_store_time);
  app.route("/update_wallet").post(admin.update_wallet);
  app.route("/insert_daily_weekly_data").post(admin.insert_daily_weekly_data);
  app.route("/updateDatabaseTable").post(admin.updateDatabaseTable);
  app.route("/updateItemNewTable").post(admin.updateItemNewTable);
  // END AUTO UPDATE DB QUERY API.

  app
    .route("/admin/upload_store_data_excel")
    .post(admin.upload_store_data_excel);
  app.route("/admin/upload_store_images").post(admin.upload_store_images);

  // REGULAR API FOR APP.
  app.route("/api/admin/forgot_password").post(admin.forgot_password);
  app.route("/api/admin/otp_verification").post(admin.otp_verification);
  app.route("/api/admin/check_detail").post(admin.check_detail);
  app.route("/api/admin/new_password").post(admin.new_password);
  app.route("/api/admin/check_referral").post(admin.check_referral);
  // add middleware
  app.post("/api/admin/get_setting_detail", admin.get_setting_detail);
  app
    .route("/api/admin/update_item_subcategory")
    .post(admin.update_item_subcategory);

  app
    .route("/api/admin/get_setting_detail_for_mail_config")
    .post(admin.get_setting_detail_for_mail_config);

  app.post("/api/admin/get_time_sheet", admin.get_time_sheet);

  app.route("/api/admin/set_play_pause").post(admin.set_play_pause);
  app.route("/api/admin/get_time_sheet_data").post(admin.get_time_sheet_data);
  app.route("/api/admin/get_app_keys").post(installation_setting.get_app_keys);
  app
    .route("/api/admin/check_app_keys")
    .post(installation_setting.check_app_keys);
  app
    .route("/api/admin/get_image_setting")
    .post(installation_setting.get_image_setting);

  app.route("/api/admin/get_country_list").get(country.get_country_list);
  app.route("/api/admin/get_city_list").post(city.get_city_list);
  app
    .route("/api/admin/get_city_full_detail_list")
    .post(city.get_city_full_detail_list);
  app.route("/admin/get_all_city_list").post(city.all_city_list);

  app.route("/api/admin/get_vehicle_list").post(vehicle.get_vehicle_list);
  app.route("/api/admin/get_city_lists").post(vehicle.get_city_lists);
  app.post(
    "/api/admin/get_service_list",
    authMiddleware,
    service.get_service_list
  );

  app.route("/api/admin/get_delivery_list").get(delivery.get_delivery_list);
  app
    .route("/api/admin/get_delivery_list_for_city")
    .post(delivery.get_delivery_list_for_city);

  app.route("/api/admin/get_document_list").post(document.get_document_list);
  app.route("/api/admin/upload_document").post(document.upload_document);

  //Define routes for ftp_server
  app
    .route("/api/admin/add_ftp_server_details")
    .post(ftp_server.add_ftp_server_details);

  app
    .route("/api/admin/update_ftp_server_details")
    .post(ftp_server.update_ftp_server_details);

  app
    .route("/api/admin/get_ftp_server_details")
    .get(ftp_server.get_ftp_server_details);

  app
    .route("/api/admin/get_ftp_server_detail_by_id")
    .post(ftp_server.get_ftp_server_detail_by_id);

  app.post(
    "/api/admin/delete_ftp_server",
    authMiddleware,
    ftp_server.delete_ftp_server
  );

  app
    .route("/api/admin/upload_header_data_excel")
    .post(ftp_server.upload_header_data_excel);
};
