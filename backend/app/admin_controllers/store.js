require("../utils/message_code");
require("../utils/error_code");
require("../utils/constants");
require("../utils/push_code");
var utils = require("../utils/utils");
var emails = require("../controllers/email_sms/emails");
var SMS = require("../controllers/email_sms/sms");
var Setting = require("mongoose").model("setting");
var Email = require("mongoose").model("email_detail");
var Store = require("mongoose").model("store");
var Order = require("mongoose").model("order");
var mongoose = require("mongoose");
var Product = require("mongoose").model("product");
var City = require("mongoose").model("city");
var Item = require("mongoose").model("item");
var Review = require("mongoose").model("review");
var console = require("../utils/console");
const storeDetails = require("../models/admin/store_details");

// store_list_search_sort
exports.get_store_items = function (request_data, response_data) {
  Item.find({ store_id: request_data.body.store_id }, function (err, items) {
    response_data.json({ success: true, items: items });
  });
};
exports.store_list_search_sort = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      var city_query = {
        $lookup: {
          from: "cities",
          localField: "city_id",
          foreignField: "_id",
          as: "city_details",
        },
      };
      var array_to_json_city_query = { $unwind: "$city_details" };

      var country_query = {
        $lookup: {
          from: "countries",
          localField: "country_id",
          foreignField: "_id",
          as: "country_details",
        },
      };
      var array_to_json = { $unwind: "$country_details" };

      var delivery_query = {
        $lookup: {
          from: "deliveries",
          localField: "store_delivery_id",
          foreignField: "_id",
          as: "delivery_details",
        },
      };
      var array_to_json_delivery_query = { $unwind: "$delivery_details" };

      var number_of_rec = Number(request_data_body.number_of_rec);
      var page = request_data_body.page;
      var sort_field = request_data_body.sort_field;
      var sort_store = request_data_body.sort_store;
      var search_field = request_data_body.search_field;
      var search_value = request_data_body.search_value;
      search_value = search_value.replace(/^\s+|\s+$/g, "");
      search_value = search_value.replace(/ +(?= )/g, "");
      var store_page_type = request_data_body.store_page_type;

      if (search_field === "name") {
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
          query2["city_details.city_name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          var search = { $match: { $or: [query1, query2] } };
        } else {
          query1[search_field] = { $regex: new RegExp(search_value, "i") };
          query2["city_details.city_name"] = {
            $regex: new RegExp(search_value, "i"),
          };
          query3[search_field] = { $regex: new RegExp(full_name[0], "i") };
          query4["city_details.city_name"] = {
            $regex: new RegExp(full_name[0], "i"),
          };
          query5[search_field] = { $regex: new RegExp(full_name[1], "i") };
          query6["city_details.city_name"] = {
            $regex: new RegExp(full_name[1], "i"),
          };
          var search = {
            $match: { $or: [query1, query2, query3, query4, query5, query6] },
          };
        }
      } else if (search_field == "unique_id") {
        var query = {};
        query[search_field] = { $eq: Number(search_value) };
        var search = { $match: query };
      } else {
        var query = {};
        query[search_field] = { $regex: new RegExp(search_value, "i") };
        var search = { $match: query };
      }

      var sort = { $sort: {} };
      sort["$sort"][sort_field] = parseInt(sort_store);
      var count = {
        $group: { _id: null, total: { $sum: 1 }, data: { $push: "$data" } },
      };
      var skip = {};
      skip["$skip"] = page * number_of_rec - number_of_rec;
      var limit = {};
      limit["$limit"] = number_of_rec;

      var condition = { $match: {} };
      if (store_page_type == 1) {
        condition = {
          $match: { is_approved: { $eq: true }, is_business: { $eq: true } },
        };
      } else if (store_page_type == 2) {
        condition = { $match: { is_approved: { $eq: false } } };
      } else if (store_page_type == 3) {
        condition = {
          $match: { is_business: { $eq: false }, is_approved: { $eq: true } },
        };
      }

      Store.aggregate([
        condition,
        city_query,
        country_query,
        array_to_json,
        array_to_json_city_query,
        delivery_query,
        array_to_json_delivery_query,
        search,
        count,
      ]).then(
        (stores) => {
          if (stores.length === 0) {
            response_data.json({
              success: false,
              error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND,
              pages: 0,
            });
          } else {
            var pages = Math.ceil(stores[0].total / number_of_rec);

            if (page) {
              Store.aggregate([
                condition,
                city_query,
                country_query,
                array_to_json,
                array_to_json_city_query,
                delivery_query,
                array_to_json_delivery_query,
                sort,
                search,
                skip,
                limit,
              ]).then(
                (stores) => {
                  if (stores.length == 0) {
                    response_data.json({
                      success: false,
                      error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND,
                    });
                  } else {
                    response_data.json({
                      success: true,
                      message: STORE_MESSAGE_CODE.STORE_LIST_SUCCESSFULLY,
                      pages: pages,
                      stores: stores,
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
              Store.aggregate([
                condition,
                city_query,
                country_query,
                array_to_json,
                array_to_json_city_query,
                delivery_query,
                array_to_json_delivery_query,
                sort,
                search,
              ]).then(
                (stores) => {
                  if (stores.length == 0) {
                    response_data.json({
                      success: false,
                      error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND,
                    });
                  } else {
                    response_data.json({
                      success: true,
                      message: STORE_MESSAGE_CODE.STORE_LIST_SUCCESSFULLY,
                      pages: pages,
                      stores: stores,
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

exports.get_store_data = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "store_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var country_query = {
          $lookup: {
            from: "countries",
            localField: "country_id",
            foreignField: "_id",
            as: "country_details",
          },
        };

        var array_to_json = { $unwind: "$country_details" };

        var city_query = {
          $lookup: {
            from: "cities",
            localField: "city_id",
            foreignField: "_id",
            as: "city_details",
          },
        };

        var array_to_json1 = { $unwind: "$city_details" };

        var delivery_query = {
          $lookup: {
            from: "deliveries",
            localField: "store_delivery_id",
            foreignField: "_id",
            as: "delivery_details",
          },
        };

        var referred_query = {
          $lookup: {
            from: "stores",
            localField: "referred_by",
            foreignField: "_id",
            as: "referred_store_details",
          },
        };

        var array_to_json2 = { $unwind: "$delivery_details" };

        var condition = {
          $match: {
            _id: { $eq: mongoose.Types.ObjectId(request_data_body.store_id) },
          },
        };

        Store.aggregate([
          condition,
          country_query,
          city_query,
          delivery_query,
          referred_query,
          array_to_json,
          array_to_json1,
          array_to_json2,
        ]).then(
          (store_detail) => {
            if (store_detail.length != 0) {
              var store_condition = {
                $match: {
                  store_id: {
                    $eq: mongoose.Types.ObjectId(request_data_body.store_id),
                  },
                },
              };
              var group = {
                $group: {
                  _id: null,
                  total_orders: { $sum: 1 },
                  accepted_orders: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            {
                              $gte: [
                                "$order_status",
                                ORDER_STATE.STORE_ACCEPTED,
                              ],
                            },
                            {
                              $gte: [
                                "$order_status",
                                ORDER_STATE.STORE_ACCEPTED,
                              ],
                            },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  completed_orders: {
                    $sum: {
                      $cond: [
                        {
                          $eq: ["$order_status_id", ORDER_STATUS_ID.COMPLETED],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  cancelled_orders: {
                    $sum: {
                      $cond: [
                        {
                          $eq: ["$order_status_id", ORDER_STATUS_ID.CANCELLED],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                },
              };
              Order.aggregate([store_condition, group]).then(
                (order_detail) => {
                  if (order_detail.length == 0) {
                    response_data.json({
                      success: true,
                      message: STORE_MESSAGE_CODE.STORE_DATA_SUCCESSFULLY,
                      store_detail: store_detail[0],
                      order_detail: {
                        total_orders: 0,
                        accepted_orders: 0,
                        completed_orders: 0,
                        cancelled_orders: 0,
                        completed_order_percentage: 0,
                      },
                    });
                  } else {
                    var completed_order_percentage =
                      (order_detail[0].completed_orders * 100) /
                      order_detail[0].total_orders;
                    order_detail[0].completed_order_percentage =
                      completed_order_percentage;

                    response_data.json({
                      success: true,
                      message: STORE_MESSAGE_CODE.STORE_DATA_SUCCESSFULLY,
                      store_detail: store_detail[0],
                      order_detail: order_detail[0],
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
                error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND,
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

//// store update
exports.store_image_upload = async function (req, res) {
  const { store_id, deleted_image } = req.body;
  const store = await Store.findOne({ _id: store_id });
  if (!store) {
    res.json({
      success: false,
    });
    return;
  }
  var image_file = req.files;
  if (deleted_image !== undefined) {
    let urlArry = JSON.parse(deleted_image);
    urlArry.forEach((url) => {
      utils.deleteImageFromFolder(url, FOLDER_NAME.STORE_PROFILES);
      store.images = store.images.filter((img) => img != url);
    });
  }
  if (image_file != undefined && image_file.length > 0) {
    // store.images = []
    file_list_size = image_file.length;
    for (i = 0; i < file_list_size; i++) {
      var image_name = store._id + utils.generateServerToken(4);
      let ext = image_file[i].originalname.split(".");
      ext = ext[ext.length - 1];
      var url =
        utils.getStoreImageFolderPath(FOLDER_NAME.STORE_PROFILES) +
        image_name +
        "." +
        ext;
      utils.storeImageToFolder(
        image_file[0].path,
        image_name + "." + ext,
        FOLDER_NAME.STORE_PROFILES
      );
      store.images.push(url);
    }
    store.save();
    res.json({
      success: true,
      store: store,
    });
  } else {
    res.json({
      success: false,
    });
  }
};

exports.update_store = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "store_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        console.log(request_data_body);
        var store_id = request_data_body.store_id;
        var is_approved = request_data_body.is_approved;

        Store.find({
          _id: { $ne: store_id },
          phone: request_data_body.phone,
        }).then(
          (store_detail) => {
            if (store_detail.length > 0) {
              response_data.json({
                success: false,
                error_code: STORE_ERROR_CODE.PHONE_NUMBER_ALREADY_REGISTRED,
              });
            } else {
              if (request_data_body.tags != "undefined") {
                request_data_body.tags = JSON.parse(request_data_body.tags);
              }
              if (request_data_body.sub_stores != "undefined") {
                request_data_body.sub_stores = JSON.parse(
                  request_data_body.sub_stores
                );
              }
              Store.findOneAndUpdate({ _id: store_id }, request_data_body, {
                new: true,
              }).then(
                (store_data) => {
                  if (store_data) {
                    var device_type = store_data.device_type;
                    var device_token = store_data.device_token;

                    var image_file = request_data.files;
                    console.log("image_file.length  :>> " + image_file.length);
                    if (image_file != undefined && image_file.length > 0) {
                      let durl;
                      if (
                        request_data_body.img_2 !== undefined &&
                        request_data_body.img_2 == "true"
                      ) {
                        durl = store_data.image_url_2;
                      } else {
                        durl = store_data.image_url;
                      }
                      utils.deleteImageFromFolder(
                        durl,
                        FOLDER_NAME.STORE_PROFILES
                      );
                      var image_name =
                        store_data._id + utils.generateServerToken(4);
                      var url =
                        utils.getStoreImageFolderPath(
                          FOLDER_NAME.STORE_PROFILES
                        ) +
                        image_name +
                        FILE_EXTENSION.STORE;
                      utils.storeImageToFolder(
                        image_file[0].path,
                        image_name + FILE_EXTENSION.STORE,
                        FOLDER_NAME.STORE_PROFILES
                      );
                      console.log(
                        "request_data_body.img2 :>> " + request_data_body.img_2
                      );
                      if (
                        request_data_body.img_2 !== undefined &&
                        request_data_body.img_2 == "true"
                      ) {
                        store_data.image_url_2 = url;
                      } else {
                        store_data.image_url = url;
                      }
                    }

                    if (request_data_body.name != undefined) {
                      var name = request_data_body.name.trim();
                      name = name.charAt(0).toUpperCase() + name.slice(1);
                      store_data.name = name;
                    }
                    store_data.save();

                    response_data.json({
                      success: true,
                      message: STORE_MESSAGE_CODE.UPDATE_SUCCESSFULLY,
                      store: store_data,
                    });
                  } else {
                    response_data.json({
                      success: false,
                      error_code: STORE_ERROR_CODE.UPDATE_FAILED,
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

//approve_decline_store
exports.approve_decline_store = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "store_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var store_id = request_data_body.store_id;
        var is_approved = request_data_body.is_approved;
        var store_page_type = request_data_body.store_page_type;

        if (store_page_type == 2) {
          Store.findOneAndUpdate(
            { _id: store_id },
            { is_approved: true },
            { new: true }
          ).then(
            (stores) => {
              if (!stores) {
                response_data.json({
                  success: false,
                  error_code: PROVIDER_ERROR_CODE.UPDATE_FAILED,
                });
              } else {
                var phone_with_code = stores.country_phone_code + stores.phone;
                var device_type = stores.device_type;
                var device_token = stores.device_token;

                // email to store approved
                if (setting_detail.is_mail_notification) {
                  emails.sendStoreApprovedEmail(
                    request_data,
                    stores,
                    stores.name
                  );
                }

                // sms to store approved
                if (setting_detail.is_sms_notification) {
                  SMS.sendOtherSMS(
                    phone_with_code,
                    SMS_UNIQUE_ID.STORE_APPROVED,
                    ""
                  );
                }

                // push to store approved
                if (setting_detail.is_push_notification) {
                  utils.sendPushNotification(
                    ADMIN_DATA_ID.STORE,
                    device_type,
                    device_token,
                    STORE_PUSH_CODE.APPROVED,
                    PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS
                  );
                }

                response_data.json({
                  success: true,
                  message: STORE_MESSAGE_CODE.APPROVED_SUCCESSFULLY,
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
        } else if (store_page_type == 1 || store_page_type == 3) {
          Store.findOneAndUpdate(
            { _id: store_id },
            { is_approved: false },
            { new: true }
          ).then(
            (stores) => {
              if (!stores) {
                response_data.json({
                  success: false,
                  error_code: PROVIDER_ERROR_CODE.UPDATE_FAILED,
                });
              } else {
                var phone_with_code = stores.country_phone_code + stores.phone;
                var device_type = stores.device_type;
                var device_token = stores.device_token;

                // email to store declined
                if (setting_detail.is_mail_notification) {
                  emails.sendStoreDeclineEmail(
                    request_data,
                    stores,
                    stores.name
                  );
                }
                // sms to store declined
                if (setting_detail.is_sms_notification) {
                  SMS.sendOtherSMS(
                    phone_with_code,
                    SMS_UNIQUE_ID.STORE_DECLINE,
                    ""
                  );
                }

                // push to store approved
                if (setting_detail.is_push_notification) {
                  utils.sendPushNotification(
                    ADMIN_DATA_ID.STORE,
                    device_type,
                    device_token,
                    STORE_PUSH_CODE.DECLINED,
                    PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS
                  );
                }

                response_data.json({
                  success: true,
                  message: STORE_MESSAGE_CODE.DECLINED_SUCCESSFULLY,
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

//get_store_list_for_city
exports.get_store_list_for_city = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "city_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        console.log(request_data_body);
        var city_id = request_data_body.city_id;
        if (city_id == "000000000000000000000000") {
          Store.find({ is_business: true }).then((store) => {
            if (store.length == 0) {
              response_data.json({
                success: false,
                error_code: DELIVERY_ERROR_CODE.DELIVERY_DATA_NOT_FOUND,
              });
            } else {
              response_data.json({
                success: true,
                message: DELIVERY_MESSAGE_CODE.DELIVERY_LIST_SUCCESSFULLY,
                stores: store,
              });
            }
          });
        } else {
          Store.find({ is_business: true, city_id: city_id }).then((store) => {
            if (store.length == 0) {
              response_data.json({
                success: false,
                error_code: DELIVERY_ERROR_CODE.DELIVERY_DATA_NOT_FOUND,
              });
            } else {
              response_data.json({
                success: true,
                message: DELIVERY_MESSAGE_CODE.DELIVERY_LIST_SUCCESSFULLY,
                stores: store,
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

//get_store_list_for_country
exports.get_store_list_for_country = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "country_id", type: "string" }],
    function (response) {
      if (response.success) {
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
        var request_data_body = request_data.body;
        var country_id = request_data_body.country_id;
        Store.aggregate([store_query, array_to_json_store_detail]).then(
          async (stores) => {
            if (stores.length === 0) {
              response_data.json({
                success: false,
                error_code: DELIVERY_ERROR_CODE.DELIVERY_DATA_NOT_FOUND,
              });
            } else {
              /**For Mapping Store Branch Name */
              let stores_details = stores;
              let store_ids = stores_details.map((o) => o._id);
              const checkStoreDetails = await storeDetails
                .find({
                  store_id: { $in: store_ids },
                })
                .lean();
              stores.forEach((store) => {
                const storeDetail = checkStoreDetails.find((s) => {
                  const storeId = store._id
                    ? store._id.toString()
                    : null;
                  return s.store_id.toString() === storeId;
                });
                store.storeDetails = storeDetail ? storeDetail : null;
              });
              response_data.json({
                success: true,
                message: DELIVERY_MESSAGE_CODE.DELIVERY_LIST_SUCCESSFULLY,
                stores_all: stores,
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

        // Store.find({ is_business: true, country_id: country_id }).then(
        //   (store) => {
        //     if (store.length == 0) {
        //       response_data.json({
        //         success: false,
        //         error_code: DELIVERY_ERROR_CODE.DELIVERY_DATA_NOT_FOUND,
        //       });
        //     } else {
        //       response_data.json({
        //         success: true,
        //         message: DELIVERY_MESSAGE_CODE.DELIVERY_LIST_SUCCESSFULLY,
        //         stores_all: store,
        //       });
        //     }
        //   }
        // );
      } else {
        response_data.json(response);
      }
    }
  );
};

exports.get_store_list = function (request_data, response_data) {
  var request_data_body = request_data.body;
  Store.find({}).then((store) => {
    if (store.length == 0) {
      response_data.json({
        success: false,
        error_code: DELIVERY_ERROR_CODE.DELIVERY_DATA_NOT_FOUND,
      });
    } else {
      response_data.json({
        success: true,
        message: DELIVERY_MESSAGE_CODE.DELIVERY_LIST_SUCCESSFULLY,
        stores: store,
      });
    }
  });
};
exports.get_main_store_list = async function (req, res) {
  const is_main_store = req.body.is_main_store;
  // const stores = await Store.find({is_main_store : { $ne : !is_main_store}}).lean()
  const stores = await Store.find({}).lean();
  if (stores.length == 0) {
    res.json({
      success: false,
      error_code: DELIVERY_ERROR_CODE.DELIVERY_DATA_NOT_FOUND,
    });
    return;
  }
  res.json({
    success: true,
    message: DELIVERY_MESSAGE_CODE.DELIVERY_LIST_SUCCESSFULLY,
    stores: stores,
  });
};

//product_for_city_store
exports.product_for_city_store = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "city_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        console.log(request_data_body);
        var city_condition = {
          $match: {
            _id: { $eq: mongoose.Types.ObjectId(request_data_body.city_id) },
          },
        };

        var store_query = {
          $lookup: {
            from: "stores",
            localField: "_id",
            foreignField: "city_id",
            as: "store_detail",
          },
        };
        var array_to_json1 = { $unwind: "$store_detail" };

        var product_query = {
          $lookup: {
            from: "products",
            localField: "store_detail._id",
            foreignField: "store_id",
            as: "product_detail",
          },
        };

        City.aggregate([
          city_condition,
          store_query,
          array_to_json1,
          product_query,
        ]).then(
          (city) => {
            if (city.length == 0) {
              response_data.json({
                success: false,
                error_code: PROMO_CODE_ERROR_CODE.PROMO_CODE_DATA_NOT_FOUND,
              });
            } else {
              response_data.json({
                success: true,
                message: PROMO_CODE_MESSAGE_CODE.PROMO_CODE_LIST_SUCCESSFULLY,
                city: city,
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

//item_for_city_store
exports.item_for_city_store = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "city_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        console.log(request_data_body);
        var city_condition = {
          $match: {
            _id: { $eq: mongoose.Types.ObjectId(request_data_body.city_id) },
          },
        };
        var store_query = {
          $lookup: {
            from: "stores",
            localField: "_id",
            foreignField: "city_id",
            as: "store_detail",
          },
        };
        var array_to_json1 = { $unwind: "$store_detail" };
        var item_query = {
          $lookup: {
            from: "items",
            localField: "store_detail._id",
            foreignField: "store_id",
            as: "item_detail",
          },
        };

        City.aggregate([
          city_condition,
          store_query,
          array_to_json1,
          item_query,
        ]).then(
          (city) => {
            if (city.length == 0) {
              response_data.json({
                success: false,
                error_code: PROMO_CODE_ERROR_CODE.PROMO_CODE_DATA_NOT_FOUND,
              });
            } else {
              response_data.json({
                success: true,
                message: PROMO_CODE_MESSAGE_CODE.PROMO_CODE_LIST_SUCCESSFULLY,
                city: city,
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

//export_excel_store
exports.export_excel_store = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      Store.find({}).then(
        (stores) => {
          var json2csv = require("json2csv");
          var fs = require("fs");
          var fields = [
            "unique_id",
            "name",
            "device_type",
            "referral_code",
            "email",
            "country_phone_code",
            "phone",
            "app_version",
            "wallet",
            "wallet_currency_code",
            "address",
            "is_approved",
            "is_email_verified",
            "is_phone_number_verified",
            "is_document_uploaded",
            "location",
          ];

          var fieldNames = [
            "Unique ID",
            "Name",
            "Device Type",
            "Referral Code",
            "Email",
            "Country Phone Code",
            "Phone",
            "App Version",
            "Wallet",
            "Wallet Currency Code",
            "Address",
            "Approved",
            "Email Verify",
            "Phone Number Verify",
            "Document Uploaded",
            "Location",
          ];

          var csv = json2csv({
            data: stores,
            fields: fields,
            fieldNames: fieldNames,
          });
          var path = "./uploads/csv/file.csv";
          fs.writeFile(path, csv, function (error, data) {
            if (error) {
              throw error;
            } else {
              var new_path = "./csv/file.csv";

              response_data.json({
                success: true,
                message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                path: new_path,
              });
            }
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
    } else {
      response_data.json(response);
    }
  });
};

exports.get_store_review_history = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "store_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var condition = {
          $match: {
            store_id: mongoose.Types.ObjectId(request_data_body.store_id),
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
        var array_to_json1 = {
          $unwind: {
            path: "$store_detail",
            preserveNullAndEmptyArrays: true,
          },
        };

        var provider_query = {
          $lookup: {
            from: "providers",
            localField: "provider_id",
            foreignField: "_id",
            as: "provider_detail",
          },
        };
        var array_to_json2 = {
          $unwind: {
            path: "$provider_detail",
            preserveNullAndEmptyArrays: true,
          },
        };
        Review.aggregate([
          condition,
          user_query,
          array_to_json1,
          provider_query,
          array_to_json2,
        ]).then(
          (review_list) => {
            response_data.json({ success: true, review_list: review_list });
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
