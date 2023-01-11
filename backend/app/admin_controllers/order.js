require("../utils/message_code");
require("../utils/error_code");
require("../utils/constants");
var console = require("../utils/console");

var Order = require("mongoose").model("order");
var Store = require("mongoose").model("store");
var Provider = require("mongoose").model("provider");
var Request = require("mongoose").model("request");
var console = require("../utils/console");
var mongoose = require("mongoose");
var utils = require("../utils/utils");
const order_details = require("../models/user/order");
const admin = require("../models/admin/admin");
const vehicle = require("../models/admin/vehicle");
const delivery_boy = require("../models/admin/delivery_boy");

// Today orders order_lists_search_sort
exports.order_lists_search_sort = function (request_data, response_data) {
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
      sort["$sort"]["unique_id"] = parseInt(-1);
      var count = {
        $group: { _id: null, total: { $sum: 1 }, data: { $push: "$data" } },
      };
      var skip = {};
      skip["$skip"] = page * number_of_rec - number_of_rec;
      var limit = {};
      limit["$limit"] = number_of_rec;

      var condition = { $match: {} };
      var date = new Date(Date.now()).toLocaleString("en-US", {
        timeZone: setting_detail.admin_panel_timezone,
      });
      date = new Date(date);
      date = date.setHours(0, 0, 0, 0);
      startdate = new Date(date);
      enddate = new Date(Date.now()).toLocaleString("en-US", {
        timeZone: setting_detail.admin_panel_timezone,
      });

      enddate = new Date(enddate);
      condition = { $match: { created_at: { $gte: startdate, $lt: enddate } } };

      Order.aggregate([
        condition,
        user_query,
        order_payment_query,
        store_query,
        city_query,
        array_to_json_user_detail,
        array_to_json_store_detail,
        array_to_json_city_query,
        array_to_json_order_payment_query,
        payment_gateway_query,
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
            var timezone = "";
            if (setting_detail) {
              timezone = setting_detail.admin_panel_timezone;
            }
            var pages = Math.ceil(orders[0].total / number_of_rec);
            if (page) {
              Order.aggregate([
                condition,
                user_query,
                order_payment_query,
                store_query,
                city_query,
                array_to_json_user_detail,
                array_to_json_store_detail,
                array_to_json_city_query,
                array_to_json_order_payment_query,
                payment_gateway_query,
                sort,
                search,
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
            } else {
              Order.aggregate([
                condition,
                user_query,
                order_payment_query,
                store_query,
                city_query,
                array_to_json_user_detail,
                array_to_json_store_detail,
                array_to_json_city_query,
                array_to_json_order_payment_query,
                payment_gateway_query,
                sort,
                search,
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
  });
};

// admin_orders
exports.admin_orders = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], async function (response) {
    if (response.success) {
      console.log("admin/orders_list >>>>" + JSON.stringify(request_data.body));
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
      var payment_gateway_query = {
        $lookup: {
          from: "payment_gateways",
          localField: "order_payment_detail.payment_id",
          foreignField: "_id",
          as: "payment_gateway_detail",
        },
      };

      const vehicles = await vehicle.find({ is_business: true }).lean();;

      var number_of_rec = SEARCH_SORT.NO_OF_RECORD_PER_PAGE;
      var page = request_data_body.page;

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
      sort["$sort"]["unique_id"] = parseInt(-1);
      var count = {
        $group: { _id: null, total: { $sum: 1 }, data: { $push: "$data" } },
      };
      var skip = {};
      skip["$skip"] = page * number_of_rec - number_of_rec;
      var limit = {};
      limit["$limit"] = number_of_rec;

      // var order_condition = {$match: {$and: [ {$or: [ {'order_status_id': {$eq: ORDER_STATUS_ID.RUNNING}} , {'order_status_id': {$eq: ORDER_STATUS_ID.IDEAL}} ]} ,{'order_status_manage_id': {$ne: ORDER_STATUS_ID.COMPLETED}} ]}};
      var order_condition = {
        $match: {
          $and: [
            {
              $or: [
                { order_status_id: { $eq: ORDER_STATUS_ID.RUNNING } },
                { order_status_id: { $eq: ORDER_STATUS_ID.IDEAL } },
              ],
            },
            {
              $or: [
                { order_status_manage_id: { $ne: ORDER_STATUS_ID.COMPLETED } },
                { request_id: { $eq: null } },
              ],
            },
            {
              order_status: { $ne: ORDER_STATE.ORDER_DELETED },
            },
          ],
        },
      };

      var request_status_condition = { $match: {} };
      if (request_data_body.order_status != "all") {
        request_status_condition = {
          $match: {
            order_status: { $eq: Number(request_data_body.order_status) },
          },
        };
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

      var pickup_type = request_data_body.pickup_type;
      var pickup_type_condition = { $match: {} };
      if (pickup_type != "both") {
        if (request_data_body.pickup_type == "true") {
          payment_status_condition = {
            $match: {
              "order_payment_detail.is_user_pick_up_order": { $eq: true },
            },
          };
        } else {
          payment_status_condition = {
            $match: {
              "order_payment_detail.is_user_pick_up_order": { $eq: false },
            },
          };
        }
      }

      var created_by = request_data_body.created_by;
      var created_by_condition = { $match: {} };
      if (created_by != "both") {
        created_by_condition = {
          $match: { order_type: { $eq: Number(created_by) } },
        };
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

      let promo_query = {
        $lookup: {
          from: "promo_codes",
          localField: "order_payment_detail.promo_id",
          foreignField: "_id",
          as: "promo_code_detail",
        },
      };
      let array_to_json_promo_detail = {
        $unwind: {
          path: "$promo_code_detail",
          preserveNullAndEmptyArrays: true,
        },
      };

      Order.aggregate([
        admin_type_condition,
        order_condition,
        created_by_condition,
        order_type_condition,
        user_query,
        request_status_condition,
        order_payment_query,
        store_query,
        cart_query,
        array_to_json_cart_query,
        city_query,
        promo_query,
        array_to_json_promo_detail,
        array_to_json_user_detail,
        array_to_json_store_detail,
        array_to_json_city_query,
        array_to_json_order_payment_query,
        payment_status_condition,
        pickup_type_condition,
        payment_gateway_query,
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
            var timezone = "";
            if (setting_detail) {
              timezone = setting_detail.admin_panel_timezone;
            }
            var pages = Math.ceil(orders[0].total / number_of_rec);
            if (page) {
              Order.aggregate([
                admin_type_condition,
                order_condition,
                created_by_condition,
                order_type_condition,
                user_query,
                request_status_condition,
                order_payment_query,
                promo_query,
                array_to_json_promo_detail,
                store_query,
                city_query,
                cart_query,
                array_to_json_cart_query,
                array_to_json_user_detail,
                array_to_json_store_detail,
                array_to_json_city_query,
                array_to_json_order_payment_query,
                payment_status_condition,
                pickup_type_condition,
                payment_gateway_query,
                sort,
                search,
                skip,
                limit,
              ]).then(
                (orders) => {
                  if (orders.length == 0) {
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
                    response_data.json({
                      success: true,
                      message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                      pages: pages,
                      orders: orders,
                      timezone: timezone,
                      vehicles:vehicles
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
              Order.aggregate([
                admin_type_condition,
                order_condition,
                created_by_condition,
                order_type_condition,
                request_status_condition,
                user_query,
                order_payment_query,
                store_query,
                city_query,
                cart_query,
                array_to_json_cart_query,
                {
                  $lookup: {
                    from: "promo_codes",
                    localField: "order_payment_detail.promo_id",
                    foreignField: "_id",
                    as: "promo_code_detail",
                  },
                },
                {
                  $unwind: {
                    path: "$promo_code_detail",
                    preserveNullAndEmptyArrays: true,
                  },
                },
                array_to_json_user_detail,
                array_to_json_store_detail,
                array_to_json_city_query,
                array_to_json_order_payment_query,
                payment_status_condition,
                pickup_type_condition,
                payment_gateway_query,
                sort,
                search,
              ]).then(
                (orders) => {
                  if (orders.length == 0) {
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
                    response_data.json({
                      success: true,
                      message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                      pages: pages,
                      orders: orders,
                      timezone: timezone,
                      vehicles:vehicles
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
  });
};

// deliveryman_track
exports.deliveryman_track = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var id = request_data_body.id;
        var type = Number(request_data_body.type);
        if (type == 1) {
          Order.findOne({ _id: id }).then(
            (order_detail) => {
              if (order_detail) {
                Request.findOne({ _id: order_detail.request_id }).then(
                  (request) => {
                    if (request) {
                      console.log(order_detail.request_id);
                      Provider.findOne({ _id: request.current_provider }).then(
                        (provider_detail) => {
                          if (provider_detail) {
                            response_data.json({
                              success: true,
                              message:
                                ORDER_MESSAGE_CODE.ORDER_CANCEL_OR_REJECT_BY_PROVIDER_SUCCESSFULLY,
                              provider: provider_detail,
                            });
                          } else {
                            response_data.json({
                              success: false,
                              message:
                                ORDER_MESSAGE_CODE.ORDER_CANCEL_OR_REJECT_BY_PROVIDER_SUCCESSFULLY,
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
                      response_data.json({
                        success: false,
                        message:
                          ORDER_MESSAGE_CODE.ORDER_CANCEL_OR_REJECT_BY_PROVIDER_SUCCESSFULLY,
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
                response_data.json({
                  success: false,
                  message:
                    ORDER_MESSAGE_CODE.ORDER_CANCEL_OR_REJECT_BY_PROVIDER_SUCCESSFULLY,
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
          Provider.findOne({ _id: id }).then(
            (provider_detail) => {
              console.log("pass provider_id provider_detail");
              response_data.json({
                success: true,
                message:
                  ORDER_MESSAGE_CODE.ORDER_CANCEL_OR_REJECT_BY_PROVIDER_SUCCESSFULLY,
                provider: provider_detail,
              });
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

// order_list_location_track
exports.order_list_location_track = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      Order.find({
        city_id: request_data_body.city_id,
        order_status_id: ORDER_STATUS_ID.RUNNING,
      }).then(
        (orders) => {
          if (orders.length == 0) {
            response_data.json({
              success: false,
              message:
                ORDER_MESSAGE_CODE.ORDER_CANCEL_OR_REJECT_BY_PROVIDER_SUCCESSFULLY,
            });
          } else {
            response_data.json({
              success: true,
              message:
                ORDER_MESSAGE_CODE.ORDER_CANCEL_OR_REJECT_BY_PROVIDER_SUCCESSFULLY,
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
    } else {
      response_data.json(response);
    }
  });
};

////////////
// orders_list_export_excel
exports.orders_list_export_excel = function (request_data, response_data) {
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

      var order_condition = {
        $match: { order_status_id: { $ne: ORDER_STATUS_ID.COMPLETED } },
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
              amount: "$order_payment_detail.total",
              payment_status: "$order_payment_detail.is_payment_mode_cash",
              date: "$created_at",
            },
          },
        },
      };
      var project = { $project: { data: 1 } };

      Order.aggregate([
        order_condition,
        user_query,
        order_payment_query,
        store_query,
        city_query,
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
                city = order_data[i].city;

                json_data.push({
                  User:
                    order_data[i].user_first_name +
                    " " +
                    order_data[i].user_last_name,
                  Store: order_data[i].store,
                  City: city,
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

//for admin notes
exports.add_notes = async function (req, res) {
  try {
    const {
      _id,
      admin_notes,
      server_token,
    } = req.body;
    const check_user = await admin.findOne({ server_token });
    if (!check_user) {
      res.json({
        success: false,
      });
      return;
    } else {
      const order_list = await order_details.findOneAndUpdate({"_id":_id},{
        "$push": {"admin_notes": admin_notes}
    },{new: true, safe: true, upsert: true }).then((result) => {
        return res.status(201).json({
            success: true,
            message: "Notes Are Added Successfully",
            data: result
        });
    }).catch((error) => {
        return res.status(500).json({
            success: false,
            message: "Something Went Wrong",
            data: error
        });
    });
    }
  } catch (error) {
    res.statusCode = 500;
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//for delivery boy
exports.add_delivery_boy = async function (req, res) {
  try {
    const {
      name,
      phone,
    } = req.body;
      let delivery_boy_details = { name, phone};
      const add_delivery_boy = await delivery_boy.create(delivery_boy_details);
      if (add_delivery_boy) {
        res.json({
          success: true,
          add_delivery_boy,
          message: "Added Successfully",
        });
        return;
      } else {
        res.json({
          success: false,
          message: "Something Went Wrong",
        });
        return;
      }
    } catch (error) {
    res.statusCode = 500;
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//for get delivery boy list
exports.get_delivery_boys = async function (req, res) {
  try {
    const delivery_boys = await delivery_boy.find();
    if (delivery_boys) {
      res.json({
        success: true,
        delivery_boys,
      });
      return;
    } else {
      res.json({
        success: false,
      });
      return;
    }
  } catch (error) {
    res.statusCode = 500;
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//for update delivery boy
exports.update_delivery_boy = async function (req, res) {
  try {
    const {
      delivery_boy_name,
      _id,
    } = req.body;
    let orderDetails = { delivery_boy_name };
    const order = await order_details.findByIdAndUpdate(_id, {
      $set: orderDetails,
    });
    if (order) {
      res.json({
        status: true,
        message:"Updated Successfully"
      });
      return;
    } else {
      res.json({
        status: false,
        message:"Something Went Wrong"
      });
      return;
    }
  } catch (error) {
    res.statusCode = 500;
    res.json({
      status: false,
      message: error.message,
    });
  }
};


