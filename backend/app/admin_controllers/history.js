require("../utils/message_code");
require("../utils/error_code");
require("../utils/constants");
var Order = require("mongoose").model("order");
var Request = require("mongoose").model("request");
var Store = require("mongoose").model("store");
var mongoose = require("mongoose");
var console = require("../utils/console");

var utils = require("../utils/utils");
const paymentDetails = require("../models/admin/payment_details");
const storeDetails = require("../models/admin/store_details");
const {
  getOrderHistoryAggregatePipeline,
} = require("../services/order.service");

// admin_history
exports.admin_history = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "start_date" }, { name: "end_date" }],
    async function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
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
            var end_date = request_data_body.end_date.formatted;
            end_date = new Date(end_date);
            end_date = end_date.setHours(23, 59, 59, 999);
            end_date = new Date(end_date);
          } else {
            var start_date = request_data_body.start_date.formatted;
            start_date = new Date(start_date);
            start_date = start_date.setHours(0, 0, 0, 0);
            start_date = new Date(start_date);
            end_date = new Date(Date.now());
          }
        } else {
          var start_date = request_data_body.start_date.formatted;
          var end_date = request_data_body.end_date.formatted;

          start_date = new Date(start_date);
          start_date = start_date.setHours(0, 0, 0, 0);
          start_date = new Date(start_date);
          end_date = new Date(end_date);
          end_date = end_date.setHours(23, 59, 59, 999);
          end_date = new Date(end_date);
        }

        var user_query = {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user_detail",
          },
        };
        var array_to_json_user_detail = { $unwind: "$user_detail" };

        var store_query = {
          $lookup: {
            from: "stores",
            localField: "store_id",
            foreignField: "_id",
            as: "store_detail",
          },
        };
        var array_to_json_store_detail = {
          $unwind: {
            path: "$store_detail",
            preserveNullAndEmptyArrays: true,
          },
        };

        var request_query = {
          $lookup: {
            from: "requests",
            localField: "request_id",
            foreignField: "_id",
            as: "request_detail",
          },
        };

        var array_to_json_request_query = {
          $unwind: {
            path: "$request_detail",
            preserveNullAndEmptyArrays: true,
          },
        };
        var cart_query = {
          $lookup: {
            from: "carts",
            localField: "cart_id",
            foreignField: "_id",
            as: "cart_detail",
          },
        };
        var array_to_json_cart_query = { $unwind: "$cart_detail" };

        var city_query = {
          $lookup: {
            from: "cities",
            localField: "city_id",
            foreignField: "_id",
            as: "city_detail",
          },
        };
        var array_to_json_city_query = { $unwind: "$city_detail" };

        var provider_query = {
          $lookup: {
            from: "providers",
            localField: "request_detail.provider_id",
            foreignField: "_id",
            as: "provider_detail",
          },
        };
        var array_to_json_provider_query = {
          $unwind: {
            path: "$provider_detail",
            preserveNullAndEmptyArrays: true,
          },
        };

        var order_payment_query = {
          $lookup: {
            from: "order_payments",
            localField: "order_payment_id",
            foreignField: "_id",
            as: "order_payment_detail",
          },
        };

        var array_to_json_order_payment_query = {
          $unwind: "$order_payment_detail",
        };

        var payment_detail_query = {
          $lookup: {
            from: "payment_details",
            localField: "order_payment_detail._id",
            foreignField: "order_payment_id",
            as: "payment_detail",
          },
        };

        var array_to_json_payment_detail_query = {
          $unwind: "$order_payment_detail",
        };

        var payment_gateway_query = {
          $lookup: {
            from: "payment_gateways",
            localField: "order_payment_detail.payment_id",
            foreignField: "_id",
            as: "payment_gateway_detail",
          },
        };

        var review_query = {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "order_id",
            as: "review_detail",
          },
        };

        var store_branch_query = {
          $lookup: {
            from: "stores",
            localField: "store_id",
            foreignField: "_id",
            as: "store_branch_details",
          },
        };

        var array_to_json_store_branch = { $unwind: "$store_branch_details" };

        var number_of_rec = SEARCH_SORT.NO_OF_RECORD_PER_PAGE;
        var page = request_data_body.page;

        var order_status_id = request_data_body.order_status_id;
        var search_field = request_data_body.search_field;
        var search_value = request_data_body.search_value;
        search_value = search_value.replace(/^\s+|\s+$/g, "");
        search_value = search_value.replace(/ +(?= )/g, "");

        var payment_status_condition = { $match: {} };
        if (request_data_body.payment_status != "all") {
          if (request_data_body.payment_status == "true") {
            payment_status_condition = {
              $match: {
                "order_payment_detail.is_payment_mode_cash": { $eq: true },
              },
            };
          } else {
            payment_status_condition = {
              $match: {
                "order_payment_detail.is_payment_mode_cash": { $eq: false },
              },
            };
          }
        }

        var pickup_type = request_data_body.pickup_type;
        var pickup_type_condition = { $match: {} };
        if (pickup_type != "both") {
          if (request_data_body.pickup_type == "true") {
            pickup_type_condition = {
              $match: {
                "order_payment_detail.is_user_pick_up_order": { $eq: true },
              },
            };
          } else {
            pickup_type_condition = {
              $match: {
                "order_payment_detail.is_user_pick_up_order": { $eq: false },
              },
            };
          }
        }

        var order_type = request_data_body.order_type;
        var order_type_condition = { $match: {} };
        if (order_type != "both") {
          if (request_data_body.order_type == "true") {
            order_type_condition = {
              $match: { is_schedule_order: { $eq: true } },
            };
          } else {
            order_type_condition = {
              $match: { is_schedule_order: { $eq: false } },
            };
          }
        }

        var created_by = request_data_body.created_by;
        var created_by_condition = { $match: {} };
        if (created_by != "both") {
          created_by_condition = {
            $match: { order_type: { $eq: created_by } },
          };
        }

        if (search_field === "user_detail.first_name") {
          var query1 = {};
          var query2 = {};
          var query3 = {};
          var query4 = {};
          var query5 = {};
          var query6 = {};
          var full_name = search_value.split(" ");
          if (
            typeof full_name[0] === "undefined" ||
            typeof full_name[1] === "undefined"
          ) {
            query1[search_field] = { $regex: new RegExp(search_value, "i") };
            query2["user_detail.last_name"] = {
              $regex: new RegExp(search_value, "i"),
            };
            var search = { $match: { $or: [query1, query2] } };
          } else {
            query1[search_field] = { $regex: new RegExp(search_value, "i") };
            query2["user_detail.last_name"] = {
              $regex: new RegExp(search_value, "i"),
            };
            query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
            query4["user_detail.last_name"] = {
              $regex: new RegExp(full_name[0], "i"),
            };
            query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
            query6["user_detail.last_name"] = {
              $regex: new RegExp(full_name[1], "i"),
            };
            var search = {
              $match: { $or: [query1, query2, query3, query4, query5, query6] },
            };
          }
        } else if (search_field === "provider_detail.first_name") {
          var query1 = {};
          var query2 = {};
          var query3 = {};
          var query4 = {};
          var query5 = {};
          var query6 = {};
          var full_name = search_value.split(" ");
          if (
            typeof full_name[0] === "undefined" ||
            typeof full_name[1] === "undefined"
          ) {
            query1[search_field] = { $regex: new RegExp(search_value, "i") };
            query2["provider_detail.last_name"] = {
              $regex: new RegExp(search_value, "i"),
            };
            var search = { $match: { $or: [query1, query2] } };
          } else {
            query1[search_field] = { $regex: new RegExp(search_value, "i") };
            query2["provider_detail.last_name"] = {
              $regex: new RegExp(search_value, "i"),
            };
            query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
            query4["provider_detail.last_name"] = {
              $regex: new RegExp(full_name[0], "i"),
            };
            query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
            query6["provider_detail.last_name"] = {
              $regex: new RegExp(full_name[1], "i"),
            };
            var search = {
              $match: { $or: [query1, query2, query3, query4, query5, query6] },
            };
          }
        } else if (search_field === "store_detail.name") {
          var query1 = {};
          var query2 = {};
          var query3 = {};
          var query4 = {};
          var query5 = {};
          var query6 = {};
          var full_name = search_value.split(" ");
          if (
            typeof full_name[0] === "undefined" ||
            typeof full_name[1] === "undefined"
          ) {
            query1[search_field] = { $regex: new RegExp(search_value, "i") };
            query2["store_detail.name"] = {
              $regex: new RegExp(search_value, "i"),
            };
            var search = { $match: { $or: [query1, query2] } };
          } else {
            query1[search_field] = { $regex: new RegExp(search_value, "i") };
            query2["store_detail.name"] = {
              $regex: new RegExp(search_value, "i"),
            };
            query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
            query4["store_detail.name"] = {
              $regex: new RegExp(full_name[0], "i"),
            };
            query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
            query6["store_detail.name"] = {
              $regex: new RegExp(full_name[1], "i"),
            };
            var search = {
              $match: { $or: [query1, query2, query3, query4, query5, query6] },
            };
          }
        } else if (search_field == "unique_id") {
          var query = {};
          if (search_value !== "") {
            search_value = Number(search_value);
            query[search_field] = search_value;
            var search = { $match: query };
          }
        } else {
          var query = {};
          query[search_field] = { $regex: new RegExp(search_value, "i") };
          var search = { $match: query };
        }
        var filter = {
          $match: { completed_at: { $gte: start_date, $lt: end_date } },
        };
        var sort = { $sort: {} };
        sort["$sort"]["unique_id"] = parseInt(-1);
        var count = {
          $group: { _id: null, total: { $sum: 1 }, data: { $push: "$data" } },
        };
        var skip = {};
        skip["$skip"] = page * number_of_rec - number_of_rec;
        var limit = {};
        limit["$limit"] = number_of_rec;
        var condition1 = {
          $match: {
            $and: [
              { order_status_id: { $ne: ORDER_STATUS_ID.RUNNING } },
              { order_status_id: { $ne: ORDER_STATUS_ID.IDEAL } },
              {
                order_status: { $ne: ORDER_STATE.ORDER_DELETED },
              },
            ],
          },
        };

        var order_status_id_condition = { $match: {} };
        if (order_status_id != "") {
          order_status_id_condition = {
            $match: { order_status_id: { $eq: Number(order_status_id) } },
          };
        }
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
        if (page) {
          Order.aggregate([
            admin_type_condition,
            condition1,
            created_by_condition,
            order_type_condition,
            order_status_id_condition,
            user_query,
            store_query,
            order_payment_query,
            cart_query,
            array_to_json_cart_query,
            request_query,
            review_query,
            array_to_json_user_detail,
            array_to_json_store_detail,
            array_to_json_order_payment_query,
            array_to_json_request_query,
            provider_query,
            array_to_json_provider_query,
            payment_gateway_query,
            payment_detail_query,
            array_to_json_payment_detail_query,
            pickup_type_condition,
            payment_status_condition,
            store_branch_query,
            array_to_json_store_branch,
            search,
            filter,
            count,
          ]).then(
            (orders) => {
              if (orders.length === 0) {
                response_data.json({
                  success: false,
                  error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                  pages: 0,
                });
              } else {
                var pages = Math.ceil(orders[0].total / number_of_rec);
                var promo_query = {
                  $lookup: {
                    from: "promo_codes",
                    localField: "order_payment_detail.promo_id",
                    foreignField: "_id",
                    as: "promo_code_detail",
                  },
                };
                var array_to_json_promo_detail = {
                  $unwind: {
                    path: "$promo_code_detail",
                    preserveNullAndEmptyArrays: true,
                  },
                };
                Order.aggregate([
                  admin_type_condition,
                  condition1,
                  created_by_condition,
                  order_type_condition,
                  order_status_id_condition,
                  user_query,
                  store_query,
                  order_payment_query,
                  cart_query,
                  array_to_json_cart_query,
                  request_query,
                  review_query,
                  promo_query,
                  array_to_json_promo_detail,
                  array_to_json_user_detail,
                  array_to_json_store_detail,
                  array_to_json_order_payment_query,
                  array_to_json_request_query,
                  provider_query,
                  array_to_json_provider_query,
                  payment_gateway_query,
                  payment_detail_query,
                  array_to_json_payment_detail_query,
                  pickup_type_condition,
                  payment_status_condition,
                  store_branch_query,
                  array_to_json_store_branch,
                  sort,
                  search,
                  filter,
                  skip,
                  limit,
                ]).then(
                  async (orders) => {
                    if (orders.length === 0) {
                      response_data.json({
                        success: false,
                        error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                      });
                    } else {
                      if (request_data_body.admin_type == 4) {
                        orders.forEach((order) => {
                          let is_show_user_info =
                            order.store_detail.is_show_user_info == undefined ||
                            null
                              ? false
                              : order.store_detail.is_show_user_info;
                          if (!is_show_user_info) {
                            let email = order.user_detail.email.split("@");
                            order.user_detail.phone =
                              "XXXXXXX" + order.user_detail.phone.slice(6);
                            order.user_detail.email =
                              "xxxxxxx@" + email[email.length - 1];
                            order.cart_detail.destination_addresses[0].user_details.phone =
                              "XXXXXXX" + order.user_detail.phone.slice(6);
                            order.cart_detail.destination_addresses[0].user_details.email =
                              "xxxxxxx@" + email[email.length - 1];
                            order.cart_detail.destination_addresses[0].user_details.name =
                              Date.now();
                            order.user_detail.first_name = Date.now();
                          }
                        });
                      }

                      let orders_details = orders;
                      let order_payment_ids = orders_details.map(
                        (o) => o.order_payment_id
                      );
                      const checkPaymentDetails = await paymentDetails
                        .find({
                          order_payment_id: { $in: order_payment_ids },
                        })
                        .lean();

                      orders.forEach((order) => {
                        const paymentDetail = checkPaymentDetails.find((o) => {
                          const orderPaymentId = order.order_payment_id
                            ? order.order_payment_id.toString()
                            : null;
                          return o.order_payment_id === orderPaymentId;
                        });
                        order.paymentDetails = paymentDetail
                          ? paymentDetail
                          : null;
                      });

                      /**For Mapping Store Branch Name */
                      let store_ids = orders_details.map((o) => o.store_id);
                      const checkStoreDetails = await storeDetails
                        .find({
                          store_id: { $in: store_ids },
                        })
                        .lean();

                      orders.forEach((order) => {
                        const storeDetail = checkStoreDetails.find((o) => {
                          const storeId = order.store_id
                            ? order.store_id.toString()
                            : null;
                          return o.store_id.toString() === storeId;
                        });
                        order.storeDetails = storeDetail ? storeDetail : null;
                      });
                      // orderpd.find(o=>o._id===)

                      response_data.json({
                        success: true,
                        message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                        pages: pages,
                        orders: orders,
                      });
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
          var promo_query = {
            $lookup: {
              from: "promo_codes",
              localField: "order_payment_detail.promo_id",
              foreignField: "_id",
              as: "promo_code_detail",
            },
          };
          var array_to_json_promo_detail = {
            $unwind: {
              path: "$promo_code_detail",
              preserveNullAndEmptyArrays: true,
            },
          };
          Order.aggregate([
            admin_type_condition,
            condition1,
            created_by_condition,
            order_type_condition,
            city_query,
            array_to_json_city_query,
            order_status_id_condition,
            user_query,
            store_query,
            order_payment_query,
            cart_query,
            array_to_json_cart_query,
            request_query,
            review_query,
            promo_query,
            array_to_json_promo_detail,
            array_to_json_user_detail,
            array_to_json_store_detail,
            array_to_json_order_payment_query,
            array_to_json_request_query,
            provider_query,
            array_to_json_provider_query,
            payment_gateway_query,
            pickup_type_condition,
            payment_status_condition,
            sort,
            search,
            filter,
            payment_detail_query,
          ]).then(
            async (orders) => {
              if (orders.length === 0) {
                response_data.json({
                  success: false,
                  error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                });
              } else {
                if (request_data_body.admin_type == 4) {
                  orders.forEach((order) => {
                    let is_show_user_info =
                      order.store_detail.is_show_user_info == undefined || null
                        ? false
                        : order.store_detail.is_show_user_info;
                    if (!is_show_user_info) {
                      let email = order.user_detail.email.split("@");
                      order.user_detail.phone =
                        "XXXXXXX" + order.user_detail.phone.slice(6);
                      order.user_detail.email =
                        "xxxxxxx@" + email[email.length - 1];
                      order.cart_detail.destination_addresses[0].user_details.phone =
                        "XXXXXXX" + order.user_detail.phone.slice(6);
                      order.cart_detail.destination_addresses[0].user_details.email =
                        "xxxxxxx@" + email[email.length - 1];
                      order.cart_detail.destination_addresses[0].user_details.name =
                        Date.now();
                      order.user_detail.first_name = Date.now();
                    }
                  });
                }

                let order_payment_ids = orders.map((o) => o.order_payment_id);
                const checkPaymentDetails = await paymentDetails
                  .find({
                    order_payment_id: { $in: order_payment_ids },
                  })
                  .lean();

                orders.forEach((order) => {
                  const paymentDetail = checkPaymentDetails.find((o) => {
                    const orderPaymentId = order.order_payment_id
                      ? order.order_payment_id.toString()
                      : null;
                    return o.order_payment_id === orderPaymentId;
                  });
                  order.paymentDetails = paymentDetail ? paymentDetail : null;
                });

                /**For Mapping Store Branch Name */
                let store_ids = orders.map((o) => o.store_id);
                const checkStoreDetails = await storeDetails
                  .find({
                    store_id: { $in: store_ids },
                  })
                  .lean();

                orders.forEach((order) => {
                  const storeDetail = checkStoreDetails.find((o) => {
                    const storeId = order.store_id
                      ? order.store_id.toString()
                      : null;
                    return o.store_id.toString() === storeId;
                  });
                  order.storeDetails = storeDetail ? storeDetail : null;
                });

                response_data.json({
                  success: true,
                  message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                  orders: orders,
                });
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
      } else {
        response_data.json(response);
      }
    }
  );
};

//admin history v2 new
exports.admin_history_v2 = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "start_date" }, { name: "end_date" }],
    async function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
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
            var end_date = request_data_body.end_date.formatted;
            end_date = new Date(end_date);
            end_date = end_date.setHours(23, 59, 59, 999);
            end_date = new Date(end_date);
          } else {
            var start_date = request_data_body.start_date.formatted;
            start_date = new Date(start_date);
            start_date = start_date.setHours(0, 0, 0, 0);
            start_date = new Date(start_date);
            end_date = new Date(Date.now());
          }
        } else {
          var start_date = request_data_body.start_date.formatted;
          var end_date = request_data_body.end_date.formatted;

          start_date = new Date(start_date);
          start_date = start_date.setHours(0, 0, 0, 0);
          start_date = new Date(start_date);
          end_date = new Date(end_date);
          end_date = end_date.setHours(23, 59, 59, 999);
          end_date = new Date(end_date);
        }

        var user_query = {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user_detail",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  first_name: 1,
                  last_name: 1,
                  email: 1,
                  image_url: 1,
                  unique_id: 1,
                  country_phone_code: 1,
                  phone: 1,
                },
              },
            ],
          },
        };
        var array_to_json_user_detail = { $unwind: "$user_detail" };

        var store_query = {
          $lookup: {
            from: "stores",
            localField: "store_id",
            foreignField: "_id",
            as: "store_detail",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  image_url: 1,
                  unique_id: 1,
                  email: 1,
                  country_phone_code: 1,
                  phone: 1,
                  address: 1,
                },
              },
            ],
          },
        };
        var array_to_json_store_detail = {
          $unwind: {
            path: "$store_detail",
            preserveNullAndEmptyArrays: true,
          },
        };

        var request_query = {
          $lookup: {
            from: "requests",
            localField: "request_id",
            foreignField: "_id",
            as: "request_detail",
          },
        };

        var array_to_json_request_query = {
          $unwind: {
            path: "$request_detail",
            preserveNullAndEmptyArrays: true,
          },
        };
        var cart_query = {
          $lookup: {
            from: "carts",
            localField: "cart_id",
            foreignField: "_id",
            as: "cart_detail",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  destination_addresses: {
                    address: 1,
                    building_no: 1,
                    appartmentno: 1,
                    note: 1,
                    user_details: { name: 1, email: 1, phone: 1 },
                  },
                  order_details: {
                    product_id: 1,
                    product_name: 1,
                    items: {
                      image_url: 1,
                      total_specification_price: 1,
                      item_price: 1,
                      quantity: 1,
                      specifications:1
                    },
                  },
                },
              },
            ],
          },
        };
        var array_to_json_cart_query = { $unwind: "$cart_detail" };

        var city_query = {
          $lookup: {
            from: "cities",
            localField: "city_id",
            foreignField: "_id",
            as: "city_detail",
          },
        };
        var array_to_json_city_query = { $unwind: "$city_detail" };

        var provider_query = {
          $lookup: {
            from: "providers",
            localField: "request_detail.provider_id",
            foreignField: "_id",
            as: "provider_detail",
          },
        };
        var array_to_json_provider_query = {
          $unwind: {
            path: "$provider_detail",
            preserveNullAndEmptyArrays: true,
          },
        };

        var order_payment_query = {
          $lookup: {
            from: "order_payments",
            localField: "order_payment_id",
            foreignField: "_id",
            as: "order_payment_detail",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  bill_amount: 1,
                  user_pay_payment: 1,
                  checkout_amount: 1,
                  is_payment_mode_cash: 1,
                  is_paid_from_wallet: 1,
                  is_payment_mode_online_payment: 1,
                  promo_payment: 1,
                  loyalty_payment: 1,
                  loyalty_point: 1,
                  total_delivery_price: 1,
                  is_user_pick_up_order: 1,
                  total_distance: 1,
                  invoice_number: 1,
                  total: 1,
                  cash_payment: 1,
                  wallet_payment: 1,
                  card_payment: 1,
                  total_service_price: 1,
                  total_admin_tax_price: 1,
                  total_order_price: 1,
                  total_cart_price: 1,
                  total_store_tax_price: 1,
                  order_cancellation_charge: 1,
                  is_store_pay_delivery_fees: 1,
                  provider_paid_order_payment: 1,
                  is_promo_for_delivery_service: 1,
                  total_store_income: 1,
                  is_store_income_set_in_wallet: 1,
                  is_transfered_to_store: 1,
                  pay_to_store: 1,
                  total_provider_income: 1,
                  pay_to_provider: 1,
                  total_admin_profit_on_store: 1,
                  total_admin_profit_on_delivery: 1,
                },
              },
            ],
          },
        };

        var array_to_json_order_payment_query = {
          $unwind: "$order_payment_detail",
        };

        var payment_detail_query = {
          $lookup: {
            from: "payment_details",
            localField: "order_payment_detail._id",
            foreignField: "order_payment_id",
            as: "payment_detail",
          },
        };

        var array_to_json_payment_detail_query = {
          $unwind: "$order_payment_detail",
        };

        var payment_gateway_query = {
          $lookup: {
            from: "payment_gateways",
            localField: "order_payment_detail.payment_id",
            foreignField: "_id",
            as: "payment_gateway_detail",
          },
        };

        var review_query = {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "order_id",
            as: "review_detail",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  user_detail: 1,
                  store_detail: 1,
                  user_rating_to_store: 1,
                  user_product_quality_rating_to_store: 1,
                  user_delivery_experience_rating_to_store: 1,
                  user_review_to_store: 1,
                  number_of_users_like_store_comment: 1,
                  number_of_users_dislike_store_comment: 1,
                  user_rating_to_provider: 1,
                  user_review_to_provider: 1,
                  store_rating_to_user: 1,
                  store_review_to_user: 1,
                  store_rating_to_provider: 1,
                  store_review_to_provider: 1,
                  provider_detail: 1,
                  provider_rating_to_user: 1,
                  provider_review_to_user: 1,
                },
              },
            ],
          },
        };

        var store_branch_query = {
          $lookup: {
            from: "stores",
            localField: "store_id",
            foreignField: "_id",
            as: "store_branch_details",
          },
        };

        var array_to_json_store_branch = { $unwind: "$store_branch_details" };

        var number_of_rec = SEARCH_SORT.NO_OF_RECORD_PER_PAGE;
        var page = request_data_body.page;

        var order_status_id = request_data_body.order_status_id;
        var search_field = request_data_body.search_field;
        var search_value = request_data_body.search_value;
        search_value = search_value.replace(/^\s+|\s+$/g, "");
        search_value = search_value.replace(/ +(?= )/g, "");

        var payment_status_condition = { $match: {} };
        if (request_data_body.payment_status != "all") {
          if (request_data_body.payment_status == "true") {
            payment_status_condition = {
              $match: {
                "order_payment_detail.is_payment_mode_cash": { $eq: true },
              },
            };
          } else {
            payment_status_condition = {
              $match: {
                "order_payment_detail.is_payment_mode_cash": { $eq: false },
              },
            };
          }
        }

        var pickup_type = request_data_body.pickup_type;
        var pickup_type_condition = { $match: {} };
        if (pickup_type != "both") {
          if (request_data_body.pickup_type == "true") {
            pickup_type_condition = {
              $match: {
                "order_payment_detail.is_user_pick_up_order": { $eq: true },
              },
            };
          } else {
            pickup_type_condition = {
              $match: {
                "order_payment_detail.is_user_pick_up_order": { $eq: false },
              },
            };
          }
        }

        var order_type = request_data_body.order_type;
        var order_type_condition = { $match: {} };
        if (order_type != "both") {
          if (request_data_body.order_type == "true") {
            order_type_condition = {
              $match: { is_schedule_order: { $eq: true } },
            };
          } else {
            order_type_condition = {
              $match: { is_schedule_order: { $eq: false } },
            };
          }
        }

        var created_by = request_data_body.created_by;
        var created_by_condition = { $match: {} };
        if (created_by != "both") {
          created_by_condition = {
            $match: { order_type: { $eq: created_by } },
          };
        }

        if (search_field === "user_detail.first_name") {
          var query1 = {};
          var query2 = {};
          var query3 = {};
          var query4 = {};
          var query5 = {};
          var query6 = {};
          var full_name = search_value.split(" ");
          if (
            typeof full_name[0] === "undefined" ||
            typeof full_name[1] === "undefined"
          ) {
            query1[search_field] = { $regex: new RegExp(search_value, "i") };
            query2["user_detail.last_name"] = {
              $regex: new RegExp(search_value, "i"),
            };
            var search = { $match: { $or: [query1, query2] } };
          } else {
            query1[search_field] = { $regex: new RegExp(search_value, "i") };
            query2["user_detail.last_name"] = {
              $regex: new RegExp(search_value, "i"),
            };
            query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
            query4["user_detail.last_name"] = {
              $regex: new RegExp(full_name[0], "i"),
            };
            query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
            query6["user_detail.last_name"] = {
              $regex: new RegExp(full_name[1], "i"),
            };
            var search = {
              $match: { $or: [query1, query2, query3, query4, query5, query6] },
            };
          }
        } else if (search_field === "provider_detail.first_name") {
          var query1 = {};
          var query2 = {};
          var query3 = {};
          var query4 = {};
          var query5 = {};
          var query6 = {};
          var full_name = search_value.split(" ");
          if (
            typeof full_name[0] === "undefined" ||
            typeof full_name[1] === "undefined"
          ) {
            query1[search_field] = { $regex: new RegExp(search_value, "i") };
            query2["provider_detail.last_name"] = {
              $regex: new RegExp(search_value, "i"),
            };
            var search = { $match: { $or: [query1, query2] } };
          } else {
            query1[search_field] = { $regex: new RegExp(search_value, "i") };
            query2["provider_detail.last_name"] = {
              $regex: new RegExp(search_value, "i"),
            };
            query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
            query4["provider_detail.last_name"] = {
              $regex: new RegExp(full_name[0], "i"),
            };
            query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
            query6["provider_detail.last_name"] = {
              $regex: new RegExp(full_name[1], "i"),
            };
            var search = {
              $match: { $or: [query1, query2, query3, query4, query5, query6] },
            };
          }
        } else if (search_field === "store_detail.name") {
          var query1 = {};
          var query2 = {};
          var query3 = {};
          var query4 = {};
          var query5 = {};
          var query6 = {};
          var full_name = search_value.split(" ");
          if (
            typeof full_name[0] === "undefined" ||
            typeof full_name[1] === "undefined"
          ) {
            query1[search_field] = { $regex: new RegExp(search_value, "i") };
            query2["store_detail.name"] = {
              $regex: new RegExp(search_value, "i"),
            };
            var search = { $match: { $or: [query1, query2] } };
          } else {
            query1[search_field] = { $regex: new RegExp(search_value, "i") };
            query2["store_detail.name"] = {
              $regex: new RegExp(search_value, "i"),
            };
            query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
            query4["store_detail.name"] = {
              $regex: new RegExp(full_name[0], "i"),
            };
            query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
            query6["store_detail.name"] = {
              $regex: new RegExp(full_name[1], "i"),
            };
            var search = {
              $match: { $or: [query1, query2, query3, query4, query5, query6] },
            };
          }
        } else if (search_field == "unique_id") {
          var query = {};
          if (search_value !== "") {
            search_value = Number(search_value);
            query[search_field] = search_value;
            var search = { $match: query };
          }
        } else {
          var query = {};
          query[search_field] = { $regex: new RegExp(search_value, "i") };
          var search = { $match: query };
        }
        var filter = {
          $match: { completed_at: { $gte: start_date, $lt: end_date } },
        };
        var sort = { $sort: {} };
        sort["$sort"]["unique_id"] = parseInt(-1);
        var count = {
          $group: { _id: null, total: { $sum: 1 }, data: { $push: "$data" } },
        };
        var skip = {};
        skip["$skip"] = page * number_of_rec - number_of_rec;
        var limit = {};
        limit["$limit"] = number_of_rec;
        var condition1 = {
          $match: {
            $and: [
              { order_status_id: { $ne: ORDER_STATUS_ID.RUNNING } },
              { order_status_id: { $ne: ORDER_STATUS_ID.IDEAL } },
              {
                order_status: { $ne: ORDER_STATE.ORDER_DELETED },
              },
            ],
          },
        };

        var order_status_id_condition = { $match: {} };
        if (order_status_id != "") {
          order_status_id_condition = {
            $match: { order_status_id: { $eq: Number(order_status_id) } },
          };
        }
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
        if (page) {
          Order.aggregate([
            filter,
            admin_type_condition,
            condition1,
            created_by_condition,
            order_type_condition,
            order_status_id_condition,
            user_query,
            store_query,
            order_payment_query,
            //cart_query,
            //array_to_json_cart_query,
            //request_query,
            //review_query,
            array_to_json_user_detail,
            array_to_json_store_detail,
            array_to_json_order_payment_query,
            //array_to_json_request_query,
            //provider_query,
            //array_to_json_provider_query,
            payment_gateway_query,
            payment_detail_query,
            array_to_json_payment_detail_query,
            //pickup_type_condition,
            payment_status_condition,
            //store_branch_query,
            //array_to_json_store_branch,
            search,
            count,
          ]).then(
            (orders) => {
              if (orders.length === 0) {
                response_data.json({
                  success: false,
                  error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                  pages: 0,
                });
              } else {
                var pages = Math.ceil(orders[0].total / number_of_rec);
                var promo_query = {
                  $lookup: {
                    from: "promo_codes",
                    localField: "order_payment_detail.promo_id",
                    foreignField: "_id",
                    as: "promo_code_detail",
                  },
                };
                var array_to_json_promo_detail = {
                  $unwind: {
                    path: "$promo_code_detail",
                    preserveNullAndEmptyArrays: true,
                  },
                };
                Order.aggregate([
                  filter,
                  admin_type_condition,
                  condition1,
                  created_by_condition,
                  order_type_condition,
                  order_status_id_condition,
                  sort,
                  user_query,
                  store_query,
                  order_payment_query,
                  cart_query,
                  array_to_json_cart_query,
                  // request_query,
                  review_query,
                  // promo_query,
                  //array_to_json_promo_detail,
                  array_to_json_user_detail,
                  array_to_json_store_detail,
                  //  array_to_json_order_payment_query,
                  //  array_to_json_request_query,
                  provider_query,
                  array_to_json_provider_query,
                  payment_gateway_query,
                  payment_detail_query,
                  array_to_json_payment_detail_query,
                  //pickup_type_condition,
                  payment_status_condition,
                  // store_branch_query,
                  //array_to_json_store_branch,
                  search,
                  skip,
                  limit,
                ]).then(
                  async (orders) => {
                    if (orders.length === 0) {
                      response_data.json({
                        success: false,
                        error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                      });
                    } else {
                      if (request_data_body.admin_type == 4) {
                        orders.forEach((order) => {
                          let is_show_user_info =
                            order.store_detail.is_show_user_info == undefined ||
                            null
                              ? false
                              : order.store_detail.is_show_user_info;
                          if (!is_show_user_info) {
                            let email = order.user_detail.email.split("@");
                            order.user_detail.phone =
                              "XXXXXXX" + order.user_detail.phone.slice(6);
                            order.user_detail.email =
                              "xxxxxxx@" + email[email.length - 1];
                            order.cart_detail.destination_addresses[0].user_details.phone =
                              "XXXXXXX" + order.user_detail.phone.slice(6);
                            order.cart_detail.destination_addresses[0].user_details.email =
                              "xxxxxxx@" + email[email.length - 1];
                            order.cart_detail.destination_addresses[0].user_details.name =
                              Date.now();
                            order.user_detail.first_name = Date.now();
                          }
                        });
                      }

                      let orders_details = orders;
                      console.log("orders_details: ", orders);
                      let order_payment_ids = orders_details.map(
                        (o) => o.order_payment_id
                      );
                      const checkPaymentDetails = await paymentDetails
                        .find({
                          order_payment_id: { $in: order_payment_ids },
                        })
                        .lean();

                      orders.forEach((order) => {
                        // delete order?.user_detail?.image_url;
                        // delete order?.user_detail?.comments;
                        // delete order?.user_detail?.favourite_stores;
                        const paymentDetail = checkPaymentDetails.find((o) => {
                          const orderPaymentId = order.order_payment_id
                            ? order.order_payment_id.toString()
                            : null;
                          return o.order_payment_id === orderPaymentId;
                        });
                        order.paymentDetails = paymentDetail
                          ? paymentDetail
                          : null;
                      });

                      /**For Mapping Store Branch Name */
                      let store_ids = orders_details.map((o) => o.store_id);
                      const checkStoreDetails = await storeDetails
                        .find({
                          store_id: { $in: store_ids },
                        })
                        .lean();

                      orders.forEach((order) => {
                        const storeDetail = checkStoreDetails.find((o) => {
                          const storeId = order.store_id
                            ? order.store_id.toString()
                            : null;
                          return o.store_id.toString() === storeId;
                        });
                        order.storeDetails = storeDetail ? storeDetail : null;
                      });
                      // orderpd.find(o=>o._id===)

                      response_data.json({
                        success: true,
                        message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                        pages: pages,
                        orders: orders,
                      });
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
          var promo_query = {
            $lookup: {
              from: "promo_codes",
              localField: "order_payment_detail.promo_id",
              foreignField: "_id",
              as: "promo_code_detail",
            },
          };
          var array_to_json_promo_detail = {
            $unwind: {
              path: "$promo_code_detail",
              preserveNullAndEmptyArrays: true,
            },
          };
          Order.aggregate([
            admin_type_condition,
            condition1,
            created_by_condition,
            order_type_condition,
            city_query,
            array_to_json_city_query,
            order_status_id_condition,
            user_query,
            store_query,
            order_payment_query,
            cart_query,
            array_to_json_cart_query,
            request_query,
            review_query,
            promo_query,
            array_to_json_promo_detail,
            array_to_json_user_detail,
            array_to_json_store_detail,
            array_to_json_order_payment_query,
            array_to_json_request_query,
            provider_query,
            array_to_json_provider_query,
            payment_gateway_query,
            pickup_type_condition,
            payment_status_condition,
            sort,
            search,
            filter,
            payment_detail_query,
          ]).then(
            async (orders) => {
              if (orders.length === 0) {
                response_data.json({
                  success: false,
                  error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                });
              } else {
                if (request_data_body.admin_type == 4) {
                  orders.forEach((order) => {
                    let is_show_user_info =
                      order.store_detail.is_show_user_info == undefined || null
                        ? false
                        : order.store_detail.is_show_user_info;
                    if (!is_show_user_info) {
                      let email = order.user_detail.email.split("@");
                      order.user_detail.phone =
                        "XXXXXXX" + order.user_detail.phone.slice(6);
                      order.user_detail.email =
                        "xxxxxxx@" + email[email.length - 1];
                      order.cart_detail.destination_addresses[0].user_details.phone =
                        "XXXXXXX" + order.user_detail.phone.slice(6);
                      order.cart_detail.destination_addresses[0].user_details.email =
                        "xxxxxxx@" + email[email.length - 1];
                      order.cart_detail.destination_addresses[0].user_details.name =
                        Date.now();
                      order.user_detail.first_name = Date.now();
                    }
                  });
                }

                let order_payment_ids = orders.map((o) => o.order_payment_id);
                const checkPaymentDetails = await paymentDetails
                  .find({
                    order_payment_id: { $in: order_payment_ids },
                  })
                  .lean();

                orders.forEach((order) => {
                  const paymentDetail = checkPaymentDetails.find((o) => {
                    const orderPaymentId = order.order_payment_id
                      ? order.order_payment_id.toString()
                      : null;
                    return o.order_payment_id === orderPaymentId;
                  });
                  order.paymentDetails = paymentDetail ? paymentDetail : null;
                });

                /**For Mapping Store Branch Name */
                let store_ids = orders.map((o) => o.store_id);
                const checkStoreDetails = await storeDetails
                  .find({
                    store_id: { $in: store_ids },
                  })
                  .lean();

                orders.forEach((order) => {
                  const storeDetail = checkStoreDetails.find((o) => {
                    const storeId = order.store_id
                      ? order.store_id.toString()
                      : null;
                    return o.store_id.toString() === storeId;
                  });
                  order.storeDetails = storeDetail ? storeDetail : null;
                });

                response_data.json({
                  success: true,
                  message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                  orders: orders,
                });
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
      } else {
        response_data.json(response);
      }
    }
  );
};

//admin history v2 old
// exports.admin_history_v2 = function (request_data, response_data) {
//   utils.check_request_params(
//     request_data.body,
//     [{ name: "start_date" }, { name: "end_date" }],
//     async function (response) {
//       if (!response.success) {
//         return response_data.json(response);
//       }

//       const { pipeline, countPipeline } =
//         await getOrderHistoryAggregatePipeline(request_data?.body);

//       const orders = await Order.aggregate(pipeline);
//       let orderCount = await Order.aggregate(countPipeline);
//       console.log("orderCount: ", orderCount);
//       orderCount = orderCount?.[0]?.total;

//       const number_of_rec = SEARCH_SORT.NO_OF_RECORD_PER_PAGE;

//       const pages = Math.ceil(orderCount / number_of_rec);

//       let orders_details = orders;

//       let order_payment_ids = orders_details.map((o) => o.order_payment_id);
//       const checkPaymentDetails = await paymentDetails
//         .find({
//           order_payment_id: { $in: order_payment_ids },
//         })
//         .lean();

//       orders.forEach((order) => {
//         order.user_detail = {
//           first_name: order?.user_detail?.first_name,
//           last_name: order?.user_detail?.last_name,
//           image_url: order?.user_detail?.image_url,
//           unique_id: order?.user_detail?.unique_id,
//           email: order?.user_detail?.email,
//           country_phone_code: order?.user_detail?.country_phone_code,
//           phone: order?.user_detail?.phone,
//         };

//         order.store_detail = {
//           name: order?.store_detail?.name,
//           address: order?.store_detail?.address,
//           image_url: order?.store_detail?.image_url,
//           unique_id: order?.store_detail?.unique_id,
//           email: order?.store_detail?.email,
//           country_phone_code: order?.store_detail?.country_phone_code,
//           phone: order?.store_detail?.phone,
//         };

//         order.provider_detail = {
//           first_name: order?.provider_detail?.first_name,
//           last_name: order?.provider_detail?.last_name,
//           unique_id: order?.provider_detail?.unique_id,
//           email: order?.provider_detail?.email,
//           country_phone_code: order?.provider_detail?.country_phone_code,
//           phone: order?.provider_detail?.phone,
//         };

//         const paymentDetail = checkPaymentDetails.find((o) => {
//           const orderPaymentId = order.order_payment_id
//             ? order.order_payment_id.toString()
//             : null;
//           return o.order_payment_id === orderPaymentId;
//         });
//         order.paymentDetails = paymentDetail ? paymentDetail : null;
//       });

//       /**For Mapping Store Branch Name */
//       let store_ids = orders_details.map((o) => o.store_id);
//       const checkStoreDetails = await storeDetails
//         .find({
//           store_id: { $in: store_ids },
//         })
//         .lean();

//       orders.forEach((order) => {
//         const storeDetail = checkStoreDetails.find((o) => {
//           const storeId = order.store_id ? order.store_id.toString() : null;
//           return o.store_id.toString() === storeId;
//         });
//         order.storeDetails = storeDetail ? storeDetail : null;
//       });

//       response_data.json({
//         success: true,
//         message: 242,
//         orderCount,
//         pages: pages,
//         // count: orders.length,
//         orders,
//       });
//     }
//   );
// };

// admin get_order_data
exports.get_order_data = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "order_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var order_condition = {
          $match: {
            _id: { $eq: mongoose.Types.ObjectId(request_data_body.order_id) },
          },
        };

        var user_query = {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user_detail",
          },
        };
        var array_to_json_user_detail = { $unwind: "$user_detail" };
        var store_query = {
          $lookup: {
            from: "stores",
            localField: "store_id",
            foreignField: "_id",
            as: "store_detail",
          },
        };
        var array_to_json_store_detail = {
          $unwind: {
            path: "$store_detail",
            preserveNullAndEmptyArrays: true,
          },
        };

        var cart_query = {
          $lookup: {
            from: "carts",
            localField: "cart_id",
            foreignField: "_id",
            as: "cart_detail",
          },
        };
        var array_to_json_cart_query = { $unwind: "$cart_detail" };

        var city_query = {
          $lookup: {
            from: "cities",
            localField: "city_id",
            foreignField: "_id",
            as: "city_detail",
          },
        };

        var array_to_json_city_detail = { $unwind: "$city_detail" };

        var country_query = {
          $lookup: {
            from: "countries",
            localField: "country_id",
            foreignField: "_id",
            as: "country_detail",
          },
        };

        var array_to_json_country_query = { $unwind: "$country_detail" };

        var order_payment_query = {
          $lookup: {
            from: "order_payments",
            localField: "order_payment_id",
            foreignField: "_id",
            as: "order_payment_detail",
          },
        };
        var array_to_json_order_payment_query = {
          $unwind: "$order_payment_detail",
        };

        var request_query = {
          $lookup: {
            from: "requests",
            localField: "request_id",
            foreignField: "_id",
            as: "request_detail",
          },
        };

        var array_to_json_request_query = {
          $unwind: {
            path: "$request_detail",
            preserveNullAndEmptyArrays: true,
          },
        };

        var provider_query = {
          $lookup: {
            from: "providers",
            localField: "request_detail.current_provider",
            foreignField: "_id",
            as: "provider_detail",
          },
        };

        Order.aggregate([
          order_condition,
          user_query,
          store_query,
          cart_query,
          city_query,
          country_query,
          order_payment_query,
          request_query,
          array_to_json_user_detail,
          array_to_json_store_detail,
          array_to_json_order_payment_query,
          array_to_json_cart_query,
          array_to_json_city_detail,
          array_to_json_country_query,
          array_to_json_request_query,
          provider_query,
        ]).then(
          (order) => {
            if (order.length === 0) {
              response_data.json({
                success: false,
                error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
              });
            } else {
              response_data.json({
                success: true,
                message: ORDER_MESSAGE_CODE.GET_ORDER_DATA_SUCCESSFULLY,
                order: order[0],
              });
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
    }
  );
};

// delivery_list_search_sort
exports.delivery_list_search_sort = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      var user_query = {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user_detail",
        },
      };
      var array_to_json_user_query = { $unwind: "$user_detail" };

      var orders_array_unwind = { $unwind: "$orders" };
      var order_query = {
        $lookup: {
          from: "orders",
          localField: "orders.order_id",
          foreignField: "_id",
          as: "order_detail",
        },
      };
      var array_to_json_order_query = { $unwind: "$order_detail" };

      var cart_query = {
        $lookup: {
          from: "carts",
          localField: "order_detail.cart_id",
          foreignField: "_id",
          as: "cart_detail",
        },
      };
      var array_to_json_cart_query = { $unwind: "$cart_detail" };

      var store_query = {
        $lookup: {
          from: "stores",
          localField: "order_detail.store_id",
          foreignField: "_id",
          as: "store_detail",
        },
      };
      var array_to_json_store_query = {
        $unwind: {
          path: "$store_detail",
          preserveNullAndEmptyArrays: true,
        },
      };

      // var order_condition = {"$match": {$and: [{'order_detail.request_id': {$ne: null}}, {'order_detail.order_status_id': {$ne: ORDER_STATUS_ID.RUNNING}}]}};
      var order_condition = {
        $match: {
          "order_detail.order_status_id": { $eq: ORDER_STATUS_ID.RUNNING },
        },
      };

      var order_payment_query = {
        $lookup: {
          from: "order_payments",
          localField: "orders.order_payment_id",
          foreignField: "_id",
          as: "order_payment_detail",
        },
      };

      var array_to_json_order_payment_query = {
        $unwind: "$order_payment_detail",
      };

      var provider_query = {
        $lookup: {
          from: "providers",
          localField: "current_provider",
          foreignField: "_id",
          as: "provider_detail",
        },
      };
      var provider_unwind = {
        $unwind: {
          path: "$provider_detail",
          preserveNullAndEmptyArrays: true,
        },
      };

      var payment_gateway_query = {
        $lookup: {
          from: "payment_gateways",
          localField: "order_payment_detail.payment_id",
          foreignField: "_id",
          as: "payment_gateway_detail",
        },
      };
      var number_of_rec = SEARCH_SORT.NO_OF_RECORD_PER_PAGE;
      var page = request_data_body.page;

      var request_status = request_data_body.request_status;
      var search_field = request_data_body.search_field;
      var search_value = request_data_body.search_value;
      search_value = search_value.replace(/^\s+|\s+$/g, "");
      search_value = search_value.replace(/ +(?= )/g, "");
      if (search_field === "user_detail.first_name") {
        var query1 = {};
        var query2 = {};
        var query3 = {};
        var query4 = {};
        var query5 = {};
        var query6 = {};
        var full_name = search_value.split(" ");
        if (
          typeof full_name[0] === "undefined" ||
          typeof full_name[1] === "undefined"
        ) {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["user_detail.last_name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          var search = { $match: { $or: [query1, query2] } };
        } else {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["user_detail.last_name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
          query4["user_detail.last_name"] = {
            $regex: new RegExp(full_name[0], "i"),
          };
          query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
          query6["user_detail.last_name"] = {
            $regex: new RegExp(full_name[1], "i"),
          };
          var search = {
            $match: { $or: [query1, query2, query3, query4, query5, query6] },
          };
        }
      } else if (search_field === "provider_detail.first_name") {
        var query1 = {};
        var query2 = {};
        var query3 = {};
        var query4 = {};
        var query5 = {};
        var query6 = {};
        var full_name = search_value.split(" ");
        if (
          typeof full_name[0] === "undefined" ||
          typeof full_name[1] === "undefined"
        ) {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["provider_detail.last_name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          var search = { $match: { $or: [query1, query2] } };
        } else {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["provider_detail.last_name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
          query4["provider_detail.last_name"] = {
            $regex: new RegExp(full_name[0], "i"),
          };
          query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
          query6["provider_detail.last_name"] = {
            $regex: new RegExp(full_name[1], "i"),
          };
          var search = {
            $match: { $or: [query1, query2, query3, query4, query5, query6] },
          };
        }
      } else if (search_field === "store_detail.first_name") {
        var query1 = {};
        var query2 = {};
        var query3 = {};
        var query4 = {};
        var query5 = {};
        var query6 = {};
        var full_name = search_value.split(" ");
        if (
          typeof full_name[0] === "undefined" ||
          typeof full_name[1] === "undefined"
        ) {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["store_detail.last_name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          var search = { $match: { $or: [query1, query2] } };
        } else {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["store_detail.last_name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
          query4["store_detail.last_name"] = {
            $regex: new RegExp(full_name[0], "i"),
          };
          query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
          query6["store_detail.last_name"] = {
            $regex: new RegExp(full_name[1], "i"),
          };
          var search = {
            $match: { $or: [query1, query2, query3, query4, query5, query6] },
          };
        }
      } else if (search_field == "order_detail.unique_id") {
        var query = {};
        if (search_value !== "") {
          search_value = Number(search_value);
          query[search_field] = search_value;
          var search = { $match: query };
        }
      } else {
        var query = {};
        query[search_field] = { $regex: new RegExp(search_value, "i") };
        var search = { $match: query };
      }

      var sort = { $sort: {} };
      sort["$sort"]["order_detail.unique_id"] = parseInt(-1);
      var count = {
        $group: { _id: null, total: { $sum: 1 }, data: { $push: "$data" } },
      };

      var request_status_condition = { $match: {} };
      if (request_status != "") {
        request_status_condition = {
          $match: { delivery_status: Number(request_status) },
        };
      }

      var pickup_type = request_data_body.pickup_type;
      var pickup_type_condition = { $match: {} };
      if (pickup_type != "both") {
        if (request_data_body.pickup_type == "true") {
          pickup_type_condition = {
            $match: {
              "order_payment_detail.is_user_pick_up_order": { $eq: true },
            },
          };
        } else {
          pickup_type_condition = {
            $match: {
              "order_payment_detail.is_user_pick_up_order": { $eq: false },
            },
          };
        }
      }

      var payment_status_condition = { $match: {} };
      if (request_data_body.payment_status != "all") {
        if (request_data_body.payment_status == "true") {
          payment_status_condition = {
            $match: {
              "order_payment_detail.is_payment_mode_cash": { $eq: true },
            },
          };
        } else {
          payment_status_condition = {
            $match: {
              "order_payment_detail.is_payment_mode_cash": { $eq: false },
            },
          };
        }
      }

      var delivery_status_condition = {
        $match: {
          delivery_status: { $gte: ORDER_STATE.WAITING_FOR_DELIVERY_MAN },
        },
      };
      var delivery_status_manage_id_condition = {
        $match: {
          delivery_status_manage_id: { $ne: ORDER_STATUS_ID.COMPLETED },
        },
      };
      console.log(payment_status_condition);
      if (page) {
        var skip = {};
        skip["$skip"] = page * number_of_rec - number_of_rec;
        var limit = {};
        limit["$limit"] = number_of_rec;
        Request.aggregate([
          delivery_status_condition,
          request_status_condition,
          delivery_status_manage_id_condition,
          user_query,
          provider_query,
          provider_unwind,
          orders_array_unwind,
          order_query,
          order_payment_query,
          array_to_json_user_query,
          array_to_json_order_query,
          order_condition,
          array_to_json_order_payment_query,
          payment_gateway_query,
          cart_query,
          array_to_json_cart_query,
          store_query,
          pickup_type_condition,
          payment_status_condition,
          array_to_json_store_query,
          search,
          count,
        ]).then(
          (requests) => {
            if (requests.length === 0) {
              response_data.json({
                success: false,
                error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                pages: 0,
              });
            } else {
              var pages = Math.ceil(requests[0].total / number_of_rec);
              Request.aggregate([
                delivery_status_condition,
                request_status_condition,
                delivery_status_manage_id_condition,
                user_query,
                provider_query,
                provider_unwind,
                orders_array_unwind,
                order_query,
                order_payment_query,
                array_to_json_user_query,
                array_to_json_order_query,
                order_condition,
                array_to_json_order_payment_query,
                payment_gateway_query,
                cart_query,
                array_to_json_cart_query,
                store_query,
                array_to_json_store_query,
                pickup_type_condition,
                payment_status_condition,
                sort,
                search,
                skip,
                limit,
              ]).then(
                (requests) => {
                  if (requests.length === 0) {
                    response_data.json({
                      success: false,
                      error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                    });
                  } else {
                    response_data.json({
                      success: true,
                      message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                      pages: pages,
                      requests: requests,
                    });
                  }
                },
                (error) => {
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
        Request.aggregate([
          delivery_status_condition,
          request_status_condition,
          delivery_status_manage_id_condition,
          user_query,
          provider_query,
          provider_unwind,
          orders_array_unwind,
          order_query,
          order_payment_query,
          array_to_json_user_query,
          array_to_json_order_query,
          order_condition,
          array_to_json_order_payment_query,
          payment_gateway_query,
          cart_query,
          array_to_json_cart_query,
          store_query,
          array_to_json_store_query,
          pickup_type_condition,
          payment_status_condition,
          sort,
          search,
        ]).then(
          (requests) => {
            if (requests.length === 0) {
              response_data.json({
                success: false,
                error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
              });
            } else {
              response_data.json({
                success: true,
                message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                requests: requests,
              });
            }
          },
          (error) => {
            response_data.json({
              success: false,
              error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
            });
          }
        );
      }
    } else {
      response_data.json(response);
    }
  });
};

// view_history
exports.view_history = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [
      { name: "id", type: "string" },
      { name: "type" },
      { name: "start_date" },
      { name: "end_date" },
    ],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var type = request_data_body.type;

        var condition1 = { $match: {} };

        if (type == 2) {
          condition1 = {
            $match: {
              user_id: { $eq: mongoose.Types.ObjectId(request_data_body.id) },
            },
          };
        } else if (type == 3) {
          condition1 = {
            $match: {
              store_id: { $eq: mongoose.Types.ObjectId(request_data_body.id) },
            },
          };
        }

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
            var end_date = request_data_body.end_date.formatted;
            end_date = new Date(end_date);
            end_date = end_date.setHours(23, 59, 59, 999);
            end_date = new Date(end_date);
          } else {
            var start_date = request_data_body.start_date.formatted;
            start_date = new Date(start_date);
            start_date = start_date.setHours(0, 0, 0, 0);
            start_date = new Date(start_date);
            end_date = new Date(Date.now());
          }
        } else {
          var start_date = request_data_body.start_date.formatted;
          var end_date = request_data_body.end_date.formatted;

          start_date = new Date(start_date);
          start_date = start_date.setHours(0, 0, 0, 0);
          start_date = new Date(start_date);
          end_date = new Date(end_date);
          end_date = end_date.setHours(23, 59, 59, 999);
          end_date = new Date(end_date);
        }

        var user_query = {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user_detail",
          },
        };
        var array_to_json_user_detail = { $unwind: "$user_detail" };
        var store_query = {
          $lookup: {
            from: "stores",
            localField: "store_id",
            foreignField: "_id",
            as: "store_detail",
          },
        };
        var array_to_json_store_detail = {
          $unwind: {
            path: "$store_detail",
            preserveNullAndEmptyArrays: true,
          },
        };
        var order_payment_query = {
          $lookup: {
            from: "order_payments",
            localField: "order_payment_id",
            foreignField: "_id",
            as: "order_payment_detail",
          },
        };
        var array_to_json_order_payment_query = {
          $unwind: "$order_payment_detail",
        };

        var payment_gateway_query = {
          $lookup: {
            from: "payment_gateways",
            localField: "order_payment_detail.payment_id",
            foreignField: "_id",
            as: "payment_gateway_detail",
          },
        };

        var city_query = {
          $lookup: {
            from: "cities",
            localField: "city_id",
            foreignField: "_id",
            as: "city_detail",
          },
        };
        var array_to_json_city_query = { $unwind: "$city_detail" };

        var request_query = {
          $lookup: {
            from: "requests",
            localField: "request_id",
            foreignField: "_id",
            as: "request_detail",
          },
        };
        var array_to_json_request_query = {
          $unwind: {
            path: "$request_detail",
            preserveNullAndEmptyArrays: true,
          },
        };

        var provider_query = {
          $lookup: {
            from: "providers",
            localField: "request_detail.current_provider",
            foreignField: "_id",
            as: "provider_detail",
          },
        };
        var number_of_rec = SEARCH_SORT.NO_OF_RECORD_PER_PAGE;
        var page = request_data_body.page;

        var sort_field = request_data_body.sort_field;
        var sort_order = request_data_body.sort_order;
        var search_field = request_data_body.search_field;
        var search_value = request_data_body.search_value;
        search_value = search_value.replace(/^\s+|\s+$/g, "");
        search_value = search_value.replace(/ +(?= )/g, "");

        if (search_field === "user_detail.first_name") {
          var query1 = {};
          var query2 = {};
          var query3 = {};
          var query4 = {};
          var query5 = {};
          var query6 = {};
          var full_name = search_value.split(" ");
          if (
            typeof full_name[0] === "undefined" ||
            typeof full_name[1] === "undefined"
          ) {
            query1[search_field] = { $regex: new RegExp(search_value, "i") };
            query2["user_detail.last_name"] = {
              $regex: new RegExp(search_value, "i"),
            };
            var search = { $match: { $or: [query1, query2] } };
          } else {
            query1[search_field] = { $regex: new RegExp(search_value, "i") };
            query2["user_detail.last_name"] = {
              $regex: new RegExp(search_value, "i"),
            };
            query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
            query4["user_detail.last_name"] = {
              $regex: new RegExp(full_name[0], "i"),
            };
            query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
            query6["user_detail.last_name"] = {
              $regex: new RegExp(full_name[1], "i"),
            };
            var search = {
              $match: { $or: [query1, query2, query3, query4, query5, query6] },
            };
          }
        } else if (search_field === "provider_detail.first_name") {
          var query1 = {};
          var query2 = {};
          var query3 = {};
          var query4 = {};
          var query5 = {};
          var query6 = {};
          var full_name = search_value.split(" ");
          if (
            typeof full_name[0] === "undefined" ||
            typeof full_name[1] === "undefined"
          ) {
            query1[search_field] = { $regex: new RegExp(search_value, "i") };
            query2["provider_detail.last_name"] = {
              $regex: new RegExp(search_value, "i"),
            };
            var search = { $match: { $or: [query1, query2] } };
          } else {
            query1[search_field] = { $regex: new RegExp(search_value, "i") };
            query2["provider_detail.last_name"] = {
              $regex: new RegExp(search_value, "i"),
            };
            query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
            query4["provider_detail.last_name"] = {
              $regex: new RegExp(full_name[0], "i"),
            };
            query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
            query6["provider_detail.last_name"] = {
              $regex: new RegExp(full_name[1], "i"),
            };
            var search = {
              $match: { $or: [query1, query2, query3, query4, query5, query6] },
            };
          }
        } else if (search_field === "store_detail.name") {
          var query1 = {};
          var query2 = {};
          var query3 = {};
          var query4 = {};
          var query5 = {};
          var query6 = {};
          var full_name = search_value.split(" ");
          if (
            typeof full_name[0] === "undefined" ||
            typeof full_name[1] === "undefined"
          ) {
            query1[search_field] = { $regex: new RegExp(search_value, "i") };
            query2["store_detail.name"] = {
              $regex: new RegExp(search_value, "i"),
            };
            var search = { $match: { $or: [query1, query2] } };
          } else {
            query1[search_field] = { $regex: new RegExp(search_value, "i") };
            query2["store_detail.name"] = {
              $regex: new RegExp(search_value, "i"),
            };
            query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
            query4["store_detail.name"] = {
              $regex: new RegExp(full_name[0], "i"),
            };
            query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
            query6["store_detail.name"] = {
              $regex: new RegExp(full_name[1], "i"),
            };
            var search = {
              $match: { $or: [query1, query2, query3, query4, query5, query6] },
            };
          }
        } else {
          var query = {};
          query[search_field] = { $regex: new RegExp(search_value, "i") };
          var search = { $match: query };
        }
        var filter = {
          $match: { completed_at: { $gte: start_date, $lt: end_date } },
        };
        var sort = { $sort: {} };
        sort["$sort"][sort_field] = parseInt(sort_order);
        var count = {
          $group: { _id: null, total: { $sum: 1 }, data: { $push: "$data" } },
        };
        var skip = {};
        skip["$skip"] = page * number_of_rec - number_of_rec;
        var limit = {};
        limit["$limit"] = number_of_rec;
        var order_condition = {
          $match: { order_status_id: { $eq: ORDER_STATUS_ID.COMPLETED } },
        };

        Order.aggregate([
          condition1,
          order_condition,
          user_query,
          city_query,
          request_query,
          order_payment_query,
          store_query,
          array_to_json_user_detail,
          array_to_json_city_query,
          array_to_json_store_detail,
          array_to_json_order_payment_query,
          payment_gateway_query,
          array_to_json_request_query,
          provider_query,
          search,
          filter,
          count,
        ]).then(
          (orders) => {
            if (orders.length === 0) {
              response_data.json({
                success: false,
                error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                pages: 0,
              });
            } else {
              var pages = Math.ceil(orders[0].total / number_of_rec);
              Order.aggregate([
                condition1,
                order_condition,
                user_query,
                city_query,
                request_query,
                order_payment_query,
                store_query,
                array_to_json_user_detail,
                array_to_json_city_query,
                array_to_json_store_detail,
                array_to_json_order_payment_query,
                payment_gateway_query,
                array_to_json_request_query,
                provider_query,
                sort,
                search,
                filter,
                skip,
                limit,
              ]).then(
                (orders) => {
                  if (orders.length === 0) {
                    response_data.json({
                      success: false,
                      error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                    });
                  } else {
                    response_data.json({
                      success: true,
                      message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                      pages: pages,
                      orders: orders,
                    });
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
    }
  );
};

// get_request_data
exports.get_request_data = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "request_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var request_condition = {
          $match: {
            _id: { $eq: mongoose.Types.ObjectId(request_data_body.request_id) },
          },
        };
        var user_query = {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user_detail",
          },
        };
        var array_to_json_user_detail = { $unwind: "$user_detail" };
        var orders_array_unwind = { $unwind: "$orders" };
        var order_query = {
          $lookup: {
            from: "orders",
            localField: "orders.order_id",
            foreignField: "_id",
            as: "order_detail",
          },
        };

        var array_to_json_order_query = { $unwind: "$order_detail" };

        var cart_query = {
          $lookup: {
            from: "carts",
            localField: "orders.cart_id",
            foreignField: "_id",
            as: "cart_detail",
          },
        };

        var array_to_json_cart_query = { $unwind: "$cart_detail" };
        var order_payment_query = {
          $lookup: {
            from: "order_payments",
            localField: "orders.order_payment_id",
            foreignField: "_id",
            as: "order_payment_detail",
          },
        };

        var array_to_json_order_payment_query = {
          $unwind: "$order_payment_detail",
        };
        var provider_query = {
          $lookup: {
            from: "providers",
            localField: "current_provider",
            foreignField: "_id",
            as: "provider_detail",
          },
        };

        var payment_gateway_query = {
          $lookup: {
            from: "payment_gateways",
            localField: "order_payment_detail.payment_id",
            foreignField: "_id",
            as: "payment_gateway_detail",
          },
        };

        var store_query = {
          $lookup: {
            from: "stores",
            localField: "order_detail.store_id",
            foreignField: "_id",
            as: "store_detail",
          },
        };
        var array_to_json_store_detail = {
          $unwind: {
            path: "$store_detail",
            preserveNullAndEmptyArrays: true,
          },
        };

        var city_query = {
          $lookup: {
            from: "cities",
            localField: "city_id",
            foreignField: "_id",
            as: "city_detail",
          },
        };

        var array_to_json_city_detail = { $unwind: "$city_detail" };

        var country_query = {
          $lookup: {
            from: "countries",
            localField: "city_detail.country_id",
            foreignField: "_id",
            as: "country_detail",
          },
        };

        var array_to_json_country_query = { $unwind: "$country_detail" };

        Request.aggregate([
          request_condition,
          user_query,
          array_to_json_user_detail,
          city_query,
          array_to_json_city_detail,
          country_query,
          array_to_json_country_query,
          orders_array_unwind,
          order_query,
          array_to_json_order_query,
          cart_query,
          array_to_json_cart_query,
          order_payment_query,
          array_to_json_order_payment_query,
          store_query,
          array_to_json_store_detail,
          provider_query,
        ]).then(
          (request) => {
            if (request.length === 0) {
              response_data.json({
                success: false,
                error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
              });
            } else {
              response_data.json({
                success: true,
                message: ORDER_MESSAGE_CODE.GET_ORDER_DATA_SUCCESSFULLY,
                request: request[0],
              });
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
    }
  );
};

// view_history
exports.view_provider_history = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "start_date" }, { name: "end_date" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
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
            var end_date = request_data_body.end_date.formatted;
            end_date = new Date(end_date);
            end_date = end_date.setHours(23, 59, 59, 999);
            end_date = new Date(end_date);
          } else {
            var start_date = request_data_body.start_date.formatted;
            start_date = new Date(start_date);
            start_date = start_date.setHours(0, 0, 0, 0);
            start_date = new Date(start_date);
            end_date = new Date(Date.now());
          }
        } else {
          var start_date = request_data_body.start_date.formatted;
          var end_date = request_data_body.end_date.formatted;

          start_date = new Date(start_date);
          start_date = start_date.setHours(0, 0, 0, 0);
          start_date = new Date(start_date);
          end_date = new Date(end_date);
          end_date = end_date.setHours(23, 59, 59, 999);
          end_date = new Date(end_date);
        }

        var request_data_body = request_data.body;
        var user_query = {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user_detail",
          },
        };
        var array_to_json_user_detail = { $unwind: "$user_detail" };

        var orders_array_unwind = { $unwind: "$orders" };

        var order_query = {
          $lookup: {
            from: "orders",
            localField: "orders.order_id",
            foreignField: "_id",
            as: "order_detail",
          },
        };

        var array_to_json_order_query = { $unwind: "$order_detail" };

        var store_query = {
          $lookup: {
            from: "stores",
            localField: "order_detail.store_id",
            foreignField: "_id",
            as: "store_detail",
          },
        };
        var array_to_json_store_detail = {
          $unwind: {
            path: "$store_detail",
            preserveNullAndEmptyArrays: true,
          },
        };

        var city_query = {
          $lookup: {
            from: "cities",
            localField: "city_id",
            foreignField: "_id",
            as: "city_detail",
          },
        };

        var array_to_json_city_query = { $unwind: "$city_detail" };

        var order_payment_query = {
          $lookup: {
            from: "order_payments",
            localField: "orders.order_payment_id",
            foreignField: "_id",
            as: "order_payment_detail",
          },
        };

        var array_to_json_order_payment_query = {
          $unwind: "$order_payment_detail",
        };

        var provider_query = {
          $lookup: {
            from: "providers",
            localField: "current_provider",
            foreignField: "_id",
            as: "provider_detail",
          },
        };

        var payment_gateway_query = {
          $lookup: {
            from: "payment_gateways",
            localField: "order_payment_detail.payment_id",
            foreignField: "_id",
            as: "payment_gateway_detail",
          },
        };
        var number_of_rec = SEARCH_SORT.NO_OF_RECORD_PER_PAGE;
        var page = request_data_body.page;

        var sort_field = request_data_body.sort_field;
        var sort_request = request_data_body.sort_request;
        var search_field = request_data_body.search_field;
        var search_value = request_data_body.search_value;
        search_value = search_value.replace(/^\s+|\s+$/g, "");
        search_value = search_value.replace(/ +(?= )/g, "");
        if (search_field === "user_detail.first_name") {
          var query1 = {};
          var query2 = {};
          var query3 = {};
          var query4 = {};
          var query5 = {};
          var query6 = {};
          var full_name = search_value.split(" ");
          if (
            typeof full_name[0] === "undefined" ||
            typeof full_name[1] === "undefined"
          ) {
            query1[search_field] = { $regex: new RegExp(search_value, "i") };
            query2["user_detail.last_name"] = {
              $regex: new RegExp(search_value, "i"),
            };
            var search = { $match: { $or: [query1, query2] } };
          } else {
            query1[search_field] = { $regex: new RegExp(search_value, "i") };
            query2["user_detail.last_name"] = {
              $regex: new RegExp(search_value, "i"),
            };
            query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
            query4["user_detail.last_name"] = {
              $regex: new RegExp(full_name[0], "i"),
            };
            query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
            query6["user_detail.last_name"] = {
              $regex: new RegExp(full_name[1], "i"),
            };
            var search = {
              $match: { $or: [query1, query2, query3, query4, query5, query6] },
            };
          }
        } else if (search_field === "provider_detail.first_name") {
          var query1 = {};
          var query2 = {};
          var query3 = {};
          var query4 = {};
          var query5 = {};
          var query6 = {};
          var full_name = search_value.split(" ");
          if (
            typeof full_name[0] === "undefined" ||
            typeof full_name[1] === "undefined"
          ) {
            query1[search_field] = { $regex: new RegExp(search_value, "i") };
            query2["provider_detail.last_name"] = {
              $regex: new RegExp(search_value, "i"),
            };
            var search = { $match: { $or: [query1, query2] } };
          } else {
            query1[search_field] = { $regex: new RegExp(search_value, "i") };
            query2["provider_detail.last_name"] = {
              $regex: new RegExp(search_value, "i"),
            };
            query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
            query4["provider_detail.last_name"] = {
              $regex: new RegExp(full_name[0], "i"),
            };
            query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
            query6["provider_detail.last_name"] = {
              $regex: new RegExp(full_name[1], "i"),
            };
            var search = {
              $match: { $or: [query1, query2, query3, query4, query5, query6] },
            };
          }
        } else {
          var query = {};
          query[search_field] = { $regex: new RegExp(search_value, "i") };
          var search = { $match: query };
        }
        var filter = {
          $match: { completed_at: { $gte: start_date, $lt: end_date } },
        };
        var sort = { $sort: {} };
        sort["$sort"][sort_field] = parseInt(sort_request);
        var count = {
          $group: { _id: null, total: { $sum: 1 }, data: { $push: "$data" } },
        };
        var skip = {};
        skip["$skip"] = page * number_of_rec - number_of_rec;
        var limit = {};
        limit["$limit"] = number_of_rec;

        var provider_condition = {
          $match: {
            current_provider: {
              $eq: mongoose.Types.ObjectId(request_data_body.provider_id),
            },
          },
        };

        var delivery_status_condition = {
          $match: {
            $or: [
              { delivery_status: ORDER_STATE.ORDER_COMPLETED },
              { delivery_status: ORDER_STATE.STORE_CANCELLED_REQUEST },
              { delivery_status: ORDER_STATE.DELIVERY_MAN_CANCELLED },
            ],
          },
        };
        var delivery_status_manage_id_condition = {
          $match: {
            $or: [
              { delivery_status_manage_id: ORDER_STATUS_ID.COMPLETED },
              { delivery_status_manage_id: ORDER_STATUS_ID.CANCELLED },
            ],
          },
        };

        Request.aggregate([
          provider_condition,
          delivery_status_condition,
          delivery_status_manage_id_condition,
          user_query,
          orders_array_unwind,
          order_query,
          array_to_json_order_query,
          order_payment_query,
          city_query,
          store_query,
          provider_query,
          array_to_json_user_detail,
          array_to_json_city_query,
          array_to_json_store_detail,
          array_to_json_order_payment_query,
          payment_gateway_query,

          search,
          filter,
          count,
        ]).then(
          (requests) => {
            if (requests.length === 0) {
              response_data.json({
                success: false,
                error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                pages: 0,
              });
            } else {
              var timezone = "";
              if (setting_detail) {
                timezone = setting_detail.admin_panel_timezone;
              }
              var pages = Math.ceil(requests[0].total / number_of_rec);
              if (page) {
                Request.aggregate([
                  provider_condition,
                  delivery_status_condition,
                  delivery_status_manage_id_condition,
                  user_query,
                  orders_array_unwind,
                  order_query,
                  array_to_json_order_query,
                  order_payment_query,
                  city_query,
                  store_query,
                  provider_query,
                  array_to_json_user_detail,
                  array_to_json_city_query,
                  array_to_json_store_detail,
                  array_to_json_order_payment_query,
                  payment_gateway_query,

                  sort,
                  search,
                  filter,
                  skip,
                  limit,
                ]).then(
                  (requests) => {
                    if (requests.length === 0) {
                      response_data.json({
                        success: false,
                        error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                      });
                    } else {
                      response_data.json({
                        success: true,
                        message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                        pages: pages,
                        requests: requests,
                        timezone: timezone,
                      });
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
    }
  );
};

// history_export_excel
exports.history_export_excel = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
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
          var end_date = request_data_body.end_date.formatted;
          end_date = new Date(end_date);
          end_date = end_date.setHours(23, 59, 59, 999);
          end_date = new Date(end_date);
        } else {
          var start_date = request_data_body.start_date.formatted;
          start_date = new Date(start_date);
          start_date = start_date.setHours(0, 0, 0, 0);
          start_date = new Date(start_date);
          end_date = new Date(Date.now());
        }
      } else {
        var start_date = request_data_body.start_date.formatted;
        var end_date = request_data_body.end_date.formatted;

        start_date = new Date(start_date);
        start_date = start_date.setHours(0, 0, 0, 0);
        start_date = new Date(start_date);
        end_date = new Date(end_date);
        end_date = end_date.setHours(23, 59, 59, 999);
        end_date = new Date(end_date);
      }

      var user_query = {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user_detail",
        },
      };
      var array_to_json_user_detail = { $unwind: "$user_detail" };
      var store_query = {
        $lookup: {
          from: "stores",
          localField: "store_id",
          foreignField: "_id",
          as: "store_detail",
        },
      };
      var array_to_json_store_detail = {
        $unwind: {
          path: "$store_detail",
          preserveNullAndEmptyArrays: true,
        },
      };

      var city_query = {
        $lookup: {
          from: "cities",
          localField: "city_id",
          foreignField: "_id",
          as: "city_detail",
        },
      };
      var array_to_json_city_query = { $unwind: "$city_detail" };
      var order_payment_query = {
        $lookup: {
          from: "order_payments",
          localField: "order_payment_id",
          foreignField: "_id",
          as: "order_payment_detail",
        },
      };
      var array_to_json_order_payment_query = {
        $unwind: "$order_payment_detail",
      };

      var request_query = {
        $lookup: {
          from: "requests",
          localField: "request_id",
          foreignField: "_id",
          as: "request_detail",
        },
      };

      var array_to_json_request_query = {
        $unwind: {
          path: "$request_detail",
          preserveNullAndEmptyArrays: true,
        },
      };

      var provider_query = {
        $lookup: {
          from: "providers",
          localField: "request_detail.current_provider",
          foreignField: "_id",
          as: "provider_detail",
        },
      };

      var payment_gateway_query = {
        $lookup: {
          from: "payment_gateways",
          localField: "order_payment_detail.payment_id",
          foreignField: "_id",
          as: "payment_gateway_detail",
        },
      };
      var number_of_rec = SEARCH_SORT.NO_OF_RECORD_PER_PAGE;
      var page = request_data_body.page;

      var sort_field = request_data_body.sort_field;
      var sort_order = request_data_body.sort_order;
      var search_field = request_data_body.search_field;
      var search_value = request_data_body.search_value;

      if (search_field === "user_detail.first_name") {
        search_value = search_value.replace(/^\s+|\s+$/g, "");
        search_value = search_value.replace(/ +(?= )/g, "");
        var query1 = {};
        var query2 = {};
        var query3 = {};
        var query4 = {};
        var query5 = {};
        var query6 = {};
        var full_name = search_value.split(" ");
        if (
          typeof full_name[0] === "undefined" ||
          typeof full_name[1] === "undefined"
        ) {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["user_detail.last_name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          var search = { $match: { $or: [query1, query2] } };
        } else {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["user_detail.last_name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
          query4["user_detail.last_name"] = {
            $regex: new RegExp(full_name[0], "i"),
          };
          query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
          query6["user_detail.last_name"] = {
            $regex: new RegExp(full_name[1], "i"),
          };
          var search = {
            $match: { $or: [query1, query2, query3, query4, query5, query6] },
          };
        }
      } else if (search_field === "provider_detail.first_name") {
        search_value = search_value.replace(/^\s+|\s+$/g, "");
        search_value = search_value.replace(/ +(?= )/g, "");
        var query1 = {};
        var query2 = {};
        var query3 = {};
        var query4 = {};
        var query5 = {};
        var query6 = {};
        var full_name = search_value.split(" ");
        if (
          typeof full_name[0] === "undefined" ||
          typeof full_name[1] === "undefined"
        ) {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["provider_detail.last_name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          var search = { $match: { $or: [query1, query2] } };
        } else {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["provider_detail.last_name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
          query4["provider_detail.last_name"] = {
            $regex: new RegExp(full_name[0], "i"),
          };
          query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
          query6["provider_detail.last_name"] = {
            $regex: new RegExp(full_name[1], "i"),
          };
          var search = {
            $match: { $or: [query1, query2, query3, query4, query5, query6] },
          };
        }
      } else if (search_field === "store_detail.name") {
        search_value = search_value.replace(/^\s+|\s+$/g, "");
        search_value = search_value.replace(/ +(?= )/g, "");
        var query1 = {};
        var query2 = {};
        var query3 = {};
        var query4 = {};
        var query5 = {};
        var query6 = {};
        var full_name = search_value.split(" ");
        if (
          typeof full_name[0] === "undefined" ||
          typeof full_name[1] === "undefined"
        ) {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["store_detail.name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          var search = { $match: { $or: [query1, query2] } };
        } else {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["store_detail.name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
          query4["store_detail.name"] = {
            $regex: new RegExp(full_name[0], "i"),
          };
          query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
          query6["store_detail.name"] = {
            $regex: new RegExp(full_name[1], "i"),
          };
          var search = {
            $match: { $or: [query1, query2, query3, query4, query5, query6] },
          };
        }
      } else if (search_field == "unique_id") {
        var query = {};
        if (search_value !== "") {
          search_value = Number(search_value);
          query[search_field] = search_value;
          var search = { $match: query };
        }
      } else {
        var query = {};
        query[search_field] = { $regex: new RegExp(search_value, "i") };
        var search = { $match: query };
      }
      var filter = {
        $match: { completed_at: { $gte: start_date, $lt: end_date } },
      };
      var sort = { $sort: {} };
      sort["$sort"][sort_field] = parseInt(sort_order);
      var count = {
        $group: { _id: null, total: { $sum: 1 }, data: { $push: "$data" } },
      };
      var skip = {};
      skip["$skip"] = page * number_of_rec - number_of_rec;
      var limit = {};
      limit["$limit"] = number_of_rec;
      var condition = {
        $match: { order_status_id: { $ne: ORDER_STATUS_ID.RUNNING } },
      };

      var group = {
        $group: {
          _id: null,
          data: {
            $push: {
              user_first_name: "$user_detail.first_name",
              user_last_name: "$user_detail.last_name",
              store: "$store_detail.name",
              city: "$city_detail.city_name",
              provider_first_name: "$provider_detail.first_name",
              provider_last_name: "$provider_detail.last_name",
              amount: "$order_payment_detail.total",
              date: "$created_at",
            },
          },
        },
      };
      var project = { $project: { data: 1 } };

      Order.aggregate([
        condition,
        user_query,
        order_payment_query,
        city_query,
        store_query,
        request_query,
        array_to_json_request_query,
        provider_query,
        array_to_json_user_detail,
        array_to_json_store_detail,
        array_to_json_city_query,
        array_to_json_order_payment_query,
        payment_gateway_query,
        search,
        group,
        project,
      ]).then(
        (orders) => {
          if (orders.length === 0) {
            response_data.json({
              success: false,
              error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
              pages: 0,
            });
          } else {
            var json_data = [];
            if (orders[0].data.length > 0) {
              var order_data = orders[0].data;
              for (var i = 0; i < order_data.length; ) {
                var city = "";
                var order_status = "";

                var provider_first_name = "";
                var provider_last_name = "";

                city = order_data[i].city;
                if (order_data[i].provider_first_name.length > 0) {
                  provider_first_name = order_data[i].provider_first_name[0];
                  provider_last_name = order_data[i].provider_last_name[0];
                }
                json_data.push({
                  User:
                    order_data[i].user_first_name +
                    " " +
                    order_data[i].user_last_name,
                  Store: order_data[i].store,
                  City: city,
                  Provider: provider_first_name + " " + provider_last_name,
                  Amount: order_data[i].amount,
                  Date: order_data[i].date,
                });
                i++;
                if (orders[0].data.length == i) {
                  response_data.json({
                    success: true,
                    message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                    orders: json_data,
                  });
                }
              }
            } else {
              response_data.json({
                success: false,
                error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                pages: 0,
              });
            }
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

// deliveries_export_excel
exports.deliveries_export_excel = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      var user_query = {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user_detail",
        },
      };
      var array_to_json_user_detail = { $unwind: "$user_detail" };
      var orders_array_unwind = { $unwind: "$orders" };
      var order_query = {
        $lookup: {
          from: "orders",
          localField: "orders.order_id",
          foreignField: "_id",
          as: "order_detail",
        },
      };

      var array_to_json_order_query = { $unwind: "$order_detail" };
      var store_query = {
        $lookup: {
          from: "stores",
          localField: "order_detail.store_id",
          foreignField: "_id",
          as: "store_detail",
        },
      };
      var array_to_json_store_detail = {
        $unwind: {
          path: "$store_detail",
          preserveNullAndEmptyArrays: true,
        },
      };

      var city_query = {
        $lookup: {
          from: "cities",
          localField: "city_id",
          foreignField: "_id",
          as: "city_detail",
        },
      };

      var array_to_json_city_query = { $unwind: "$city_detail" };
      var order_payment_query = {
        $lookup: {
          from: "order_payments",
          localField: "orders.order_payment_id",
          foreignField: "_id",
          as: "order_payment_detail",
        },
      };

      var array_to_json_order_payment_query = {
        $unwind: "$order_payment_detail",
      };
      var provider_query = {
        $lookup: {
          from: "providers",
          localField: "current_provider",
          foreignField: "_id",
          as: "provider_detail",
        },
      };

      var payment_gateway_query = {
        $lookup: {
          from: "payment_gateways",
          localField: "order_payment_detail.payment_id",
          foreignField: "_id",
          as: "payment_gateway_detail",
        },
      };

      var number_of_rec = SEARCH_SORT.NO_OF_RECORD_PER_PAGE;
      var page = request_data_body.page;

      var sort_field = request_data_body.sort_field;
      var sort_order = request_data_body.sort_order;
      var search_field = request_data_body.search_field;
      var search_value = request_data_body.search_value;

      if (search_field === "user_detail.first_name") {
        search_value = search_value.replace(/^\s+|\s+$/g, "");
        search_value = search_value.replace(/ +(?= )/g, "");
        var query1 = {};
        var query2 = {};
        var query3 = {};
        var query4 = {};
        var query5 = {};
        var query6 = {};
        var full_name = search_value.split(" ");
        if (
          typeof full_name[0] === "undefined" ||
          typeof full_name[1] === "undefined"
        ) {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["user_detail.last_name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          var search = { $match: { $or: [query1, query2] } };
        } else {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["user_detail.last_name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
          query4["user_detail.last_name"] = {
            $regex: new RegExp(full_name[0], "i"),
          };
          query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
          query6["user_detail.last_name"] = {
            $regex: new RegExp(full_name[1], "i"),
          };
          var search = {
            $match: { $or: [query1, query2, query3, query4, query5, query6] },
          };
        }
      } else if (search_field === "provider_detail.first_name") {
        search_value = search_value.replace(/^\s+|\s+$/g, "");
        search_value = search_value.replace(/ +(?= )/g, "");
        var query1 = {};
        var query2 = {};
        var query3 = {};
        var query4 = {};
        var query5 = {};
        var query6 = {};
        var full_name = search_value.split(" ");
        if (
          typeof full_name[0] === "undefined" ||
          typeof full_name[1] === "undefined"
        ) {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["provider_detail.last_name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          var search = { $match: { $or: [query1, query2] } };
        } else {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["provider_detail.last_name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
          query4["provider_detail.last_name"] = {
            $regex: new RegExp(full_name[0], "i"),
          };
          query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
          query6["provider_detail.last_name"] = {
            $regex: new RegExp(full_name[1], "i"),
          };
          var search = {
            $match: { $or: [query1, query2, query3, query4, query5, query6] },
          };
        }
      } else if (search_field === "store_detail.name") {
        search_value = search_value.replace(/^\s+|\s+$/g, "");
        search_value = search_value.replace(/ +(?= )/g, "");
        var query1 = {};
        var query2 = {};
        var query3 = {};
        var query4 = {};
        var query5 = {};
        var query6 = {};
        var full_name = search_value.split(" ");
        if (
          typeof full_name[0] === "undefined" ||
          typeof full_name[1] === "undefined"
        ) {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["store_detail.name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          var search = { $match: { $or: [query1, query2] } };
        } else {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["store_detail.name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
          query4["store_detail.name"] = {
            $regex: new RegExp(full_name[0], "i"),
          };
          query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
          query6["store_detail.name"] = {
            $regex: new RegExp(full_name[1], "i"),
          };
          var search = {
            $match: { $or: [query1, query2, query3, query4, query5, query6] },
          };
        }
      } else if (search_field == "unique_id") {
        var query = {};
        if (search_value !== "") {
          search_value = Number(search_value);
          query[search_field] = search_value;
          var search = { $match: query };
        }
      } else {
        var query = {};
        query[search_field] = { $regex: new RegExp(search_value, "i") };
        var search = { $match: query };
      }

      var sort = { $sort: {} };
      sort["$sort"][sort_field] = parseInt(sort_order);
      var count = {
        $group: { _id: null, total: { $sum: 1 }, data: { $push: "$data" } },
      };
      var skip = {};
      skip["$skip"] = page * number_of_rec - number_of_rec;
      var limit = {};
      limit["$limit"] = number_of_rec;

      //var delivery_status_condition = {"$match": {'delivery_status': {$gte: ORDER_STATE.WAITING_FOR_DELIVERY_MAN}}};
      var delivery_status_manage_id_condition = {
        $match: { delivery_status_manage_id: { $eq: ORDER_STATUS_ID.RUNNING } },
      };

      var group = {
        $group: {
          _id: null,
          data: {
            $push: {
              user_first_name: "$user_detail.first_name",
              user_last_name: "$user_detail.last_name",
              store: "$store_detail.name",
              city: "$city_detail.city_name",

              provider_first_name: "$provider_detail.first_name",
              provider_last_name: "$provider_detail.last_name",
              amount: "$order_payment_detail.total",
              date: "$created_at",
            },
          },
        },
      };
      var project = { $project: { data: 1 } };

      Request.aggregate([
        delivery_status_manage_id_condition,
        user_query,
        orders_array_unwind,
        order_query,
        array_to_json_order_query,
        order_payment_query,
        city_query,
        store_query,
        provider_query,
        array_to_json_user_detail,
        array_to_json_city_query,
        array_to_json_store_detail,
        array_to_json_order_payment_query,
        payment_gateway_query,

        search,
        group,
        project,
      ]).then(
        (requests) => {
          if (requests.length === 0) {
            response_data.json({
              success: false,
              error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
              pages: 0,
            });
          } else {
            var json_data = [];
            if (requests[0].data.length > 0) {
              var request_data = requests[0].data;
              for (var i = 0; i < request_data.length; ) {
                var city = "";
                var provider_first_name = "";
                var provider_last_name = "";
                city = request_data[i].city;

                if (request_data[i].provider_first_name.length > 0) {
                  provider_first_name = request_data[i].provider_first_name[0];
                  provider_last_name = request_data[i].provider_last_name[0];
                }
                json_data.push({
                  User:
                    request_data[i].user_first_name +
                    " " +
                    request_data[i].user_last_name,
                  Store: request_data[i].store,
                  City: city,
                  Provider: provider_first_name + " " + provider_last_name,
                  Amount: request_data[i].amount,
                  Date: request_data[i].date,
                });
                i++;
                if (requests[0].data.length == i) {
                  response_data.json({
                    success: true,
                    message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                    requests: json_data,
                  });
                }
              }
            } else {
              response_data.json({
                success: false,
                error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                pages: 0,
              });
            }
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
