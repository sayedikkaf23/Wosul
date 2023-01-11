var CronJob = require("cron").CronJob;
const utils = require("../app/utils/utils");
const User = require("mongoose").model("user");
const Setting = require("mongoose").model("setting");
const Order = require("mongoose").model("order");

Setting.findOne({}).then((setting) => {
  // cron.validate(cronString)
  notification_interval = setting.cart_notification_interval;
  user_notification_interval = setting.user_notification_interval;
  if (setting.step_notification && setting.step_notification.length) {
    setting.step_notification.forEach((step, idx) => {
      const [time_hr, time_min] = step.time.split(":");
      /**
       * check for rules
       * https://crontab.guru/
       */
      const cronString = `${Number(time_min)} ${Number(time_hr)} */${step.interval} * *`;
      console.log("cronString: ", cronString);
      new CronJob(
        cronString,
        stepNotification.bind(this, step),
        null,
        true,
        "Asia/Dubai"
      );
      console.log("4. User register step cron started for step.....", idx + 1);
      console.log("time_min, time_hr: ", time_min, time_hr);
      console.log("--------------------------------------------");
    });
    console.log("************************************");
  }
});

const stepNotification = async function (step) {
  console.log("cron running for step: ", step);
  if (step && step.is_send_notification) {
    const { interval } = step;
    const current_time = new Date();

    let lower_time_limit = new Date();
    lower_time_limit.setDate(lower_time_limit.getDate() - interval);

    const users = await User.find({
      created_at: { $gte: lower_time_limit, $lte: current_time },
    });

    console.log("user interval >>>", interval, users);
    if (users.length > 0) {
      users.forEach(async (user) => {
        const order_count = await Order.countDocuments({ user_id: user._id });
        console.log("order_count of new user :>> " + order_count);
        if (order_count == 0) {
          var message = {
            title: step.title.replace("%NAME%", user.first_name),
            body: step.body.replace("%NAME%", user.first_name),
            image: step.img_url,
          };
          console.log("hello new user >>>", user);
          // var device_type = "android";
          // var device_token = "fcG8TjKqTra3KXZYvMSfFU:APA91bGtB1ruhEuJx5N-IjS71YfkEvnyhY-oIy0q7ANrBuzwCNnMRajmg_LU7IPO99I_OiejVKoO7xsWSahTXRJz7yvIgS0fj4pyugIKGpAiyYIR__CdXC-Zt2BH52-tAwsgJGdD_BTS";
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

        console.log("sent >>>");
      });
    }
  }
};
