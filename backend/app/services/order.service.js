const mongoose = require("mongoose");
// const Item = require("../models/store/item");
const Order = require("../models/user/order");
const Country = require("../models/admin/country");
const User = require("../models/user/user");
const moment = require("moment-timezone");
const order = require("../models/user/order");

module.exports = (function () {
  this.setDeliverIn = async ({ orderId, deliverIn }) => {
    try {
      return await Order.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(orderId) },
        { $inc: { deliver_in: deliverIn } },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  };

  this.checkRefferalForFriend = async ({ user, checkout_amount }) => {
    const country = await Country.findOne({
      _id: user.country_id,
    });
    var min_price_for_online_payment = country.min_price_for_online_payment;
    if (
      !user.is_referral_bonus_recieved &&
      checkout_amount >= min_price_for_online_payment
    ) {
      if (
        country.is_referral_user &&
        country.is_referral_wallet_enable_online &&
        user.is_referral
      ) {
        console.log("referral_bonus >>>>>");
        // user.wallet = user.wallet + country.referral_bonus_to_user;
        const user_friend = await User.findOne({
          _id: user.referred_by,
        });
        user_friend.wallet =
          user_friend.wallet + country.referral_bonus_to_user; // bonus to referree
        await user_friend.save();
        user.is_referral_bonus_recieved = true;
        await user.save();
      }
    }
  };

  this.getOrderHistoryAggregatePipeline = async (request_body) => {
    let { start_date, end_date } = request_body;
    const search = { $match: { $or: [] } };
    let search_unique_id = "";

    start_date = start_date?.formatted
      ? moment(start_date?.formatted, "MM-DD-yyyy").tz("Asia/Dubai").toDate()
      : moment().tz("Asia/Dubai").subtract(1, "months").toDate();

    end_date = end_date?.formatted
      ? moment(end_date?.formatted, "MM-DD-yyyy")
          .endOf("day")
          .tz("Asia/Dubai")
          .toDate()
      : moment().endOf("day").tz("Asia/Dubai").toDate();

    const user_query = {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user_detail",
      },
    };

    const array_to_json_user_detail = { $unwind: "$user_detail" };

    const store_query = {
      $lookup: {
        from: "stores",
        localField: "store_id",
        foreignField: "_id",
        as: "store_detail",
      },
    };
    const array_to_json_store_detail = {
      $unwind: {
        path: "$store_detail",
        preserveNullAndEmptyArrays: true,
      },
    };

    const request_query = {
      $lookup: {
        from: "requests",
        localField: "request_id",
        foreignField: "_id",
        as: "request_detail",
      },
    };

    const array_to_json_request_query = {
      $unwind: {
        path: "$request_detail",
        preserveNullAndEmptyArrays: true,
      },
    };
    const cart_query = {
      $lookup: {
        from: "carts",
        localField: "cart_id",
        foreignField: "_id",
        as: "cart_detail",
      },
    };
    const array_to_json_cart_query = { $unwind: "$cart_detail" };

    const provider_query = {
      $lookup: {
        from: "providers",
        localField: "request_detail.provider_id",
        foreignField: "_id",
        as: "provider_detail",
      },
    };
    const array_to_json_provider_query = {
      $unwind: {
        path: "$provider_detail",
        preserveNullAndEmptyArrays: true,
      },
    };

    const order_payment_query = {
      $lookup: {
        from: "order_payments",
        localField: "order_payment_id",
        foreignField: "_id",
        as: "order_payment_detail",
      },
    };

    const array_to_json_order_payment_query = {
      $unwind: "$order_payment_detail",
    };

    const payment_detail_query = {
      $lookup: {
        from: "payment_details",
        localField: "order_payment_detail._id",
        foreignField: "order_payment_id",
        as: "payment_detail",
      },
    };

    const array_to_json_payment_detail_query = {
      $unwind: "$order_payment_detail",
    };

    const payment_gateway_query = {
      $lookup: {
        from: "payment_gateways",
        localField: "order_payment_detail.payment_id",
        foreignField: "_id",
        as: "payment_gateway_detail",
      },
    };

    const review_query = {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "order_id",
        as: "review_detail",
      },
    };

    const store_branch_query = {
      $lookup: {
        from: "stores",
        localField: "store_id",
        foreignField: "_id",
        as: "store_branch_details",
      },
    };
    let number_of_rec = SEARCH_SORT.NO_OF_RECORD_PER_PAGE;
    let page = request_body?.page;

    const order_status_id = request_body?.order_status_id;
    let search_field = request_body?.search_field;

    const array_to_json_store_branch = { $unwind: "$store_branch_details" };

    let search_value = request_body?.search_value;
    search_value = search_value.replace(/^\s+|\s+$/g, "");
    search_value = search_value.replace(/ +(?= )/g, "");

    let payment_status_condition = { $match: {} };

    if (
      request_body?.payment_status != "all" &&
      request_body?.payment_status == "true"
    ) {
      payment_status_condition = {
        $match: {
          "order_payment_detail.is_payment_mode_cash": { $eq: true },
        },
      };
    }

    if (
      request_body?.payment_status != "all" &&
      request_body?.payment_status != "true"
    ) {
      payment_status_condition = {
        $match: {
          "order_payment_detail.is_payment_mode_cash": { $eq: false },
        },
      };
    }

    const created_by = request_body?.created_by;
    let created_by_condition = { $match: {} };
    if (created_by != "both") {
      created_by_condition = {
        $match: { order_type: { $eq: created_by } },
      };
    }

    let full_name = search_value.split(" ");

    if (search_field === "user_detail.first_name") {
      search.$match.$or.push({
        "user_detail.first_name": { $regex: new RegExp(search_value, "i") },
      });

      search.$match.$or.push({
        "user_detail.last_name": { $regex: new RegExp(search_value, "i") },
      });

      if (!typeof full_name[0] || !typeof full_name[1]) {
        search.$match.$or = search.$match.$or.concat([
          {
            "user_detail.first_name": {
              $regex: new RegExp(full_name[0], "i"),
            },
          },
          {
            "user_detail.last_name": {
              $regex: new RegExp(full_name[0], "i"),
            },
          },
          {
            "user_detail.first_name": {
              $regex: new RegExp(full_name[1], "i"),
            },
          },
          {
            "user_detail.last_name": {
              $regex: new RegExp(full_name[1], "i"),
            },
          },
        ]);
      }
    }

    if (search_field === "provider_detail.first_name") {
      search.$match.$or.push({
        "provider_detail.first_name": {
          $regex: new RegExp(search_value, "i"),
        },
      });

      search.$match.$or.push({
        "provider_detail.last_name": {
          $regex: new RegExp(search_value, "i"),
        },
      });

      if (!typeof full_name[0] || !typeof full_name[1]) {
        search.$match.$or = search.$match.$or.concat([
          {
            "provider_detail.first_name": {
              $regex: new RegExp(full_name[0], "i"),
            },
          },
          {
            "provider_detail.last_name": {
              $regex: new RegExp(full_name[0], "i"),
            },
          },
          {
            "provider_detail.first_name": {
              $regex: new RegExp(full_name[1], "i"),
            },
          },
          {
            "provider_detail.last_name": {
              $regex: new RegExp(full_name[1], "i"),
            },
          },
        ]);
      }
    }

    if (search_field === "store_detail.name") {
      search.$match.$or.push({
        "store_detail.name": {
          $regex: new RegExp(search_value, "i"),
        },
      });

      if (!typeof full_name[0] || !typeof full_name[1]) {
        search.$match.$or = search.$match.$or.concat([
          {
            "store_detail.name": {
              $regex: new RegExp(full_name[0], "i"),
            },
          },
          {
            "store_detail.name": {
              $regex: new RegExp(full_name[0], "i"),
            },
          },
          {
            "store_detail.name": {
              $regex: new RegExp(full_name[1], "i"),
            },
          },
          {
            "store_detail.name": {
              $regex: new RegExp(full_name[1], "i"),
            },
          },
        ]);
      }
    }

    let filter = {
      $match: { completed_at: { $gte: start_date, $lt: end_date } },
    };

    if (search_field === "unique_id") {
      var query = {};
      if (!search_value) {
        query[search_field] = { $regex: new RegExp(search_value, "i") };
        search_unique_id = { $match: query };
      }

      if (search_value) {
        search_value = Number(search_value);
        search.$match.$or.push({
          [search_field]: search_value,
        });
        // filter.$match[search_field] = search_value;

        if (!request_body.start_date) {
          delete filter.$match.completed_at;
        }
      }
    }

    let sort = { $sort: { _id: -1 } };
    sort["$sort"]["unique_id"] = parseInt(-1);

    let skip = {};
    skip["$skip"] = page * number_of_rec - number_of_rec;

    let limit = {};
    limit["$limit"] = number_of_rec;

    let count = {
      $group: { _id: null, total: { $sum: 1 } },
    };

    const orderStatusCondition = {
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

    let order_status_id_condition = { $match: {} };
    if (order_status_id != "") {
      order_status_id_condition = {
        $match: { order_status_id: { $eq: Number(order_status_id) } },
      };
    }

    let admin_type_condition = { $match: {} };
    if (request_body?.admin_type == 4) {
      let main_store = await Store.findOne({
        _id: request_body?.main_store_id,
      });
      let sub_store = [main_store._id];
      main_store.sub_stores.forEach((str) => {
        sub_store.push(mongoose.Types.ObjectId(str._id));
      });
      admin_type_condition = {
        $match: { store_id: { $in: sub_store } },
      };
    }

    const countPipeline = [
      filter,
      admin_type_condition,
      orderStatusCondition,
      created_by_condition,
      order_status_id_condition,
      user_query,
      store_query,
      order_payment_query,
      array_to_json_user_detail,
      array_to_json_store_detail,
      payment_gateway_query,
      payment_detail_query,
      array_to_json_payment_detail_query,
      payment_status_condition,
      search,
      count,
    ];

    const pipeline = [
      filter,
      admin_type_condition,
      orderStatusCondition,
      created_by_condition,
      order_status_id_condition,
      sort,
      user_query,
      store_query,
      order_payment_query,
      cart_query,
      array_to_json_cart_query,
      review_query,
      array_to_json_user_detail,
      array_to_json_store_detail,
      provider_query,
      array_to_json_provider_query,
      payment_gateway_query,
      payment_detail_query,
      array_to_json_payment_detail_query,
      payment_status_condition,
      store_branch_query,
      array_to_json_store_branch,
      search,
      skip,
      limit,
    ];

    return { pipeline, countPipeline };
  };

  return this;
})();
