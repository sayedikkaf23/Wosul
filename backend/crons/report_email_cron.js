var CronJob = require("cron").CronJob;
var utils = require("../app/utils/utils");
var Order = require("mongoose").model("order");
var Admin = require("mongoose").model("admin");
var template = require("../report_email_template/template");
var Setting = require("mongoose").model("setting");

const mail_report = async function () {
  console.log("mail cron is running >>>");
  try {
    await send_to_admins();
    await send_to_stores();
  } catch (err) {
    console.log("err", err.message);
  }
};

const get_order = async function (type) {
  const day = new Date();
  var last_day;
  if (type == "mtd") {
    const fist_day_of_month = new Date(day.getFullYear(), day.getMonth(), 1);
    last_day = fist_day_of_month;
  } else {
    const yesterday = new Date(day.getTime() - 24 * 60 * 60 * 1000);
    last_day = yesterday;
  }

  var filter = {
    $match: { created_at: { $gte: last_day, $lte: day } },
  };
  const settings = await Setting.findOne({});
  const payment_gateway_fee = settings.payment_gateway_fee;
  const store_commission_for_online_payment =
    settings.store_commission_for_online_payment / 100;
  const store_commission = settings.store_commission / 100;
  // console.log('store_commission_for_online_payment :>> ', store_commission_for_online_payment);
  // console.log('store_commission :>> ', store_commission);
  // console.log('settings.payment_gateway_fee :>> ', settings.payment_gateway_fee);
  const stores = await Order.aggregate([
    filter,
    {
      $match: {
        order_status: ORDER_STATE.ORDER_COMPLETED,
      },
    },
    {
      $lookup: {
        from: "stores",
        localField: "store_id",
        foreignField: "_id",
        as: "store_details",
      },
    },
    { $unwind: "$store_details" },
    {
      $lookup: {
        from: "order_payments",
        localField: "order_payment_id",
        foreignField: "_id",
        as: "order_payment_details",
      },
    },
    { $unwind: "$order_payment_details" },
    {
      $lookup: {
        from: "carts",
        localField: "cart_id",
        foreignField: "_id",
        as: "cart_details",
      },
    },
    { $unwind: "$cart_details" },
    {
      $group: {
        _id: "$store_details._id",
        name: {
          $first: "$store_details.name",
        },
        unique_id: {
          $first: "$store_details.unique_id",
        },
        email: {
          $first: "$store_details.email",
        },
        is_send_mail_report: {
          $first: "$store_details.is_send_mail_report",
        },
        location: {
          $first: "$cart_details.pickup_addresses",
        },
        tot: {
          $first: "$order_payment_details.total",
        },
        store_earning: {
          $sum: {
            $multiply: [
              "$order_payment_details.total_store_income",
              "$order_payment_details.current_rate",
            ],
          },
        },
        yeepeey_earning: {
          $sum: {
            $cond: {
              if: {
                $eq: [
                  "$order_payment_details.is_payment_mode_online_payment",
                  true,
                ],
              },
              then: {
                $add: [
                  {
                    $subtract: [
                      {
                        $multiply: [
                          "$order_payment_details.total",
                          store_commission_for_online_payment,
                        ],
                      },
                      payment_gateway_fee,
                    ],
                  },
                  "$order_payment_details.total_delivery_price",
                ],
              },
              else: {
                $add: [
                  {
                    $multiply: [
                      "$order_payment_details.total",
                      store_commission,
                    ],
                  },
                  "$order_payment_details.total_delivery_price",
                ],
              },
            },
            // $add : ["$order_payment_details.total_delivery_price", "$order_payment_details.total_store_income"]
          },
        },
        orders_count: { $sum: 1 },
      },
    },
  ]);
  return stores;
};
const get_stores = async function () {
  const today_order = await get_order("today");
  const mtd_order = await get_order("mtd");
  const stores = [];
  if (today_order) {
    today_order.forEach((order) => {
      for (let i = 0; i < mtd_order.length; i++) {
        if (order.unique_id == mtd_order[i].unique_id) {
          let d = {
            email: order.email,
            name: order.name,
            is_send_mail_report: order.is_send_mail_report,
            orders_count: order.orders_count,
            total_orders_count: mtd_order[i].orders_count,
            store_earning: order.store_earning,
            total_store_earning: mtd_order[i].store_earning.toFixed(2),
            yeepeey_earning: order.yeepeey_earning.toFixed(2),
            total_yeepeey_earning: mtd_order[i].yeepeey_earning.toFixed(2),
            unique_id: order.unique_id,
            location: order.location[0].address,
          };
          stores.push(d);
          break;
        }
      }
    });
  }
  return stores;
};

const genrate_admin_template = async function () {
  // const data = [
  //   {
  //     orders_count : 12,
  //     total_orders_count : 42,
  //     store_earning : 456,
  //     total_store_earning : 1025,
  //     yeepeey_earning : 102,
  //     total_yeepeey_earning : 786,
  //     name : "Happy Minimart",
  //     location : "Business Bay"
  //   },
  //   {
  //     orders_count : 12,
  //     total_orders_count : 42,
  //     store_earning : 456,
  //     total_store_earning : 1025,
  //     yeepeey_earning : 102,
  //     total_yeepeey_earning : 786,
  //     name : "MQ Minimart",
  //     location : "D Bay"
  //   },
  //   {
  //     orders_count : 12,
  //     total_orders_count : 42,
  //     store_earning : 456,
  //     total_store_earning : 1025,
  //     yeepeey_earning : 102,
  //     total_yeepeey_earning : 786,
  //     name : "Union Coop",
  //     location : "U Bay"
  //   },
  // ]
  const data = await get_stores();
  // console.log("data >>>", data )

  let template_admin = "";
  for (let i = 0; i < data.length; i++) {
    var background = "";
    if (i % 2 == 0) {
      background = `'background-color: #f2f2f2;'`;
    }
    template_admin =
      template_admin +
      `<tr style=${background}>
    <td>${data[i].name}</td>
    <td>${data[i].location}</td>
    <td>${data[i].orders_count}</td>
    <td>${data[i].store_earning} AED</td>
    <td>${data[i].yeepeey_earning} AED</td>
    <td>${data[i].total_orders_count}</td>
    <td>${data[i].total_store_earning} AED</td>
    <td>${data[i].total_yeepeey_earning} AED</td>
    <tr/>`;
  }
  return template_admin;
};

const send_to_admins = async function () {
  const admins = await Admin.find({});
  const admin_template = await genrate_admin_template();
  // console.log("admin report send >>>", admins )
  // console.log("template report send >>>", template)

  if (admins && template) {
    var date = new Date();
    console.log("admin report send >>>");
    const to = "zeeshan111100@gmail.com";
    const sub = `Report of the day ${date.toDateString()} till now!`;
    const text = " ";
    const html = template.admin_template({
      template: admin_template,
      date: date.toDateString(),
    });
    utils.mail_notification(to, sub, text, html);
  }
};

const send_to_stores = async function () {
  const stores = await get_stores();
  if (stores) {
    // console.log('stores >>', stores)
    console.log("store report send >>>");
    var date = new Date();
    stores.forEach((store) => {
      if (store.is_send_mail_report) {
        // const to = store.email
        const to = "zeeshan111100@gmail.com";
        const sub = `Report of the day ${date.toDateString()} till now!`;
        const text = " ";
        const html = template.template({ ...store, date: date.toDateString() });
        utils.mail_notification(to, sub, text, html);
      }
    });
  }
};

// cron.schedule(`*/1 * * * *`, mail_report) ;
const job = new CronJob("55 23 * * *", mail_report, null, true, "Asia/Dubai");
job.start();
console.log("5. Report email cron started...");
console.log("************************************");
