const cron = require("node-cron");
var utils = require("../app/utils/utils");
var Cart = require("mongoose").model("cart");
var User = require("mongoose").model("user");
var Setting = require("mongoose").model("setting");
var Order = require("mongoose").model("order");

var notification_interval;
var user_notification_interval;
Setting.findOne({}).then((setting) => {
  notification_interval = setting.cart_notification_interval;
  user_notification_interval = setting.user_notification_interval;
  cron.schedule(`*/${notification_interval} * * * *`, cart_messages);
  console.log("2. Cart message cron started...");
  console.log("************************************");
  cron.schedule(`*/${user_notification_interval} * * * *`, new_user_messages);
  console.log("3. New user register immediate notification cron started...");
  console.log("************************************");
});

const cart_messages = async function () {
  console.log(
    "cart notification running cron interval >> ",
    notification_interval
  );
  const current_time = new Date();
  const upper_time_limit = new Date(
    current_time.getTime() - Number(notification_interval) * 60000
  );
  const lower_time_limit = new Date(
    current_time.getTime() - Number(notification_interval) * 2 * 60000
  );
  console.log("cron is running");
  const carts = await Cart.find({
    updated_at: { $gt: lower_time_limit, $lt: upper_time_limit },
    is_user_complete_order: false,
  });
  const message_setting = await Setting.findOne({});
  // console.log("cart_cron >>> ", JSON.stringify(carts));
  if (carts.length > 0) {
    carts.forEach(async (cart) => {
      const user = await User.findOne({ _id: cart.user_id });
      if (user) {
        console.log("cart_notification >>>", user);
        var message = {
          title: message_setting.cart_notification_message_heading.replace(
            "%NAME%",
            user.first_name
          ),
          body: message_setting.cart_notification_message.replace(
            "%NAME%",
            user.first_name
          ),
          image: message_setting.cart_notification_img_url,
        };
        // var device_type = "android";
        // var device_token = "dg-8o02iRfqaptpBohAx_X:APA91bGSC29deGPk-qWYMRl0ugigFBJrtbwvo7dqfqAO_Wrtjn6A1mSx4RMiMM-6VnurUNjGCGq-gBzHCxuVcKUafClp2H5kT6xVS-LAy49gRAGb37t9Qq9mUqL8aHxPM6_FFdn-uEci";
        var device_type = user.device_type;
        var device_token = user.device_token;
        utils.sendNotification(
          ADMIN_DATA_ID.USER,
          device_type,
          device_token,
          message,
          ""
        );
      }
    });
  }
};

const new_user_messages = async function () {
  const current_time = new Date();

  const lower_time_limit = new Date();

  lower_time_limit.setMinutes(
    lower_time_limit.getMinutes() - user_notification_interval
  );
  const users = await User.find({
    created_at: { $gte: lower_time_limit, $lte: current_time },
  });
  const message_setting = await Setting.findOne({});

  console.log(
    "new user notification running interval >>>",
    user_notification_interval,
    users
  );
  if (users.length > 0) {
    users.forEach(async (user) => {
      const order_count = await Order.countDocuments({ user_id: user._id });
      console.log("order_count of new user :>> " + order_count);
      var message = {
        title: message_setting.new_user_notification_message_heading.replace(
          "%NAME%",
          user.first_name
        ),
        body: message_setting.new_user_notification_message.replace(
          "%NAME%",
          user.first_name
        ),
        image: message_setting.user_notification_img_url,
      };
      console.log("hello new user >>>", user);
      // var device_type = "android";
      // var device_token = "fcG8TjKqTra3KXZYvMSfFU:APA91bGtB1ruhEuJx5N-IjS71YfkEvnyhY-oIy0q7ANrBuzwCNnMRajmg_LU7IPO99I_OiejVKoO7xsWSahTXRJz7yvIgS0fj4pyugIKGpAiyYIR__CdXC-Zt2BH52-tAwsgJGdD_BTS";
      var device_type = user.device_type;
      var device_token = user.device_token;
      if (order_count == 0) {
        utils.sendNotification(
          ADMIN_DATA_ID.USER,
          device_type,
          device_token,
          message,
          ""
        );
      }

      console.log("sent >>>");
    });
  }
};
