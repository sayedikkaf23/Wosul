var CronJob = require("cron").CronJob;
var utils = require("../app/utils/utils");
var Setting = require("mongoose").model("setting");
var User = require("mongoose").model("user");
var Advertise = require("mongoose").model("advertise");

const sendNotification = async function () {
  const setting = await Setting.findOne({});
  const count = setting.welcome_wallet_notification_count;
  console.log("sendNotification running :>> ", count);
  if (count > 0) {
    const current_time = new Date();
    const lower_time_limit = new Date(
      current_time.getTime() - count * 24 * 60 * 60 * 1000
    );

    const users = await User.find({
      created_at: { $gt: lower_time_limit, $lt: current_time },
    });
    console.log("user :>> ", users.length);
    if (users.length > 0) {
      users.forEach(async (user) => {
        console.log("user.first_name :>> ");
        if (user.wallet > 0) {
          var device_type = user.device_type;
          var device_token = user.device_token;
          // var device_token = 'cAZzpeEsRL6jMy-RjDkW1m:APA91bE9Xy8sFrFjl_AbEhfygriiX5hxMd1c7goB30fgJSR_1BltOOYemYHPwGiKTbBUjh8jE38t6h7AAP0p27hzwK0EIzIKwokO8fSq-Dkpmip8T1zMoyMJP6dleI00Pn0qKiCle-UF';
          const adv = await Advertise.aggregate([{ $sample: { size: 1 } }]);

          var message = {
            title: setting.welcome_wallet_message_title.replace(
              "%NAME%",
              user.first_name
            ),
            body: setting.welcome_wallet_message_body.replace(
              "%AMOUNT%",
              user.wallet
            ),
            image: setting.wallet_notification_img_url,
          };
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
  }
};
const sendNotificatioToExistingUsr = async function () {
  const setting = await Setting.findOne({});
  const count = setting.welcome_wallet_notification_count;
  console.log("running exist :>> ");
  if (setting.is_send_wallet_notification) {
    const current_time = new Date();
    const lower_time_limit = new Date(
      current_time.getTime() - count * 24 * 60 * 60 * 1000
    );

    const users = await User.find({
      created_at: { $lt: lower_time_limit },
      wallet: { $gt: 0 },
    });
    users.forEach(async (user) => {
      if (user.wallet > 0) {
        var device_type = user.device_type;
        var device_token = user.device_token;
        // var device_token = 'cAZzpeEsRL6jMy-RjDkW1m:APA91bE9Xy8sFrFjl_AbEhfygriiX5hxMd1c7goB30fgJSR_1BltOOYemYHPwGiKTbBUjh8jE38t6h7AAP0p27hzwK0EIzIKwokO8fSq-Dkpmip8T1zMoyMJP6dleI00Pn0qKiCle-UF'; // syd device token
        // var device_token = 'cO3BxVvTSpeRw3rdg9I-EW:APA91bFMhVn4ebzP9WYa64TdnQ2mQ229fO7wjocT4VRY4edZDZO3B70XimfIH9dTQhT-9BNbBvAMbQNzi-gdV_tOWkGMDX0dCjG0uzb78V3nCnVgLivuSLDi8pQEoSNv9WkrEPPwNT2y';

        const adv = await Advertise.aggregate([{ $sample: { size: 1 } }]);
        var message = {
          title: setting.welcome_wallet_message_title.replace(
            "%NAME%",
            user.first_name
          ),
          body: setting.welcome_wallet_message_body.replace(
            "%AMOUNT%",
            user.wallet
          ),
          image: setting.wallet_notification_img_url,
        };
        utils.sendNotification(
          ADMIN_DATA_ID.USER,
          device_type,
          device_token,
          message,
          ""
        );
      }
    });
    console.log("user1122 :>> ", users.length);
  }
};
Setting.findOne({}).then((setting) => {
  let time = setting.welcome_wallet_notification_time.split(":");
  const day_interval = setting.wallet_notification_interval;

  var time_hr = time[0];
  var time_min = time[1];
  // cron.schedule(`*/1 * * * *`, sendNotificatioToExistingUsr) ;
  const job = new CronJob(
    `${time_min} ${time_hr} * * *`,
    sendNotification,
    null,
    true,
    "Asia/Dubai"
  );
  const job1 = new CronJob(
    `${time_min} ${time_hr} */${day_interval} * *`,
    sendNotificatioToExistingUsr,
    null,
    true,
    "Asia/Dubai"
  );
  // const job1 = new CronJob(`*/5 * * * *`, sendNotificatioToExistingUsr, null, true, 'Asia/Dubai');
  job1.start();
  job.start();
  console.log("1. New User wallet cron started...");
  console.log("************************************");
});
