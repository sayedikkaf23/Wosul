let mongoose = require("mongoose");
mongoose.Promise = global.Promise;
let autoIncrement = require("mongoose-auto-increment");

module.exports = function () {
  /// for mongoose 4
  // let db = mongoose.connect(config.db, {useMongoClient: true});
  // autoIncrement.initialize(db);

  //// for mongoose 5
  let db = mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex: true,
  });
  console.log("Connected to DB :>> ", process.env.MONGO_URL);
  autoIncrement.initialize(mongoose.connection);

  require("../app/models/admin/settings");
  require("../app/models/admin/delivery");
  require("../app/models/admin/vehicle");
  require("../app/models/admin/country");
  require("../app/models/admin/city");
  require("../app/models/admin/service");
  require("../app/models/admin/installation_setting");
  require("../app/models/admin/promo_code");

  require("../app/models/admin/document");
  require("../app/models/admin/payment_gateway");
  require("../app/models/admin/sms_gateway");
  require("../app/models/admin/time_sheet");
  require("../app/models/admin/admin");
  require("../app/models/admin/database_backup");
  require("../app/models/admin/wallet_history");
  require("../app/models/admin/delivery_type");
  require("../app/models/admin/document_uploaded_list");
  require("../app/models/admin/cityzone");
  require("../app/models/admin/zonevalue");
  require("../app/models/admin/wallet_request");
  require("../app/models/admin/image_setting");
  require("../app/models/admin/transfer_history");
  require("../app/models/admin/mass_notification");
  require("../app/models/user/user");
  require("../app/models/user/card");
  require("../app/models/user/order");
  require("../app/models/user/cart");
  require("../app/models/user/review");
  require("../app/models/user/order_payment");
  require("../app/models/user/referral_code");
  require("../app/models/user/user_favourite_address");
  require("../app/models/user/user_setting");

  require("../app/models/provider/provider");
  require("../app/models/provider/bank_detail");
  require("../app/models/provider/provider_analytic_daily");
  require("../app/models/provider/provider_vehicle");

  require("../app/models/store/franchise");
  require("../app/models/store/store");
  require("../app/models/store/product");
  require("../app/models/store/specification");
  require("../app/models/store/specification_group");
  require("../app/models/store/item");
  require("../app/models/store/store_analytic_daily");
  require("../app/models/store/advertise");
  require("../app/models/store/request");

  require("../app/models/email_sms/email");
  require("../app/models/email_sms/sms");
  require("../app/models/email_sms/notifications");
  require("../app/models/admin/group");
  require("../app/models/admin/group_user");
  require("../app/models/store/category");

  return db;
};
