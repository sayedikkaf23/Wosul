require("../utils/message_code");
require("../utils/error_code");
require("../utils/constants");
const { getReportData } = require("../services/report.service");
var console = require("../utils/console");

var Item = require("mongoose").model("item");
var Provider = require("mongoose").model("provider");
var Request = require("mongoose").model("request");
var console = require("../utils/console");
var Order = require("mongoose").model("order");
var utils = require("../utils/utils");

// All Items
exports.report_items = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      var number_of_rec = 10; //SEARCH_SORT.NO_OF_RECORD_PER_PAGE;
      var page = request_data_body.page;
      var search_field = request_data_body.search_field;
      var search_value = request_data_body.search_value;
      var sort = { $sort: {} };
      sort["$sort"]["unique_id"] = parseInt(-1);
      var count = {
        $group: { _id: null, total: { $sum: 1 }, data: { $push: "$data" } },
      };
      var skip = {};
      skip["$skip"] = page * number_of_rec - number_of_rec;
      var limit = {};
      limit["$limit"] = number_of_rec;

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
      var product_query = {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "product_detail",
        },
      };
      var array_to_json_product_detail = {
        $unwind: {
          path: "$product_detail",
          preserveNullAndEmptyArrays: true,
        },
      };
      var category_query = {
        $lookup: {
          from: "categories",
          localField: "product_detail.category_id",
          foreignField: "_id",
          as: "category_detail",
        },
      };
      var array_to_json_category_detail = {
        $unwind: {
          path: "$category_detail",
          preserveNullAndEmptyArrays: true,
        },
      };

      if (search_field === "name") {
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
          query2["name"] = { $regex: new RegExp(search_value, "i") };
          var search = { $match: { $or: [query1, query2] } };
        } else {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["name"] = { $regex: new RegExp(search_value, "i") };
          query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
          query4["name"] = { $regex: new RegExp(full_name[0], "i") };
          query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
          query6["name"] = { $regex: new RegExp(full_name[1], "i") };
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
      } else if (search_field === "category_detail.name") {
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
          query2["category_detail.name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          var search = { $match: { $or: [query1, query2] } };
        } else {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["category_detail.name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
          query4["category_detail.name"] = {
            $regex: new RegExp(full_name[0], "i"),
          };
          query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
          query6["category_detail.name"] = {
            $regex: new RegExp(full_name[1], "i"),
          };
          var search = {
            $match: { $or: [query1, query2, query3, query4, query5, query6] },
          };
        }
      } else if (search_field === "product_detail.name") {
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
          query2["product_detail.name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          var search = { $match: { $or: [query1, query2] } };
        } else {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["product_detail.name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
          query4["product_detail.name"] = {
            $regex: new RegExp(full_name[0], "i"),
          };
          query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
          query6["product_detail.name"] = {
            $regex: new RegExp(full_name[1], "i"),
          };
          var search = {
            $match: { $or: [query1, query2, query3, query4, query5, query6] },
          };
        }
      }

      Item.aggregate([
        store_query,
        array_to_json_store_detail,
        product_query,
        array_to_json_product_detail,
        category_query,
        array_to_json_category_detail,
        // search,
      ]).then(
        (items) => {
          if (items.length === 0) {
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
            var pages = Math.ceil(items.length / number_of_rec);
            if (page) {
              Item.aggregate([
                store_query,
                array_to_json_store_detail,
                product_query,
                array_to_json_product_detail,
                category_query,
                array_to_json_category_detail,
                search,
                skip,
                limit,
              ]).then(
                (items) => {
                  if (items.length == 0) {
                    response_data.json({
                      success: false,
                      error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                    });
                  } else {
                    response_data.json({
                      success: true,
                      message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                      pages: pages,
                      items: items,
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
              Item.aggregate([
                store_query,
                array_to_json_store_detail,
                product_query,
                array_to_json_product_detail,
                category_query,
                array_to_json_category_detail,
                search,
              ]).then(
                (items) => {
                  if (items.length == 0) {
                    response_data.json({
                      success: false,
                      error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                    });
                  } else {
                    response_data.json({
                      success: true,
                      message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                      pages: pages,
                      items: items,
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

// OutOfStock Items
exports.outofstock_items = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      var number_of_rec = 10; //SEARCH_SORT.NO_OF_RECORD_PER_PAGE;
      var page = request_data_body.page;
      var search_field = request_data_body.search_field;
      var search_value = request_data_body.search_value;
      var sort = { $sort: {} };
      sort["$sort"]["unique_id"] = parseInt(-1);
      var count = {
        $group: { _id: null, total: { $sum: 1 }, data: { $push: "$data" } },
      };
      var skip = {};
      skip["$skip"] = page * number_of_rec - number_of_rec;
      var limit = {};
      limit["$limit"] = number_of_rec;

      var order_condition = { $match: { is_item_in_stock: { $eq: false } } };

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
      var product_query = {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "product_detail",
        },
      };
      var array_to_json_product_detail = {
        $unwind: {
          path: "$product_detail",
          preserveNullAndEmptyArrays: true,
        },
      };
      var category_query = {
        $lookup: {
          from: "categories",
          localField: "product_detail.category_id",
          foreignField: "_id",
          as: "category_detail",
        },
      };
      var array_to_json_category_detail = {
        $unwind: {
          path: "$category_detail",
          preserveNullAndEmptyArrays: true,
        },
      };

      if (search_field === "name") {
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
          query2["name"] = { $regex: new RegExp(search_value, "i") };
          var search = { $match: { $or: [query1, query2] } };
        } else {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["name"] = { $regex: new RegExp(search_value, "i") };
          query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
          query4["name"] = { $regex: new RegExp(full_name[0], "i") };
          query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
          query6["name"] = { $regex: new RegExp(full_name[1], "i") };
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
      } else if (search_field === "category_detail.name") {
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
          query2["category_detail.name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          var search = { $match: { $or: [query1, query2] } };
        } else {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["category_detail.name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
          query4["category_detail.name"] = {
            $regex: new RegExp(full_name[0], "i"),
          };
          query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
          query6["category_detail.name"] = {
            $regex: new RegExp(full_name[1], "i"),
          };
          var search = {
            $match: { $or: [query1, query2, query3, query4, query5, query6] },
          };
        }
      } else if (search_field === "product_detail.name") {
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
          query2["product_detail.name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          var search = { $match: { $or: [query1, query2] } };
        } else {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["product_detail.name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
          query4["product_detail.name"] = {
            $regex: new RegExp(full_name[0], "i"),
          };
          query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
          query6["product_detail.name"] = {
            $regex: new RegExp(full_name[1], "i"),
          };
          var search = {
            $match: { $or: [query1, query2, query3, query4, query5, query6] },
          };
        }
      }

      Item.aggregate([
        order_condition,
        store_query,
        array_to_json_store_detail,
        product_query,
        array_to_json_product_detail,
        category_query,
        array_to_json_category_detail,
        search,
      ]).then(
        (items) => {
          if (items.length === 0) {
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
            var pages = Math.ceil(items.length / number_of_rec);
            if (page) {
              Item.aggregate([
                order_condition,
                store_query,
                array_to_json_store_detail,
                product_query,
                array_to_json_product_detail,
                category_query,
                array_to_json_category_detail,
                search,
                skip,
                limit,
              ]).then(
                (items) => {
                  if (items.length == 0) {
                    response_data.json({
                      success: false,
                      error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                    });
                  } else {
                    response_data.json({
                      success: true,
                      message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                      pages: pages,
                      items: items,
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
              Item.aggregate([
                order_condition,
                store_query,
                array_to_json_store_detail,
                product_query,
                array_to_json_product_detail,
                category_query,
                array_to_json_category_detail,
                search,
              ]).then(
                (items) => {
                  if (items.length == 0) {
                    response_data.json({
                      success: false,
                      error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                    });
                  } else {
                    response_data.json({
                      success: true,
                      message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                      pages: pages,
                      items: items,
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

// Hidden Items
exports.hidden_items = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      var number_of_rec = SEARCH_SORT.NO_OF_RECORD_PER_PAGE;
      var page = request_data_body.page;
      var search_field = request_data_body.search_field;
      var search_value = request_data_body.search_value;

      var sort = { $sort: {} };
      sort["$sort"]["unique_id"] = parseInt(-1);
      var count = {
        $group: { _id: null, total: { $sum: 1 }, data: { $push: "$data" } },
      };
      var skip = {};
      skip["$skip"] = page * number_of_rec - number_of_rec;
      var limit = {};
      limit["$limit"] = number_of_rec;

      var order_condition = { $match: { is_visible_in_store: { $eq: false } } };

      if (search_field === "name") {
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
          query2["name"] = { $regex: new RegExp(search_value, "i") };
          var search = { $match: { $or: [query1, query2] } };
        } else {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["name"] = { $regex: new RegExp(search_value, "i") };
          query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
          query4["name"] = { $regex: new RegExp(full_name[0], "i") };
          query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
          query6["name"] = { $regex: new RegExp(full_name[1], "i") };
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
      } else if (search_field === "category_detail.name") {
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
          query2["category_detail.name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          var search = { $match: { $or: [query1, query2] } };
        } else {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["category_detail.name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
          query4["category_detail.name"] = {
            $regex: new RegExp(full_name[0], "i"),
          };
          query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
          query6["category_detail.name"] = {
            $regex: new RegExp(full_name[1], "i"),
          };
          var search = {
            $match: { $or: [query1, query2, query3, query4, query5, query6] },
          };
        }
      } else if (search_field === "product_detail.name") {
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
          query2["product_detail.name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          var search = { $match: { $or: [query1, query2] } };
        } else {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["product_detail.name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
          query4["product_detail.name"] = {
            $regex: new RegExp(full_name[0], "i"),
          };
          query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
          query6["product_detail.name"] = {
            $regex: new RegExp(full_name[1], "i"),
          };
          var search = {
            $match: { $or: [query1, query2, query3, query4, query5, query6] },
          };
        }
      }

      Item.aggregate([order_condition, search]).then(
        (items) => {
          if (items.length === 0) {
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
            var pages = Math.ceil(items[0].total / number_of_rec);
            if (page) {
              Item.aggregate([order_condition, search, skip, limit]).then(
                (items) => {
                  if (items.length == 0) {
                    response_data.json({
                      success: false,
                      error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                    });
                  } else {
                    response_data.json({
                      success: true,
                      message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                      pages: pages,
                      items: items,
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
              Item.aggregate([order_condition, search, count]).then(
                (items) => {
                  if (items.length == 0) {
                    response_data.json({
                      success: false,
                      error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                    });
                  } else {
                    response_data.json({
                      success: true,
                      message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                      pages: pages,
                      items: items,
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

exports.reports = async (req, res, next) => {
  try {
    res.json({
      success: true,
      type: req.body.type,
      data: await getReportData(req.body),
    });
  } catch (error) {
    res.json({
      success: false,
      type: req.body.type,
      message: error.message,
    });
  }
};
