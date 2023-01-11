require("../utils/message_code");
require("../utils/error_code");
require("../utils/constants");
var utils = require("../utils/utils");
var Store = require("mongoose").model("store");
var console = require("../utils/console");
const moment = require("moment");
var User = require("mongoose").model("user");
var Provider = require("mongoose").model("provider");
var Order = require("mongoose").model("order");
var City = require("mongoose").model("city");
var Cart = require("mongoose").model("cart");
var Country = require("mongoose").model("country");
var mongoose = require("mongoose");
var Schema = mongoose.Types.ObjectId;

// order_detail
exports.order_detail = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], async function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      var start_date = request_data_body.start_date;
      var end_date = request_data_body.end_date;

      if (start_date !== "" && end_date !== "") {
        start_date = new Date(start_date.formatted);
        start_date = start_date.setHours(0, 0, 0, 0);
        start_date = new Date(start_date);
        end_date = new Date(end_date.formatted);
        end_date = end_date.setHours(23, 59, 59, 999);
        end_date = new Date(end_date);
      } else {
        start_date = new Date(0);
        end_date = new Date(Date.now());
      }

      var list = {
        total_users: 0,
        total_providers: 0,
        total_store: 0,
        total_countries: 0,
        total_cities: 0,
      };

      var query = {};
      query["created_at"] = { $gte: start_date, $lt: end_date };
      if (request_data_body.country_id !== "all") {
        query["country_id"] = request_data_body.country_id;
      }

      User.countDocuments(query, function (err, total_users) {
        if (err) {
          console.log(err);
        } else {
          list.total_users = total_users;
        }
      });

      Provider.countDocuments(query, function (err, total_providers) {
        if (err) {
          console.log(err);
        } else {
          list.total_providers = total_providers;
        }
      });

      Country.countDocuments({}, function (err, total_countries) {
        if (err) {
          console.log(err);
        } else {
          list.total_countries = total_countries;
        }
      });

      City.countDocuments(query, function (err, total_cities) {
        if (err) {
          console.log(err);
        } else {
          list.total_cities = total_cities;
        }
      });

      Store.countDocuments(query, function (err, total_store) {
        if (err) {
          console.log(err);
        } else {
          list.total_store = total_store;
        }
      });

      var order_payment = {
        $lookup: {
          from: "order_payments",
          localField: "order_payment_id",
          foreignField: "_id",
          as: "order_payment_detail",
        },
      };
      var array_to_json_order_payment = { $unwind: "$order_payment_detail" };

      var store = {
        $lookup: {
          from: "stores",
          localField: "store_id",
          foreignField: "_id",
          as: "store_detail",
        },
      };
      var array_to_json_store = { $unwind: "$store_detail" };

      var filter = {
        $match: { created_at: { $gte: start_date, $lt: end_date } },
      };
      var redact = {};
      if (request_data_body.country_id !== "all") {
        redact = {
          $redact: {
            $cond: [
              {
                $and: [
                  {
                    $eq: [
                      "$store_detail.country_id",
                      Schema(request_data_body.country_id),
                    ],
                  },
                ],
              },
              "$$KEEP",
              "$$PRUNE",
            ],
          },
        };
      } else {
        redact = {
          $redact: {
            $cond: [
              {
                $and: [
                  {
                    $ne: [
                      "$store_detail.country_id",
                      request_data_body.country_id,
                    ],
                  },
                ],
              },
              "$$KEEP",
              "$$PRUNE",
            ],
          },
        };
      }
      var group = {
        $group: {
          _id: null,
          completed_order: { $sum: 1 },
          total_item_sold: { $sum: "$order_payment_detail.total_item_count" },
          total_payments: {
            $sum: {
              $multiply: [
                "$order_payment_detail.total",
                "$order_payment_detail.current_rate",
              ],
            },
          },
          promo_payment: {
            $sum: {
              $multiply: [
                "$order_payment_detail.promo_payment",
                "$order_payment_detail.current_rate",
              ],
            },
          },
          cash_payment: {
            $sum: {
              $multiply: [
                "$order_payment_detail.cash_payment",
                "$order_payment_detail.current_rate",
              ],
            },
          },
          wallet_payment: {
            $sum: {
              $multiply: [
                "$order_payment_detail.wallet_payment",
                "$order_payment_detail.current_rate",
              ],
            },
          },
          other_payment: {
            $sum: {
              $multiply: [
                "$order_payment_detail.card_payment",
                "$order_payment_detail.current_rate",
              ],
            },
          },
          admin_earning: {
            $sum: {
              $multiply: [
                {
                  $sum: [
                    "$order_payment_detail.total_admin_profit_on_delivery",
                    "$order_payment_detail.total_admin_profit_on_store",
                  ],
                },
                "$order_payment_detail.current_rate",
              ],
            },
          },
          yeep_earning: {
            $sum: "$order_payment_detail.yeep_earning",
          },
          order_payment: {
            $sum: {
              $multiply: [
                "$order_payment_detail.total_order_price",
                "$order_payment_detail.current_rate",
              ],
            },
          },
          delivery_payment: {
            $sum: {
              $multiply: [
                "$order_payment_detail.total_delivery_price",
                "$order_payment_detail.current_rate",
              ],
            },
          },
          store_earning: {
            $sum: {
              $multiply: [
                "$order_payment_detail.total_store_income",
                "$order_payment_detail.current_rate",
              ],
            },
          },
          provider_earning: {
            $sum: {
              $multiply: [
                "$order_payment_detail.total_provider_income",
                "$order_payment_detail.current_rate",
              ],
            },
          },
        },
      };
      var completed_order_cond = {
        $match: { order_status_id: { $eq: ORDER_STATUS_ID.COMPLETED } },
      };
      var admin_type_condition = { $match: {} };
      if (request_data_body.admin_type == 4) {
        const main_store = await Store.findOne({
          _id: request_data_body.main_store_id,
        });
        let sub_store = [main_store._id];
        main_store.sub_stores.forEach((str) => {
          sub_store.push(mongoose.Types.ObjectId(str._id));
        });
        admin_type_condition = {
          $match: { store_id: { $in: sub_store } },
        };
      }
      Order.aggregate([
        admin_type_condition,
        order_payment,
        array_to_json_order_payment,
        store,
        array_to_json_store,
        redact,
        completed_order_cond,
        filter,
        group,
      ]).then(
        (order_detail) => {
          if (order_detail.length == 0) {
            setTimeout(function () {
              response_data.json({ success: false, list: list });
            }, 2000);
          } else {
            var admin_earn_per = 0;
            var store_payment_pre_earning = 0;
            var provider_payment_pre_earning = 0;
            if (order_detail[0].total_payments > 0) {
              admin_earn_per =
                (order_detail[0].admin_earning * 100) /
                order_detail[0].total_payments;
              store_payment_pre_earning =
                (order_detail[0].order_payment * 100) /
                order_detail[0].total_payments;
              provider_payment_pre_earning =
                (order_detail[0].delivery_payment * 100) /
                order_detail[0].total_payments;
            }

            var store_earn_per = 0;
            if (order_detail[0].order_payment > 0) {
              store_earn_per =
                (order_detail[0].store_earning * 100) /
                order_detail[0].order_payment;
            }
            var provider_earn_per = 0;
            if (order_detail[0].delivery_payment > 0) {
              provider_earn_per =
                (order_detail[0].provider_earning * 100) /
                order_detail[0].delivery_payment;
            }

            order_detail[0].admin_earn_per = admin_earn_per;
            order_detail[0].store_earn_per = store_earn_per;
            order_detail[0].provider_earn_per = provider_earn_per;
            order_detail[0].store_payment_pre_earning =
              store_payment_pre_earning;
            order_detail[0].provider_payment_pre_earning =
              provider_payment_pre_earning;

            var group1 = {
              $group: {
                _id: null,
                total_deliveries: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $not: ["$request_id"] },
                          { $ne: ["$request_id", null] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                // total_deliveries: { $sum: {$cond: [{$and: [{$ne: ["$request_id", null] }, {$exist: ["$request_id", true] }]}, 1, 0]} },
                total_orders: { $sum: 1 },
                cancelled_order: {
                  $sum: {
                    $cond: [
                      { $eq: ["$order_status_id", ORDER_STATUS_ID.CANCELLED] },
                      1,
                      0,
                    ],
                  },
                },
              },
            };
            Order.aggregate([
              admin_type_condition,
              store,
              array_to_json_store,
              redact,
              filter,
              group1,
            ]).then(
              (order_detail1) => {
                if (order_detail.length == 0) {
                  setTimeout(function () {
                    response_data.json({
                      success: true,
                      list: list,
                      order_detail: order_detail[0],
                      order_detail1: {
                        total_deliveries: 0,
                        total_orders: 0,
                        cancelled_order: 0,
                      },
                    });
                  }, 2000);
                } else {
                  setTimeout(function () {
                    response_data.json({
                      success: true,
                      list: list,
                      order_detail: order_detail[0],
                      order_detail1: order_detail1[0],
                    });
                  }, 2000);
                }
              },
              (error) => {
                console.log(error);
                response_data.json({
                  success: false,
                  error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                });
              }
            );
          }
        },
        (error) => {
          console.log(error);
          response_data.json({
            success: false,
            error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
          });
        }
      );
    } else {
      response_data.json(response);
    }
  });
};

// last_six_month_earning_detail
exports.last_six_month_earning_detail = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], async function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      var array = [];

      var monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      var current_date = new Date(Date.now());
      current_date.setMonth(current_date.getMonth() - 5);

      for (var i = 1; i <= 6; i++) {
        var firstDay = new Date(
          current_date.getFullYear(),
          current_date.getMonth(),
          1
        );

        var lastDay = new Date(
          firstDay.getFullYear(),
          firstDay.getMonth() + 1,
          0
        );
        lastDay.setHours(23, 59, 59, 999);
        lastDay = new Date(lastDay);

        array[i - 1] = {
          _id: monthNames[firstDay.getMonth()] + " " + firstDay.getFullYear(),
          total: 0,
          admin_earning: 0,
          admin_paid: 0,
          paid_deliveryman: 0,
          paid_store: 0,
          index: i - 1,
        };

        var order_payment = {
          $lookup: {
            from: "order_payments",
            localField: "order_payment_id",
            foreignField: "_id",
            as: "order_payment_detail",
          },
        };
        var array_to_json_order_payment = { $unwind: "$order_payment_detail" };

        var filter = {
          $match: { created_at: { $gte: firstDay, $lte: lastDay } },
        };

        var group = {
          $group: {
            _id: monthNames[firstDay.getMonth()] + " " + firstDay.getFullYear(),
            total: {
              $sum: {
                $multiply: [
                  "$order_payment_detail.total",
                  "$order_payment_detail.current_rate",
                ],
              },
            },
            admin_earning: {
              $sum: {
                $multiply: [
                  {
                    $sum: [
                      "$order_payment_detail.total_admin_profit_on_store",
                      "$order_payment_detail.total_admin_profit_on_delivery",
                    ],
                  },
                  "$order_payment_detail.current_rate",
                ],
              },
            },
            admin_paid: {
              $sum: {
                $multiply: [
                  {
                    $sum: [
                      "$order_payment_detail.pay_to_provider",
                      "$order_payment_detail.pay_to_store",
                    ],
                  },
                  "$order_payment_detail.current_rate",
                ],
              },
            },
            paid_deliveryman: {
              $sum: {
                $multiply: [
                  "$order_payment_detail.pay_to_provider",
                  "$order_payment_detail.current_rate",
                ],
              },
            },
            paid_store: {
              $sum: {
                $multiply: [
                  "$order_payment_detail.pay_to_store",
                  "$order_payment_detail.current_rate",
                ],
              },
            },
          },
        };
        var completed_order_cond = {
          $match: { order_status_id: { $eq: ORDER_STATUS_ID.COMPLETED } },
        };
        var project = {
          $project: {
            total: 1,
            admin_earning: 1,
            admin_paid: 1,
            paid_deliveryman: 1,
            paid_store: 1,
            index: { $literal: i - 1 },
          },
        };
        var admin_type_condition = { $match: {} };
        if (request_data_body.admin_type == 4) {
          const main_store = await Store.findOne({
            _id: request_data_body.main_store_id,
          });
          let sub_store = [main_store._id];
          main_store.sub_stores.forEach((str) => {
            sub_store.push(mongoose.Types.ObjectId(str._id));
          });
          admin_type_condition = {
            $match: { store_id: { $in: sub_store } },
          };
        }
        Order.aggregate([
          admin_type_condition,
          order_payment,
          array_to_json_order_payment,
          filter,
          completed_order_cond,
          group,
          project,
        ]).then(
          (order_detail) => {
            if (order_detail.length > 0) {
              var json = order_detail[0];
              array[json.index] = json;
            } else {
              console.log(
                monthNames[firstDay.getMonth()] + " " + firstDay.getFullYear()
              );
            }
          },
          (error) => {
            console.log(error);
            response_data.json({
              success: false,
              error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
            });
          }
        );

        if (i == 6) {
          setTimeout(function () {
            function sort_date_array(a, b) {
              if (a.index < b.index) return -1;
              if (a.index > b.index) return 1;
              return 0;
            }
            array.sort(sort_date_array);
            response_data.json({ success: true, array: array });
          }, 2000);
        }
        current_date.setMonth(current_date.getMonth() + 1);
      }
    } else {
      response_data.json(response);
    }
  });
};

// last_six_month_payment_detail
exports.last_six_month_payment_detail = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], async function (response) {
    if (response.success) {
      var current_date = new Date(Date.now());
      current_date.setHours(23, 59, 59, 999);
      var end_date = new Date(current_date);

      current_date.setDate(1);
      current_date.setMonth(current_date.getMonth() - 5);
      current_date.setHours(0, 0, 0, 0);

      var start_date = new Date(current_date);

      var filter = {
        $match: { created_at: { $gte: start_date, $lte: end_date } },
      };

      var request_data_body = request_data.body;
      var order_payment = {
        $lookup: {
          from: "order_payments",
          localField: "order_payment_id",
          foreignField: "_id",
          as: "order_payment_detail",
        },
      };
      var array_to_json_order_payment = { $unwind: "$order_payment_detail" };

      var group = {
        $group: {
          _id: null,
          total: {
            $sum: {
              $multiply: [
                "$order_payment_detail.total",
                "$order_payment_detail.current_rate",
              ],
            },
          },
          promo_payment: {
            $sum: {
              $multiply: [
                "$order_payment_detail.promo_payment",
                "$order_payment_detail.current_rate",
              ],
            },
          },
          cash_payment: {
            $sum: {
              $multiply: [
                "$order_payment_detail.cash_payment",
                "$order_payment_detail.current_rate",
              ],
            },
          },
          wallet_payment: {
            $sum: {
              $multiply: [
                "$order_payment_detail.wallet_payment",
                "$order_payment_detail.current_rate",
              ],
            },
          },
          other_payment: {
            $sum: {
              $multiply: [
                "$order_payment_detail.card_payment",
                "$order_payment_detail.current_rate",
              ],
            },
          },
        },
      };
      var completed_order_cond = {
        $match: { order_status_id: { $eq: ORDER_STATUS_ID.COMPLETED } },
      };
      var admin_type_condition = { $match: {} };
      if (request_data_body.admin_type == 4) {
        const main_store = await Store.findOne({
          _id: request_data_body.main_store_id,
        });
        let sub_store = [main_store._id];
        main_store.sub_stores.forEach((str) => {
          sub_store.push(mongoose.Types.ObjectId(str._id));
        });
        admin_type_condition = {
          $match: { store_id: { $in: sub_store } },
        };
      }
      Order.aggregate([
        admin_type_condition,
        order_payment,
        array_to_json_order_payment,
        filter,
        completed_order_cond,
        group,
      ]).then(
        (order_detail) => {
          if (order_detail.length === 0) {
            response_data.json({ success: false, order_detail: {} });
          } else {
            var total_promo_payment = order_detail[0].promo_payment;
            var total = order_detail[0].total + total_promo_payment;
            var total_cash_payment = order_detail[0].cash_payment;
            var total_wallet_payment = order_detail[0].wallet_payment;
            var total_other_payment = order_detail[0].other_payment;

            var total_promo_payment_per = (total_promo_payment * 100) / total;
            var total_cash_payment_per = (total_cash_payment * 100) / total;
            var total_wallet_payment_per = (total_wallet_payment * 100) / total;
            var total_other_payment_per = (total_other_payment * 100) / total;

            var json = {
              total_promo_payment: total_promo_payment_per,
              total_cash_payment: total_cash_payment_per,
              total_wallet_payment: total_wallet_payment_per,
              total_other_payment: total_other_payment_per,
            };
            response_data.json({ success: true, order_detail: json });
          }
        },
        (error) => {
          console.log(error);
          response_data.json({
            success: false,
            error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
          });
        }
      );
    } else {
      response_data.json(response);
    }
  });
};

// last_fifteen_day_order_detail
exports.last_fifteen_day_order_detail = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      var monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      var array = [];

      var current_date = new Date(Date.now());
      current_date.setDate(current_date.getDate() - 14);

      for (var i = 0; i <= 14; i++) {
        var start_date = current_date.setHours(0, 0, 0, 0);
        start_date = new Date(start_date);

        var end_date = current_date.setHours(23, 59, 59, 999);
        end_date = new Date(end_date);

        array[i] = {
          _id: start_date.getDate() + " " + monthNames[start_date.getMonth()],
          total_orders: 0,
          total_deliveries: 0,
          completed_order: 0,
          rejected_by_store: 0,
          cancelled_by_user: 0,
          index: i,
        };

        var filter = {
          $match: { created_at: { $gte: start_date, $lt: end_date } },
        };
        var group = {
          $group: {
            _id: start_date.getDate() + " " + monthNames[start_date.getMonth()],
            total_orders: { $sum: 1 },
            total_deliveries: {
              $sum: {
                $cond: [
                  {
                    $gte: ["$order_status", ORDER_STATE.DELIVERY_MAN_ACCEPTED],
                  },
                  1,
                  0,
                ],
              },
            },
            completed_order: {
              $sum: {
                $cond: [
                  { $eq: ["$order_status_id", ORDER_STATUS_ID.COMPLETED] },
                  1,
                  0,
                ],
              },
            },
            rejected_by_store: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ["$order_status", ORDER_STATE.STORE_REJECTED] },
                      { $eq: ["$order_status", ORDER_STATE.STORE_CANCELLED] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            cancelled_by_user: {
              $sum: {
                $cond: [
                  { $eq: ["$order_status", ORDER_STATE.CANCELED_BY_USER] },
                  1,
                  0,
                ],
              },
            },
          },
        };

        var project = {
          $project: {
            total_orders: 1,
            total_deliveries: 1,
            completed_order: 1,
            rejected_by_store: 1,
            cancelled_by_user: 1,
            index: { $literal: i },
          },
        };
        Order.aggregate([filter, group, project]).then(
          (order_detail) => {
            // order_detail[0].push({date:current_date})

            if (order_detail.length > 0) {
              var json = order_detail[0];
              array[json.index] = json;
            }
          },
          (error) => {
            console.log(error);
            response_data.json({
              success: false,
              error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
            });
          }
        );

        if (i == 14) {
          setTimeout(function () {
            function sort_date_array(a, b) {
              if (a.index < b.index) return -1;
              if (a.index > b.index) return 1;
              return 0;
            }
            array.sort(sort_date_array);
            response_data.json({ success: true, array: array });
          }, 2000);
        }

        current_date.setDate(current_date.getDate() + 1);
      }
    } else {
      response_data.json(response);
    }
  });
};

// monthly_payment_detail
exports.monthly_payment_detail = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], async function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      var array = [];

      var monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      var current_date = new Date(Date.now());
      current_date.setMonth(current_date.getMonth() - 5);

      for (var i = 1; i <= 6; i++) {
        var firstDay = new Date(
          current_date.getFullYear(),
          current_date.getMonth(),
          1
        );

        var lastDay = new Date(
          firstDay.getFullYear(),
          firstDay.getMonth() + 1,
          0
        );
        lastDay.setHours(23, 59, 59, 999);
        lastDay = new Date(lastDay);

        array[i - 1] = {
          _id: monthNames[firstDay.getMonth()] + " " + firstDay.getFullYear(),
          total: 0,
          promo_payment: 0,
          cash_payment: 0,
          wallet_payment: 0,
          other_payment: 0,
          index: i - 1,
        };

        var order_payment = {
          $lookup: {
            from: "order_payments",
            localField: "order_payment_id",
            foreignField: "_id",
            as: "order_payment_detail",
          },
        };
        var array_to_json_order_payment = { $unwind: "$order_payment_detail" };

        var filter = {
          $match: { created_at: { $gte: firstDay, $lte: lastDay } },
        };

        var group = {
          $group: {
            _id: monthNames[firstDay.getMonth()] + " " + firstDay.getFullYear(),
            total: {
              $sum: {
                $multiply: [
                  "$order_payment_detail.total",
                  "$order_payment_detail.current_rate",
                ],
              },
            },
            promo_payment: {
              $sum: {
                $multiply: [
                  "$order_payment_detail.promo_payment",
                  "$order_payment_detail.current_rate",
                ],
              },
            },
            cash_payment: {
              $sum: {
                $multiply: [
                  "$order_payment_detail.cash_payment",
                  "$order_payment_detail.current_rate",
                ],
              },
            },
            wallet_payment: {
              $sum: {
                $multiply: [
                  "$order_payment_detail.wallet_payment",
                  "$order_payment_detail.current_rate",
                ],
              },
            },
            other_payment: {
              $sum: {
                $multiply: [
                  "$order_payment_detail.card_payment",
                  "$order_payment_detail.current_rate",
                ],
              },
            },
          },
        };
        var completed_order_cond = {
          $match: { order_status_id: { $eq: ORDER_STATUS_ID.COMPLETED } },
        };
        var project = {
          $project: {
            total: 1,
            promo_payment: 1,
            cash_payment: 1,
            wallet_payment: 1,
            other_payment: 1,
            index: { $literal: i - 1 },
          },
        };
        var admin_type_condition = { $match: {} };
        if (request_data_body.admin_type == 4) {
          const main_store = await Store.findOne({
            _id: request_data_body.main_store_id,
          });
          let sub_store = [main_store._id];
          main_store.sub_stores.forEach((str) => {
            sub_store.push(mongoose.Types.ObjectId(str._id));
          });
          admin_type_condition = {
            $match: { store_id: { $in: sub_store } },
          };
        }
        Order.aggregate([
          admin_type_condition,
          order_payment,
          array_to_json_order_payment,
          filter,
          completed_order_cond,
          group,
          project,
        ]).then(
          (order_detail) => {
            if (order_detail.length > 0) {
              var json = order_detail[0];
              array[json.index] = json;
            } else {
              console.log(
                monthNames[firstDay.getMonth()] + " " + firstDay.getFullYear()
              );
            }
          },
          (error) => {
            console.log(error);
            response_data.json({
              success: false,
              error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
            });
          }
        );

        if (i == 6) {
          setTimeout(function () {
            function sort_date_array(a, b) {
              if (a.index < b.index) return -1;
              if (a.index > b.index) return 1;
              return 0;
            }
            array.sort(sort_date_array);
            response_data.json({ success: true, array: array });
          }, 2000);
        }
        current_date.setMonth(current_date.getMonth() + 1);
      }
    } else {
      response_data.json(response);
    }
  });
};

// country_chart
exports.country_chart = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], async function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      var array = [];
      var country_array = [];

      var monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      var current_date = new Date(Date.now());
      current_date.setMonth(current_date.getMonth() - 5);

      for (var i = 1; i <= 6; i++) {
        var firstDay = new Date(
          current_date.getFullYear(),
          current_date.getMonth(),
          1
        );

        var lastDay = new Date(
          firstDay.getFullYear(),
          firstDay.getMonth() + 1,
          0
        );
        lastDay.setHours(23, 59, 59, 999);
        lastDay = new Date(lastDay);

        array[i - 1] = {
          _id: monthNames[firstDay.getMonth()] + " " + firstDay.getFullYear(),
          index: i - 1,
          total: [],
        };

        var order_payment = {
          $lookup: {
            from: "order_payments",
            localField: "order_payment_id",
            foreignField: "_id",
            as: "order_payment_detail",
          },
        };
        var array_to_json_order_payment = { $unwind: "$order_payment_detail" };

        var store = {
          $lookup: {
            from: "stores",
            localField: "store_id",
            foreignField: "_id",
            as: "store_detail",
          },
        };
        var array_to_json_store = { $unwind: "$store_detail" };

        var country = {
          $lookup: {
            from: "countries",
            localField: "store_detail.country_id",
            foreignField: "_id",
            as: "country_detail",
          },
        };
        var array_to_json_country = { $unwind: "$country_detail" };

        var filter = {
          $match: { created_at: { $gte: firstDay, $lte: lastDay } },
        };

        var project = {
          $project: {
            country_id: "$store_detail.country_id",
            total: "$order_payment_detail.total",
            current_rate: "$order_payment_detail.current_rate",
            country_name: "$country_detail.country_name",
            index: { $literal: i - 1 },
          },
        };
        var completed_order_cond = {
          $match: { order_status_id: { $eq: ORDER_STATUS_ID.COMPLETED } },
        };
        var admin_type_condition = { $match: {} };
        if (request_data_body.admin_type == 4) {
          const main_store = await Store.findOne({
            _id: request_data_body.main_store_id,
          });
          let sub_store = [main_store._id];
          main_store.sub_stores.forEach((str) => {
            sub_store.push(mongoose.Types.ObjectId(str._id));
          });
          admin_type_condition = {
            $match: { store_id: { $in: sub_store } },
          };
        }
        Order.aggregate([
          admin_type_condition,
          order_payment,
          array_to_json_order_payment,
          store,
          array_to_json_store,
          country,
          array_to_json_country,
          filter,
          completed_order_cond,
          project,
        ]).then(
          (order_data) => {
            var group = [
              { $project: { a: "$country_name" } },
              { $unwind: "$a" },
              {
                $group: {
                  _id: "a",
                  country: { $addToSet: { country_name: "$a", total: 0 } },
                },
              },
            ];

            // Country.aggregate(group, function (error , country_list) {
            //     if(!error && country_list.length>0) {
            order_data.forEach(function (order_detail) {
              // if (array[order_detail.index].total.length == 0) {
              //     array[order_detail.index].total = country_list[0].country;
              // }
              let a = array[order_detail.index].total.findIndex(
                (x) => x.country_name == order_detail.country_name
              );
              if (a == -1) {
                array[order_detail.index].total.push({
                  country_name: order_detail.country_name,
                  total: order_detail.total * order_detail.current_rate,
                });
              } else {
                array[order_detail.index].total[a].total =
                  array[order_detail.index].total[a].total +
                  Number(order_detail.total * order_detail.current_rate);
              }
            });
            //     }
            // });
          },
          (error) => {
            console.log(error);
            response_data.json({
              success: false,
              error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
            });
          }
        );

        if (i == 6) {
          setTimeout(function () {
            function sort_date_array(a, b) {
              if (a.index < b.index) return -1;
              if (a.index > b.index) return 1;
              return 0;
            }
            array.sort(sort_date_array);
            response_data.json({ success: true, array: array });
          }, 5000);
        }
        current_date.setMonth(current_date.getMonth() + 1);
      }
    } else {
      response_data.json(response);
    }
  });
};

exports.top_user_and_item = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [
      { name: "start_date", type: "string" },
      { name: "end_date", type: "string" },
      { name: "type", type: "string" },
    ],
    async function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        request_data.body.no_of_record = Number(request_data.body.no_of_record);
        if (
          request_data_body.start_date == "" ||
          request_data_body.end_date == ""
        ) {
          if (
            request_data_body.start_date == "" &&
            request_data_body.end_date == ""
          ) {
            var date = new Date(Date.now());
            date = date.setHours(0, 0, 0, 0);
            start_date = new Date(0);
            end_date = new Date(Date.now());
          } else if (request_data_body.start_date == "") {
            start_date = new Date(0);
            var end_date = request_data_body.end_date;
            end_date = new Date(end_date);
            end_date = end_date.setHours(23, 59, 59, 999);
            end_date = new Date(end_date);
          } else {
            var start_date = request_data_body.start_date;
            start_date = new Date(start_date);
            start_date = start_date.setHours(0, 0, 0, 0);
            start_date = new Date(start_date);
            end_date = new Date(Date.now());
          }
        } else {
          var start_date = request_data_body.start_date;
          var end_date = request_data_body.end_date;

          start_date = new Date(start_date);
          start_date = start_date.setHours(0, 0, 0, 0);
          start_date = new Date(start_date);
          end_date = new Date(end_date);
          end_date = end_date.setHours(23, 59, 59, 999);
          end_date = new Date(end_date);
        }
        var filter = {
          $match: { completed_at: { $gte: start_date, $lt: end_date } },
        };

        if (request_data.body.type == "user") {
          var no_of_top_user = request_data.body.no_of_record
            ? request_data.body.no_of_record
            : 10;
          Order.aggregate([
            filter,
            {
              $match: {
                order_status: ORDER_STATE.ORDER_COMPLETED,
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "user_details",
              },
            },
            { $unwind: "$user_details" },
            {
              $group: {
                _id: "$user_details._id",
                first_name: { $first: "$user_details.first_name" },
                last_name: { $first: "$user_details.last_name" },
                unique_id: { $first: "$user_details.unique_id" },
                count: { $sum: 1 },
              },
            },
            {
              $sort: {
                count: -1,
              },
            },
            {
              $limit: no_of_top_user,
            },
          ]).then((orders) => {
            console.log(orders.length);
            if (orders.length > 0) {
              response_data.json({
                success: true,
                data: orders,
              });
            } else {
              response_data.json({
                success: false,
              });
            }
          });
        } else if (request_data.body.type == "item") {
          var no_of_top_item = request_data.body.no_of_record
            ? request_data.body.no_of_record
            : 50;
          Order.aggregate([
            filter,
            {
              $match: {
                order_status: ORDER_STATE.ORDER_COMPLETED,
              },
            },
            {
              $lookup: {
                from: "carts",
                localField: "cart_id",
                foreignField: "_id",
                as: "cart_details",
              },
            },
            { $unwind: "$cart_details" },
            { $unwind: "$cart_details.order_details" },
            { $unwind: "$cart_details.order_details.items" },
            {
              $group: {
                _id: "$cart_details.order_details.items.item_id",
                unique_id: {
                  $first: "$cart_details.order_details.items.unique_id",
                },
                item_name: {
                  $first: "$cart_details.order_details.items.item_name",
                },
                total_ordered_quantity: {
                  $sum: "$cart_details.order_details.items.quantity",
                },
                count: { $sum: 1 },
              },
            },

            {
              $sort: {
                count: -1,
              },
            },
            {
              $limit: no_of_top_item,
            },
          ]).then((orders) => {
            console.log(orders.length);
            if (orders.length > 0) {
              response_data.json({
                success: true,
                data: orders,
              });
            } else {
              response_data.json({
                success: false,
              });
            }
          });
        }
      } else {
        response_data.json(response);
      }
    }
  );
};

exports.admin_notify_new_order = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      Order.aggregate([
        {
          $match: {
            admin_notify: false,
          },
        },
        {
          $match: {
            order_status: ORDER_STATE.WAITING_FOR_ACCEPT_STORE,
          },
        },
      ]).then(async (orders) => {
        if (orders.length > 0) {
          // orders[0].admin_notify = true;
          setTimeout(async () => {
            await Order.findOneAndUpdate(
              { _id: orders[0]._id },
              { admin_notify: true }
            );
          }, 5000);
          response_data.json({
            success: true,
            order: orders[0],
            message: ORDER_MESSAGE_CODE.ORDER_LIST_FOR_DELIVERY_SUCCESSFULLY,
          });
        } else {
          response_data.json({
            error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
            success: false,
          });
        }
      });
    } else {
      response_data.json(response);
    }
  });
};

exports.admin_get_carts = async (req, res) => {
  try {
    const { start_date, end_date } = req.body;
    let gte = moment().subtract(20, "days").format();
    let lt = moment().format();
    if (start_date && end_date) {
      gte = moment(start_date).format();
      lt = moment(end_date).format();
    }
    const carts = await Cart.find({
      order_payment_id: null,
      order_id: null,
      updated_at: {
        $gte: gte,
        $lt: lt,
      },
    })
      .populate("user_id", "first_name last_name")
      .populate("store_id", "name");

    res.json({
      status: true,
      carts,
    });
  } catch (error) {
    res.json({
      status: false,
      message: error.message,
    });
  }
};
