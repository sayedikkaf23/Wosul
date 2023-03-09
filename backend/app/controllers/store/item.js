require("../../utils/message_code");
require("../../utils/error_code");
require("../../utils/constants");
var console = require("../../utils/console");

var utils = require("../../utils/utils");
var Item = require("mongoose").model("item");
var User = require("mongoose").model("user");
var Store = require("mongoose").model("store");
var Product = require("mongoose").model("product");
var Country = require("mongoose").model("country");
var mongoose = require("mongoose");
var Schema = mongoose.Types.ObjectId;
var Cart = require("mongoose").model("cart");
var Order = require("mongoose").model("order");
var User = require("mongoose").model("user");
var Promo_code = require("mongoose").model("promo_code");
var Order_payment = require("mongoose").model("order_payment");
var Notification = require("mongoose").model("notifications");
const Ingrediant = require("../../models/store/ingrediant");
const MeasuringUnit = require("../../models/store/measuring_unit");
const Modifier = require("../../models/store/modifier");
const Discount = require("../../models/store/discount");
const MeasurementCategory = require("../../models/store/measurement_category");
const Measurement = require("../../models/store/measurement");
const Supplier = require("../../models/store/supplier");
const Brand = require("../../models/store/brand");

var jwt = require("jsonwebtoken");
const {
  remove_loyalty_and_promo_both,
  apply_promo,
} = require("../user/promo_code");

var getUpdatedCart = (cart) => {
  let totalCartPrice = 0;
  let totalItemCount = 0;
  cart.order_details = cart.order_details.map((product) => {
    let totalItemPrice = 0;
    product.items = product.items.map((item) => {
      totalItemCount++;
      const price = !isNaN(Number(item.item_price))
        ? Number(item.item_price)
        : 0;
      const quantity = !isNaN(Number(item.quantity))
        ? Number(item.quantity)
        : 1;
      totalItemPrice += price * quantity;
      item.total_item_price = price * quantity;
      return item;
    });
    product.total_item_price = totalItemPrice;
    totalCartPrice += !isNaN(Number(product.total_item_price))
      ? Number(product.total_item_price)
      : 0;
    return product;
  });
  cart.total_cart_price = totalCartPrice;
  cart.total_item_count = totalItemCount;
  return cart;
};

exports.user_order_confirmation_push = function (request_data, response_data) {
  var request_data_body = request_data.body;
  var order_id = request_data_body.order_id;

  Order.findOne({ _id: order_id }).then((order) => {
    if (order) {
      order.is_sent_notification = true;
      order.save();

      Store.findOne({ _id: order.store_id }).then((store) => {
        var store_name = "";
        var store_image = "";
        if (store) {
          store_name = store.name;
          store_image = store.image_url;
        }

        var order_data = {
          order_id: order._id,
          unique_id: order.unique_id,
          store_name: store_name,
          store_image: store_image,
        };

        User.findOne({ _id: order.user_id }).then((user) => {
          if (user) {
            if (user.device_token != "") {
              utils.sendPushNotificationWithPushData(
                ADMIN_DATA_ID.USER,
                user.device_type,
                user.device_token,
                USER_PUSH_CODE.STORE_SUBSTITUTE_YOUR_CART_ITEM,
                PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS,
                order_data,
                ""
              );
            }
          }
        });
      });

      response_data.json({ success: true });
    } else {
      response_data.json({ success: false });
    }
  });
};

exports.user_substitute_confirmation_push = function (
  request_data,
  response_data
) {
  var request_data_body = request_data.body;
  var order_id = request_data_body.order_id;

  Order.findOne({ _id: order_id }).then((order) => {
    if (order) {
      order.is_sent_notification = true;
      order.save();

      Store.findOne({ _id: order.store_id }).then((store) => {
        var store_name = "";
        var store_image = "";
        if (store) {
          store_name = store.name;
          store_image = store.image_url;
        }

        var order_data = {
          order_id: order._id,
          unique_id: order.unique_id,
          store_name: store_name,
          store_image: store_image,
        };

        User.findOne({ _id: order.user_id }).then((user) => {
          if (user) {
            if (user.device_token != "") {
              utils.sendPushNotificationWithPushData(
                ADMIN_DATA_ID.USER,
                user.device_type,
                user.device_token,
                USER_PUSH_CODE.STORE_SUBSTITUTE_YOUR_ITEM,
                PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS,
                order_data,
                ""
              );
            }
          }
        });
      });

      response_data.json({ success: true });
    } else {
      response_data.json({ success: false });
    }
  });
};

// update_cart_detail
exports.update_cart_detail = async function (request_data, response_data) {
  var request_data_body = request_data.body;
  console.log("update_cart_detail:>>" + JSON.stringify(request_data_body));

  var cart_id = request_data_body.cart_id;

  Store.findOne({ _id: request_data_body.store_id }).then(
    (store) => {
      if (store) {
        Cart.findOne({ _id: cart_id }).then(
          (cart) => {
            if (cart) {
              Order_payment.findOne({ _id: cart.order_payment_id }).then(
                async (order_payment) => {
                  if (order_payment) {
                    var admin_profit_mode_on_store =
                      store.admin_profit_mode_on_store;
                    var admin_profit_value_on_store =
                      store.admin_profit_value_on_store;

                    var item_tax = store.item_tax;

                    var total_store_tax_price = 0;

                    var total_cart_price = request_data_body.total_cart_price;
                    var total_item_tax = request_data_body.total_item_tax;
                    var total_item_count = request_data_body.total_item_count;

                    cart.total_cart_price = total_cart_price;
                    cart.total_item_count = total_item_count;
                    //cart.total_item_tax = total_item_tax;

                    if (store.is_use_item_tax) {
                      total_store_tax_price = total_item_tax;
                    } else {
                      total_store_tax_price =
                        total_cart_price * store.item_tax * 0.01;
                    }
                    total_store_tax_price = utils.precisionRoundTwo(
                      Number(total_store_tax_price)
                    );

                    cart.total_item_tax = total_store_tax_price;

                    var order_price = 0;
                    var total_order_price = 0;
                    var total_admin_profit_on_store = 0;
                    var total_store_income = 0;

                    var total = 0;
                    var item_tax = store.item_tax;
                    var admin_profit_mode_on_store =
                      store.admin_profit_mode_on_store;
                    var admin_profit_value_on_store =
                      store.admin_profit_value_on_store;

                    var is_store_pay_delivery_fees = false;
                    var is_payment_mode_cash =
                      order_payment.is_payment_mode_cash;

                    order_price = +total_cart_price + +total_store_tax_price;
                    order_price = utils.precisionRoundTwo(Number(order_price));

                    switch (admin_profit_mode_on_store) {
                      case ADMIN_PROFIT_ON_ORDER_ID.PERCENTAGE /* percentage */:
                        total_admin_profit_on_store =
                          order_price * admin_profit_value_on_store * 0.01;
                        break;
                      case ADMIN_PROFIT_ON_ORDER_ID.PER_ORDER /* absolute per order */:
                        total_admin_profit_on_store =
                          admin_profit_value_on_store;
                        break;
                      case ADMIN_PROFIT_ON_ORDER_ID.PER_ITEMS /* absolute value per items */:
                        total_admin_profit_on_store =
                          admin_profit_value_on_store * total_item_count;
                        break;
                      default:
                        /* percentage */
                        total_admin_profit_on_store =
                          order_price * admin_profit_value_on_store * 0.01;
                        break;
                    }

                    total_admin_profit_on_store = utils.precisionRoundTwo(
                      Number(total_admin_profit_on_store)
                    );
                    total_store_income =
                      order_price - total_admin_profit_on_store;
                    total_store_income = utils.precisionRoundTwo(
                      Number(total_store_income)
                    );
                    /* ORDER CALCULATION END */

                    /* FINAL INVOICE CALCULATION START */
                    total_delivery_price = order_payment.total_delivery_price
                      ? order_payment.total_delivery_price
                      : 0;
                    total_order_price = order_price;

                    // Store Pay Delivery Fees Condition
                    if (
                      total_order_price >
                        store.free_delivery_for_above_order_price &&
                      store.is_store_pay_delivery_fees == true
                    ) {
                      is_store_pay_delivery_fees = true;
                    }

                    if (is_store_pay_delivery_fees) {
                      total = total_order_price;
                    } else {
                      total = +total_delivery_price + +total_order_price;
                    }

                    total = utils.precisionRoundTwo(Number(total));
                    order_payment.total_after_wallet_payment = total;

                    remaining_payment = total;
                    order_payment.remaining_payment = remaining_payment;

                    var store_have_service_payment = 0;
                    var store_have_order_payment = 0;
                    var total_store_have_payment = 0;
                    var pay_to_store = 0;
                    var total_provider_income =
                      order_payment.total_provider_income;

                    if (is_store_pay_delivery_fees) {
                      store_have_service_payment = total_delivery_price;
                      store_have_service_payment = utils.precisionRoundTwo(
                        Number(store_have_service_payment)
                      );
                    }

                    if (
                      is_payment_mode_cash &&
                      !order_payment.is_order_price_paid_by_store
                    ) {
                      store_have_order_payment = total_order_price;
                      store_have_order_payment = utils.precisionRoundTwo(
                        Number(store_have_order_payment)
                      );
                    }

                    total_store_have_payment =
                      +store_have_service_payment + +store_have_order_payment;
                    total_store_have_payment = utils.precisionRoundTwo(
                      Number(total_store_have_payment)
                    );
                    var other_promo_payment_loyalty =
                      order_payment.other_promo_payment_loyalty;
                    pay_to_store =
                      total_store_income -
                      total_store_have_payment -
                      other_promo_payment_loyalty;
                    pay_to_store = utils.precisionRoundTwo(
                      Number(pay_to_store)
                    );
                    var provider_have_cash_payment = 0;
                    var provider_paid_order_payment = 0;
                    var total_provider_have_payment = 0;
                    var pay_to_provider = 0;
                    var user_pay_payment = total;

                    if (is_payment_mode_cash) {
                      provider_have_cash_payment = total;
                    }
                    if (
                      is_payment_mode_cash &&
                      !order_payment.is_order_price_paid_by_store
                    ) {
                      provider_paid_order_payment = total_order_price;
                      provider_paid_order_payment = utils.precisionRoundTwo(
                        Number(provider_paid_order_payment)
                      );
                      user_pay_payment = total_order_price;
                    }

                    if (request_data_body.is_deduct_from_wallet) {
                      const user = await User.findOne({
                        _id: order_payment.user_id,
                      });
                      var wallet = user.wallet;
                      var is_payment_max = user.is_payment_max;
                      if (wallet && is_payment_max) {
                        if (wallet >= is_payment_max) {
                          user_pay_payment = user_pay_payment - is_payment_max;
                          wallet = wallet - is_payment_max;
                          user.wallet = wallet;
                          console.log("success");
                        } else {
                          user_pay_payment = user_pay_payment - wallet;
                          user.wallet = 0;
                        }
                        await user.save();
                      }
                    }
                    // user_pay_payment =
                    //   user_pay_payment + order_payment.total_delivery_price;
                    const promo_code = await Promo_code.findOne({
                      _id: order_payment.promo_id,
                    });
                    if (promo_code) {
                      var is_promo_required_uses =
                        promo_code.is_promo_required_uses;
                      var is_promo_expiry_date = promo_code.is_promo_have_date;
                      var is_promo_have_max_discount_limit =
                        promo_code.is_promo_have_max_discount_limit;
                      var is_promo_have_minimum_amount_limit =
                        promo_code.is_promo_have_minimum_amount_limit;
                      var is_promo_apply_on_completed_order =
                        promo_code.is_promo_apply_on_completed_order;
                      var is_promo_have_item_count_limit =
                        promo_code.is_promo_have_item_count_limit;
                      var promo_code_type = promo_code.promo_code_type;
                      var promo_code_value = promo_code.promo_code_value;
                      var promo_code_max_discount_amount =
                        promo_code.promo_code_max_discount_amount;
                      if (
                        promo_code.promo_for == PROMO_FOR.SERVICE &&
                        order_payment.is_store_pay_delivery_fees
                      ) {
                        console.log("testing 2");
                        response_data.json({
                          success: false,
                          error_code:
                            USER_ERROR_CODE.YOUR_DELIVERY_CHARGE_FREE_YOU_CAN_NOT_APPLY_PROMO,
                        });
                      } else {
                        var promo_payment = 0;
                        if (promo_code_type == 2) {
                          // type 2 - Absolute
                          promo_payment = promo_code_value;
                        } else {
                          // type 1- Percentage

                          if (promo_code.promo_for == PROMO_FOR.SERVICE) {
                            promo_payment =
                              total_delivery_price * promo_code_value * 0.01;
                          } else if (
                            promo_code.promo_for == PROMO_FOR.DELIVERIES ||
                            promo_code.promo_for == PROMO_FOR.STORE
                          ) {
                            promo_payment =
                              total_order_price * promo_code_value * 0.01;
                          } else if (
                            promo_code.promo_for == PROMO_FOR.PRODUCT ||
                            promo_code.promo_for == PROMO_FOR.ITEM
                          ) {
                            promo_payment =
                              response.price_for_promo *
                              promo_code_value *
                              0.01;
                          }

                          if (
                            is_promo_have_max_discount_limit &&
                            promo_payment > promo_code_max_discount_amount
                          ) {
                            promo_payment =
                              promo_code.promo_code_max_discount_amount;
                          }
                        }

                        // var promo_code_id =
                        //   promo_code._id;

                        // if (
                        //   promo_code.promo_for ==
                        //   PROMO_FOR.SERVICE
                        // ) {
                        //   if (
                        //     total_delivery_price >
                        //     promo_payment
                        //   ) {
                        //     total_delivery_price =
                        //       total_delivery_price -
                        //       promo_payment;
                        //   } else {
                        //     promo_payment =
                        //       total_delivery_price;
                        //     total_delivery_price = 0;
                        //   }
                        // } else {
                        //   if (
                        //     total_order_price >
                        //     promo_payment
                        //   ) {
                        //     total_order_price =
                        //       total_order_price -
                        //       promo_payment;
                        //   } else {
                        //     promo_payment =
                        //       total_order_price;
                        //     total_order_price = 0;
                        //   }
                        // }

                        user_pay_payment = user_pay_payment - promo_payment;

                        user_pay_payment = utils.precisionRoundTwo(
                          Number(user_pay_payment)
                        );
                        promo_payment = utils.precisionRoundTwo(
                          Number(promo_payment)
                        );

                        // order_payment.total_delivery_price = total_delivery_price;
                        // order_payment.total_order_price = total_order_price;
                        // order_payment.user_pay_payment =
                        //   user_pay_payment;
                        // order_payment.total_order_price =
                        //   user_pay_payment;
                        // order_payment.promo_id =
                        //   promo_code_id;
                        // if (
                        //   promo_code.promo_for ==
                        //   PROMO_FOR.SERVICE
                        // ) {
                        //   order_payment.is_promo_for_delivery_service = true;
                        // } else {
                        //   order_payment.is_promo_for_delivery_service = false;
                        // }
                        var other_promo_payment_loyalty = 0;
                        if (promo_code.admin_loyalty_type == 2) {
                          // 2 - Absolute
                          other_promo_payment_loyalty =
                            promo_payment - promo_code.admin_loyalty;
                        } else {
                          // PERCENTAGE = 1
                          other_promo_payment_loyalty =
                            promo_payment -
                            promo_code.admin_loyalty * promo_payment * 0.01;
                        }
                        if (other_promo_payment_loyalty < 0) {
                          other_promo_payment_loyalty = 0;
                        }

                        order_payment.other_promo_payment_loyalty =
                          utils.precisionRoundTwo(
                            Number(other_promo_payment_loyalty)
                          );
                        order_payment.promo_payment = promo_payment;
                      }
                    }
                    if (order_payment.wallet_payment) {
                      user_pay_payment =
                        user_pay_payment - order_payment.wallet_payment;
                    }
                    // promo_code calculation
                    total_provider_have_payment =
                      provider_have_cash_payment - provider_paid_order_payment;
                    total_provider_have_payment = utils.precisionRoundTwo(
                      Number(total_provider_have_payment)
                    );
                    pay_to_provider =
                      total_provider_income - total_provider_have_payment;
                    pay_to_provider = utils.precisionRoundTwo(
                      Number(pay_to_provider)
                    );
                    order_payment.total_service_price =
                      order_payment.total_service_price;
                    order_payment.item_tax = item_tax;
                    order_payment.pay_to_store = pay_to_store;
                    order_payment.pay_to_provider = pay_to_provider;
                    order_payment.total = total;
                    order_payment.user_pay_payment = user_pay_payment;
                    order_payment.cash_payment = total;
                    order_payment.is_store_pay_delivery_fees =
                      is_store_pay_delivery_fees;
                    order_payment.total_delivery_price = total_delivery_price;
                    order_payment.total_order_price = total_order_price;
                    order_payment.total_store_income = total_store_income;
                    order_payment.total_admin_profit_on_store =
                      total_admin_profit_on_store;

                    order_payment.total_store_tax_price = total_store_tax_price;
                    order_payment.total_cart_price = total_cart_price;
                    order_payment.total_item_count = total_item_count;
                    order_payment.save();
                    cart.save().then(
                      async () => {
                        // if (!cart.substitute) {
                        //   delete cart.substitute;
                        //   await remove_loyalty_and_promo_both(order_payment);
                        // }
                        response_data.json({
                          success: true,
                          message:
                            STORE_MESSAGE_CODE.STORE_ORDER_UPDATE_SUCCESSFULLY,
                        });
                      },
                      (error) => {
                        response_data.json({
                          success: false,
                          error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                        });
                      }
                    );
                  }
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

        //}
      } else {
        response_data.json({
          success: false,
          error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND,
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
};

// get_substitute_item_list
exports.get_substitute_item_list = function (request_data, response_data) {
  var request_data_body = request_data.body;
  var item_id = request_data_body.item_id;
  Item.findOne({ _id: item_id }).then(
    (item_detail) => {
      if (item_detail) {
        Item.find({
          _id: { $ne: item_detail._id },
          product_id: item_detail.product_id,
        }).then(
          (item) => {
            if (item.length > 0) {
              response_data.json({
                success: true,
                message: ITEM_MESSAGE_CODE.ITEM_ADD_SUCCESSFULLY,
                items: item,
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
      } else {
        response_data.json({
          success: false,
          error_code: ERROR_CODE.DETAIL_NOT_FOUND,
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
};

// update_substitute_item
exports.update_substitute_item = function (request_data, response_data) {
  var request_data_body = request_data.body;
  var item_id = request_data_body.item_id;

  Item.findOne({ _id: item_id }).then(
    (item_detail) => {
      if (item_detail) {
        let subItems = [...new Set(request_data_body.substitute_items)];
        if (
          Array.isArray(subItems) &&
          subItems.length &&
          subItems.length > 20
        ) {
          subItems = subItems.splice(20);
        }
        item_detail.substitute_items = subItems;
        item_detail.save();
        response_data.json({
          success: true,
          message: ITEM_MESSAGE_CODE.UPDATE_SUCCESSFULLY,
          item: item_detail,
        });
      } else {
        response_data.json({
          success: false,
          error_code: ITEM_ERROR_CODE.ITEM_ALREADY_EXIST,
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
};

// get_item_list
exports.get_substitute_items = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      var store_id = request_data_body.store_id;
      var item_id = request_data_body.item_id;
      Store.findOne({ _id: store_id }).then(
        (store_detail) => {
          if (store_detail) {
            Country.findOne({ _id: store_detail.country_id }).then(
              (country_data) => {
                if (country_data) {
                  var currency = country_data.currency_sign;
                  Item.findOne({ _id: item_id }, function (error, item_detail) {
                    if (item_detail) {
                      Item.find(
                        { _id: { $in: item_detail.substitute_items } },
                        function (error, items) {
                          if (items.length == 0) {
                            response_data.json({
                              success: false,
                              error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND,
                            });
                          } else {
                            response_data.json({
                              success: true,
                              message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
                              currency: currency,
                              items: items,
                            });
                          }
                        }
                      );
                    }
                  });

                  //    var products_array = {
                  //        $lookup:
                  //                {
                  //                    from: "products",
                  //                    localField: "product_id",
                  //                    foreignField: "_id",
                  //                    as: "products_detail"
                  //                }
                  //    };
                  //    var array_to_json = {$unwind: "$products_detail"};
                  //    var condition = {"$match": {'store_id': {$eq: mongoose.Types.ObjectId(store_id)}}};
                  //    Item.aggregate([condition, products_array, array_to_json]).then((items) => {
                  //        if (items.length == 0) {
                  //            response_data.json({success: false, error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND});
                  //        } else {
                  //            response_data.json({success: true,
                  //                message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
                  //                currency: currency, items: items
                  //            });
                  //        }
                  //    }, (error) => {
                  //
                  //        response_data.json({
                  //            success: false,
                  //            error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                  //        });
                  //    });
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
            response_data.json({
              success: false,
              error_code: ERROR_CODE.DETAIL_NOT_FOUND,
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
    } else {
      response_data.json(response);
    }
  });
};

exports.select_substitute_item = function (request_data, response_data) {
  var request_data_body = request_data.body;
  var item_id = request_data_body.item_id;
  var substitute_item_id = request_data_body.substitute_item_id;
  var cart_id = request_data_body.cart_id;

  Store.findOne({ _id: request_data_body.store_id }).then(
    (store) => {
      if (store) {
        Item.findOne({ _id: item_id }).then(
          (item_detail) => {
            if (item_detail) {
              Cart.findOne({ _id: cart_id }).then(
                (cart) => {
                  if (cart) {
                    var product_index = cart.order_details.findIndex(
                      (x) => x.product_id == item_detail.product_id
                    );
                    if (product_index != -1) {
                      cart.order_details.forEach(async function (product) {
                        var index = product.items.findIndex(
                          (x) => x.unique_id == item_detail.unique_id
                        );
                        if (index != -1) {
                          var existedSubstitute =
                            cart.order_details[product_index].items[index]
                              .substitute_items;
                          if (
                            existedSubstitute &&
                            Array.isArray(existedSubstitute) &&
                            existedSubstitute.length > 1
                          ) {
                            response_data.json({
                              success: false,
                              message:
                                ITEM_MESSAGE_CODE.ITEM_SUBSTITUTE_ALREADY_EXIST,
                            });
                            return;
                          } else {
                            console.log(
                              "substitute_item_id" +
                                JSON.stringify(substitute_item_id)
                            );
                            cart.order_details[product_index].items[
                              index
                            ].substitute_items = Array.isArray(
                              substitute_item_id
                            )
                              ? substitute_item_id
                              : [substitute_item_id];
                            cart.order_details[product_index].items[
                              index
                            ].original_item = [
                              item_id,
                              item_detail.name,
                              item_detail.details,
                              item_detail.image_url[0],
                              item_detail.price.toString(),
                            ];
                            cart.order_details[product_index].items[
                              index
                            ].substitute_set_at = Date.now();
                          }
                        }
                        await Cart.findByIdAndUpdate(cart_id, {
                          order_details: cart.order_details,
                        });
                      });
                    }

                    Order.findOne({ _id: cart.order_id }).then((order) => {
                      if (order) {
                        var order_id = order._id;
                        order.is_user_confirmed = false;
                        order.is_sent_notification = false;
                        order.save();

                        item_detail.is_item_in_stock = false;
                        item_detail.save().then(
                          () => {
                            response_data.json({
                              success: true,
                              message:
                                ITEM_MESSAGE_CODE.ITEM_SUBSTITUTE_SUCCESSFULLY,
                              order_details: cart.order_details,
                            });
                          },
                          (error) => {
                            response_data.json({
                              success: false,
                              error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                            });
                          }
                        );
                      } else {
                        response_data.json({
                          success: false,
                          error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                        });
                      }
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
        response_data.json({
          success: false,
          error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND,
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
};

// assign_substitute_item
exports.assign_substitute_item = function (request_data, response_data) {
  var request_data_body = request_data.body;
  var item_id = request_data_body.item_id;
  var substitute_item_id = request_data_body.substitute_item_id;
  var cart_id = request_data_body.cart_id;
  var quantity = request_data_body.quantity;
  var bConfirmOrder = request_data_body.confirm_order;
  console.log("assign_substitute_item>>>" + JSON.stringify(request_data_body));
  Store.findOne({ _id: request_data_body.store_id }).then(
    (store) => {
      if (store) {
        Item.findOne({ _id: item_id }).then(
          (item_detail) => {
            if (item_detail) {
              Item.find({ _id: { $in: substitute_item_id } }).then(
                (substitute_item_detail) => {
                  if (substitute_item_detail) {
                    Cart.findOne({ _id: cart_id }).then(
                      async (cart) => {
                        if (cart) {
                          // var original_items = []
                          var product_index = cart.order_details.findIndex(
                            (x) => x.product_id == item_detail.product_id
                          );
                          if (product_index != -1) {
                            for (
                              var productIndex = 0;
                              productIndex < cart.order_details.length;
                              productIndex++
                            ) {
                              var product = cart.order_details[productIndex];
                              var index = product.items.findIndex(
                                (x) => x.unique_id == item_detail.unique_id
                              );

                              if (index != -1) {
                                for (
                                  let i = 0;
                                  i < substitute_item_detail.length;
                                  i++
                                ) {
                                  var oldTotalItemPrice;
                                  var oldTotalItemTax;
                                  if (i > 0) {
                                    cart.order_details[
                                      product_index
                                    ].items.splice(index, 0, {});
                                    oldTotalItemPrice =
                                      cart.order_details[product_index].items[
                                        index - 1
                                      ].total_item_price;
                                    oldTotalItemTax =
                                      cart.order_details[product_index].items[
                                        index - 1
                                      ].total_tax;
                                  } else {
                                    oldTotalItemPrice =
                                      cart.order_details[product_index].items[
                                        index
                                      ].total_item_price;
                                    oldTotalItemTax =
                                      cart.order_details[product_index].items[
                                        index
                                      ].total_tax;

                                    // original_items.push(cart.order_details[product_index].items[index]);
                                    // original_items[0].substitute_items = substitute_item_detail;
                                    // cart.original_items = original_items;
                                  }
                                  cart.order_details[product_index].items[
                                    index
                                  ].unique_id =
                                    substitute_item_detail[i].unique_id;

                                  cart.order_details[product_index].items[
                                    index
                                  ].item_name = substitute_item_detail[i].name;
                                  cart.order_details[product_index].items[
                                    index
                                  ].quantity = quantity[i];
                                  cart.order_details[product_index].items[
                                    index
                                  ].total_price =
                                    substitute_item_detail[i].price;
                                  cart.order_details[product_index].items[
                                    index
                                  ].item_price =
                                    substitute_item_detail[i].price;
                                  cart.order_details[product_index].items[
                                    index
                                  ].details = substitute_item_detail[i].details;
                                  cart.order_details[product_index].items[
                                    index
                                  ].image_url =
                                    substitute_item_detail[i].image_url;
                                  cart.order_details[product_index].items[
                                    index
                                  ].specifications =
                                    substitute_item_detail[i].specifications;
                                  cart.order_details[product_index].items[
                                    index
                                  ].total_item_price =
                                    substitute_item_detail[i].price *
                                    quantity[i];
                                  // cart.order_details[product_index].items[index]
                                  //   .quantity;
                                  cart.order_details[product_index].items[
                                    index
                                  ].item_id = substitute_item_detail[i]._id;
                                  cart.order_details[product_index].items[
                                    index
                                  ].tax = substitute_item_detail[i].tax;
                                  cart.order_details[product_index].items[
                                    index
                                  ].total_tax =
                                    substitute_item_detail[i].tax || 0;
                                  // cart.order_details[product_index].items[index]
                                  //   .quantity;
                                  cart.order_details[product_index].items[
                                    index
                                  ].note_for_item =
                                    substitute_item_detail[i].note_for_item;

                                  var priceDiff =
                                    cart.order_details[product_index].items[
                                      index
                                    ].total_item_price - oldTotalItemPrice;
                                  var taxDiff =
                                    cart.order_details[product_index].items[
                                      index
                                    ].total_tax - oldTotalItemTax;

                                  cart.order_details[
                                    product_index
                                  ].total_item_price += priceDiff;
                                  cart.total_cart_price += priceDiff;

                                  cart.order_details[
                                    product_index
                                  ].total_item_tax += taxDiff || 0;
                                  cart.total_item_tax += taxDiff || 0;
                                  index++;
                                }
                              }
                              Cart.findByIdAndUpdate(
                                cart_id,
                                {
                                  order_details: cart.order_details,
                                  total_cart_price: cart.total_cart_price,
                                  substitute: true,
                                },
                                function (err, carts) {}
                              );
                            }
                          }
                          try {
                            let totalCartPrice = 0;
                            let totalItemCount = 0;
                            let hasSubstitute = false;
                            cart.order_details = cart.order_details.map(
                              (product) => {
                                let totalItemPrice = 0;
                                product.items = product.items.map((item) => {
                                  totalItemCount++;
                                  const price = !isNaN(Number(item.item_price))
                                    ? Number(item.item_price)
                                    : 0;
                                  const quantity1 = !isNaN(
                                    Number(item.quantity)
                                  )
                                    ? Number(item.quantity)
                                    : 1;
                                  totalItemPrice += price * quantity1;
                                  item.total_item_price = price * quantity1;
                                  if (
                                    item.substitute_items &&
                                    item.substitute_items.length > 0
                                  ) {
                                    hasSubstitute = true;
                                  }
                                  return item;
                                });
                                product.total_item_price = totalItemPrice;
                                totalCartPrice += !isNaN(
                                  Number(product.total_item_price)
                                )
                                  ? Number(product.total_item_price)
                                  : 0;
                                return product;
                              }
                            );
                            if (!hasSubstitute) {
                              await Order.findByIdAndUpdate(cart.order_id, {
                                is_user_confirmed: true,
                              });
                            }
                            cart.total_cart_price = totalCartPrice;
                            cart.total_item_count = totalItemCount;
                            await Order_payment.findByIdAndUpdate(
                              cart.order_payment_id,
                              {
                                total_order_price: totalCartPrice,
                              }
                            );
                            await exports.update_cart_detail(
                              {
                                body: {
                                  store_id: cart.store_id,
                                  cart_id: cart._id,
                                  total_cart_price: cart.total_cart_price,
                                  total_item_count: cart.total_item_count,
                                  total_item_tax: cart.total_item_tax,
                                },
                              },
                              {
                                json: (data) => {},
                              }
                            );
                          } catch (error) {
                            console.log(error + "1--<<<<<");
                          }
                          cart.substitute = true;
                          await cart.save();

                          Order.findOne({ _id: cart.order_id }).then(
                            (order) => {
                              if (order) {
                                var order_id = order._id;
                                if (bConfirmOrder == null || !bConfirmOrder) {
                                  order.is_user_confirmed = false;
                                  order.is_sent_notification = false;
                                } else {
                                  order.is_user_confirmed = true;
                                  order.is_sent_notification = true;
                                }
                                order.save();
                                //                                                User.findOne({_id: order.user_id}).then((user) => {
                                //                                                    if (user) {
                                //                                                        if (user.device_token != "") {
                                //
                                //                                                            utils.sendPushNotificationWithPushData(ADMIN_DATA_ID.USER, user.device_type, user.device_token, USER_PUSH_CODE.STORE_SUBSTITUTE_YOUR_CART_ITEM, PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS, order_id, "");
                                //                                                        }
                                //                                                    }
                                //                                                })
                              }
                            }
                          );
                        }

                        item_detail.current_substitute_item_id =
                          substitute_item_detail[0]._id;
                        item_detail.current_substitute_item_unique_id =
                          substitute_item_detail[0].unique_id;
                        item_detail.save().then(
                          () => {
                            response_data.json({
                              success: true,
                              message:
                                ITEM_MESSAGE_CODE.ITEM_SUBSTITUTE_SUCCESSFULLY,
                              total_item_tax: cart.total_item_tax,
                              total_cart_price: cart.total_cart_price,
                              total_item_count: cart.total_item_count,
                              substitute_item_price:
                                substitute_item_detail[0].price,
                            });
                          },
                          (error) => {
                            response_data.json({
                              success: false,
                              error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                            });
                          }
                        );
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
            }
          },
          (error) => {
            response_data.json({
              success: false,
              error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
            });
          }
        );
        //}
      } else {
        response_data.json({
          success: false,
          error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND,
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
};

// Update cart item price
exports.update_cart_item_price = async function (request_data, response_data) {
  var request_data_body = request_data.body;
  var item_id = request_data_body.item_id;
  var cart_id = request_data_body.cart_id;
  var item_price = request_data_body.item_price;
  var quantity = request_data_body.quantity;
  console.log(
    "update_cart_item_price ->body: >>" + JSON.stringify(request_data_body)
  );

  const promoOrderPayment = await Order_payment.findOne({
    cart_id: Schema(cart_id),
  }).lean();
  Store.findOne({ _id: request_data_body.store_id }).then(
    (store) => {
      if (store) {
        Cart.findOne({ _id: cart_id }).then(
          async (cart) => {
            let notification = "",
              item;
            if (cart) {
              var product_index = cart.order_details.findIndex((x) => {
                return x.items.find((item) => {
                  return (
                    item.item_id === item_id ||
                    item.item_id.toString() === item_id
                  );
                });
              });
              if (product_index != -1) {
                for (
                  var productIndex = 0;
                  productIndex < cart.order_details.length;
                  productIndex++
                ) {
                  var product = cart.order_details[productIndex];
                  var index = product.items.findIndex(
                    (x) => x.item_id == item_id
                  );
                  if (index != -1) {
                    // var diff =
                    //   total_item_price -
                    //   cart.order_details[product_index].items[index]
                    //     .total_item_price;
                    if (item_price !== "undefined") {
                      cart.order_details[product_index].items[
                        index
                      ].item_price = item_price;
                    }
                    try {
                      if (quantity !== "undefined") {
                        item = cart.order_details[product_index].items[index];
                        cart.order_details[product_index].items[
                          index
                        ].quantity = quantity;
                        notification = await Notification.create({
                          attr_name: "item_id",
                          attr_id: item.item_id,
                          type: "quantity_change",
                          message: `${item.item_name} quantity is updated to ${quantity}`,
                        });
                      }
                    } catch (error) {}
                  }
                }
                try {
                  let totalCartPrice = 0;
                  let totalItemCount = 0;
                  cart.order_details = cart.order_details.map((product) => {
                    let totalItemPrice = 0;
                    product.items = product.items.map((item) => {
                      totalItemCount++;
                      const price = !isNaN(Number(item.item_price))
                        ? Number(item.item_price)
                        : 0;
                      const quantity = !isNaN(Number(item.quantity))
                        ? Number(item.quantity)
                        : 1;
                      totalItemPrice += price * quantity;
                      item.total_item_price = price * quantity;
                      return item;
                    });
                    product.total_item_price = totalItemPrice;
                    totalCartPrice += !isNaN(Number(product.total_item_price))
                      ? Number(product.total_item_price)
                      : 0;
                    return product;
                  });
                  cart.total_cart_price = totalCartPrice;
                  cart.total_item_count = totalItemCount;
                  await Order_payment.findByIdAndUpdate(cart.order_payment_id, {
                    total_order_price: totalCartPrice,
                  });
                } catch (error) {}

                await cart.save();
                Cart.findByIdAndUpdate(
                  cart_id,
                  cart,
                  async function (err, carts) {
                    try {
                      let itemIds = [];
                      for (
                        let i = 0;
                        i < cart.order_details[0].items.length;
                        i++
                      ) {
                        const item = cart.order_details[0].items[i];
                        itemIds.push(Schema(item.item_id));
                      }

                      // var timestamp = new Date(
                      //   Date.now() - 2 * 60 * 60 * 1000
                      // );
                      // var hexSeconds = Math.floor(
                      //   timestamp / 1000
                      // ).toString(16);

                      // // Create an ObjectId with that hex timestamp
                      // var constructedObjectId = Schema(
                      //   hexSeconds + "0000000000000000"
                      // );

                      // notifications = await Notification.find({
                      //   _id: { $gt: constructedObjectId },
                      //   attr_name: "item_id",
                      //   attr_id: {
                      //     $in: itemIds,
                      //   },
                      // })
                      //   .select("message type created_at")
                      //   .catch((err) => {});

                      // await exports.update_cart_detail(
                      //   {
                      //     body: {
                      //       store_id: cart.store_id,
                      //       cart_id: cart._id,
                      //       total_cart_price: cart.total_cart_price,
                      //       total_item_count: cart.total_item_count,
                      //       total_item_tax: cart.total_item_tax,
                      //     },
                      //   },
                      //   {
                      //     json: (data) => {},
                      //   }
                      // );
                      var abc = await new Promise((res, rej) => {
                        exports.update_cart_detail(
                          {
                            body: {
                              store_id: cart.store_id,
                              cart_id: cart._id,
                              total_cart_price: cart.total_cart_price,
                              total_item_count: cart.total_item_count,
                              total_item_tax: cart.total_item_tax,
                            },
                          },
                          {
                            json: (data) => {
                              res(data);
                            },
                          }
                        );
                      });
                    } catch (error) {}
                    var updatedCart = await Cart.findOne({ _id: cart._id });
                    var orderPayment = {};
                    if (updatedCart && updatedCart.order_payment_id) {
                      orderPayment = await Order_payment.findOne({
                        _id: updatedCart.order_payment_id,
                      });
                      if (!orderPayment) orderPayment = {};
                      if (updatedCart.setValue) {
                        console.log("check1");
                        updatedCart.setValue(
                          "checkout_amount",
                          orderPayment.checkout_amount
                        );
                        updatedCart.setValue(
                          "user_pay_payment",
                          orderPayment.user_pay_payment
                        );
                      } else {
                        console.log("check");
                        updatedCart.set(
                          "checkout_amount",
                          orderPayment.checkout_amount
                        );
                        updatedCart.set(
                          "user_pay_payment",
                          orderPayment.user_pay_payment
                        );
                      }
                    }
                    if (promoOrderPayment && promoOrderPayment.promo_id) {
                      const promo = await Promo_code.findById(
                        promoOrderPayment.promo_id
                      );
                      try {
                        await new Promise((res, rej) => {
                          apply_promo(
                            {
                              body: {
                                order_payment_id:
                                  promoOrderPayment._id.toString(),
                                promo_code_name: promo.promo_code_name,
                                user_id: promoOrderPayment.user_id.toString(),
                                server_token: "token",
                              },
                            },
                            {
                              json: (data) => {
                                res(data);
                              },
                            },
                            null,
                            true
                          );
                        });
                      } catch (error) {
                        console.log("error: ", error);
                      }
                    }
                    orderPayment = await Order_payment.findOne({
                      _id: updatedCart.order_payment_id,
                    });

                    response_data.json({
                      success: true,
                      message: ITEM_MESSAGE_CODE.ITEM_SUBSTITUTE_SUCCESSFULLY,
                      cart: updatedCart,
                      total_cart_price: cart.total_cart_price,
                      order_payment_detail: orderPayment,
                    });
                  },
                  (error) => {
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
            response_data.json({
              success: false,
              error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
            });
          }
        );
        //}
      } else {
        response_data.json({
          success: false,
          error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND,
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
};

exports.remove_item_substitute = async function (request_data, response_data) {
  var body = request_data.body;
  var item_id = body.item_id;
  var cart_id = body.cart_id;
  var product_id = body.product_id;
  var device_type = body.device_type;
  if (!device_type) device_type = DEVICE_TYPE.ANDROID;

  var cart = await Cart.findOne({ _id: cart_id });
  try {
    var product_index = cart.order_details.findIndex(
      (x) => x.product_id == product_id
    );
    if (product_index === -1) product_index = 0;
    let items = cart.order_details[product_index].items;
    let idx = items.findIndex((i) => i.item_id.toString() === item_id);
    cart.order_details[product_index].items[idx].substitute_set_at = null;
    cart.order_details[product_index].items.splice(idx, 1);
    if (!cart.order_details[product_index].items.length) {
      cart.order_details.splice(product_index, 1);
    }
    try {
      let totalCartPrice = 0;
      let totalItemCount = 0;
      let hasSubstitute = false;
      cart.order_details = cart.order_details.map((product) => {
        let totalItemPrice = 0;
        product.items = product.items.map((item) => {
          totalItemCount++;
          const price = !isNaN(Number(item.item_price))
            ? Number(item.item_price)
            : 0;
          const quantity = !isNaN(Number(item.quantity))
            ? Number(item.quantity)
            : 1;
          totalItemPrice += price * quantity;
          item.total_item_price = price * quantity;
          if (item.substitute_items && item.substitute_items.length > 0) {
            hasSubstitute = true;
          }
          return item;
        });
        product.total_item_price = totalItemPrice;
        totalCartPrice += !isNaN(Number(product.total_item_price))
          ? Number(product.total_item_price)
          : 0;
        return product;
      });
      if (!hasSubstitute) {
        await Order.findByIdAndUpdate(cart.order_id, {
          is_user_confirmed: true,
        });
      }
      cart.total_cart_price = totalCartPrice;
      cart.total_item_count = totalItemCount;
      await Order_payment.findByIdAndUpdate(cart.order_payment_id, {
        total_order_price: totalCartPrice,
      });
      await exports.update_cart_detail(
        {
          body: {
            store_id: cart.store_id,
            cart_id: cart._id,
            total_cart_price: cart.total_cart_price,
            total_item_count: cart.total_item_count,
            total_item_tax: cart.total_item_tax,
          },
        },
        {
          json: (data) => {},
        }
      );
      var detail = await User.findOne({ _id: cart.user_id });
      if (detail && detail.device_token) {
        utils.sendPushNotification(
          ADMIN_DATA_ID.STORE,
          device_type,
          detail.device_token,
          STORE_PUSH_CODE.REMOVE_ITEM_SUBSTITUTE,
          PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS
        );
      }
    } catch (error) {
      console.log(error + "2--<<<<<");
    }
    await cart.save();
    await Cart.findOneAndUpdate({ _id: cart_id }, cart);
    response_data.json({
      cart: await Cart.findOne({ _id: cart_id }),
      success: true,
      message: ITEM_MESSAGE_CODE.ITEM_SUBSTITUTE_SUCCESSFULLY,
    });
  } catch (err) {
    response_data.json({
      success: false,
      error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
    });
  }
};

exports.get_cart_items_prices_with_notifications = function (
  request_data,
  response_data
) {
  var request_data_body = request_data.body;
  var cart_id = request_data_body.cart_id;

  Cart.findOne({ _id: cart_id }).then(
    async (cart) => {
      let notifications = [];
      try {
        let itemIds = [];
        for (let i = 0; i < cart.order_details[0].items.length; i++) {
          const item = cart.order_details[0].items[i];
          itemIds.push(Schema(item.item_id));
        }

        var timestamp = new Date(Date.now() - 2 * 60 * 60 * 1000);
        var hexSeconds = Math.floor(timestamp / 1000).toString(16);

        // Create an ObjectId with that hex timestamp
        var constructedObjectId = Schema(hexSeconds + "0000000000000000");

        notifications = await Notification.find({
          _id: { $gt: constructedObjectId },
          attr_name: "item_id",
          attr_id: {
            $in: itemIds,
          },
        })
          .select("message type created_at")
          .catch((err) => {});
      } catch (error) {}
      if (cart) {
        response_data.json({
          success: true,
          message: ITEM_MESSAGE_CODE.ITEM_SUBSTITUTE_SUCCESSFULLY,
          notifications,
          cart,
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
};

// get_checked_substitute_items
exports.get_checked_substitute_items = function (request_data, response_data) {
  var request_data_body = request_data.body;
  var item_id = request_data_body.item_id;

  Item.findOne(
    { _id: item_id },
    { substitute_items: 1 },
    function (error, item_detail) {
      if (item_detail) {
        response_data.json({
          success: true,
          message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
          items: item_detail.substitute_items,
        });
      }
    }
  );
};

// all_selected_item
exports.all_selected_item = function (request_data, response_data) {
  var request_data_body = request_data.body;
  var item_id = request_data_body.item_id;
  Item.findOne({ _id: item_id }).then(
    (item_detail) => {
      if (item_detail) {
        Item.find(
          {
            _id: { $ne: item_detail._id },
            product_id: item_detail.product_id,
            substitute_items: { $ne: [] },
          },
          { _id: 1 }
        ).then(
          (item) => {
            if (item.length > 0) {
              response_data.json({
                success: true,
                message: ITEM_MESSAGE_CODE.ITEM_ADD_SUCCESSFULLY,
                items: item,
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
      } else {
        response_data.json({
          success: false,
          error_code: ERROR_CODE.DETAIL_NOT_FOUND,
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
};

// add item api
exports.add_item = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [
      { name: "product_id", type: "string" },
      { name: "name", type: "string" },
    ],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var name = request_data_body.name.trim();
        name = name.charAt(0).toUpperCase() + name.slice(1);
        request_data_body.name = name;
        request_data_body.tags = name;
        var price = request_data_body.price;
        var item_price_without_offer =
          request_data_body.item_price_without_offer;
        if (item_price_without_offer > price) {
          request_data_body.discount_value = item_price_without_offer - price;
          var discount_percentage =
            ((item_price_without_offer - price) / item_price_without_offer) *
            100;
          request_data_body.discount_percentage = Number(
            discount_percentage.toFixed()
          );
        } else {
          request_data_body.discount_value = 0;
          request_data_body.discount_percentage = 0;
        }
        Store.findOne({ _id: request_data_body.store_id }).then(
          (store_detail) => {
            if (store_detail) {
              Item.findOne({
                store_id: request_data_body.store_id,
                product_id: request_data_body.product_id,
                name: { $regex: request_data_body.name, $options: "i" },
              }).then(
                (item_data) => {
                  if (item_data) {
                    response_data.json({
                      success: false,
                      error_code: ITEM_ERROR_CODE.ITEM_ALREADY_EXIST,
                    });
                  } else {
                    var item = new Item(request_data_body);
                    item.save().then(
                      () => {
                        response_data.json({
                          success: true,
                          message: ITEM_MESSAGE_CODE.ITEM_ADD_SUCCESSFULLY,
                          item: item,
                        });
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
              response_data.json({
                success: false,
                error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND,
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
      } else {
        response_data.json(response);
      }
    }
  );
};

// upload item image
exports.upload_item_image = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "item_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        Item.findOne({ _id: request_data_body.item_id }).then(
          (item) => {
            if (item) {
              var image_file = request_data.files;
              var file_list_size = 0;

              if (image_file != undefined && image_file.length > 0) {
                file_list_size = image_file.length;

                for (i = 0; i < file_list_size; i++) {
                  image_file[i];
                  var image_name = item._id + utils.generateServerToken(4);
                  var url =
                    utils.getStoreImageFolderPath(FOLDER_NAME.STORE_ITEMS) +
                    item.store_id +
                    "/" +
                    image_name +
                    FILE_EXTENSION.ITEM;

                  item.image_url.push(url);
                  utils.storeImageToFolder(
                    image_file[i].path,
                    item.store_id + "/" + image_name + FILE_EXTENSION.ITEM,
                    FOLDER_NAME.STORE_ITEMS
                  );
                }
              }
              item.save().then(
                () => {
                  response_data.json({
                    success: true,
                    message: ITEM_MESSAGE_CODE.ITEM_IMAGE_UPLOAD_SUCCESSFULLY,
                    item: item,
                  });
                },
                (error) => {
                  response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                  });
                }
              );
            } else {
              response_data.json({
                success: false,
                error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND,
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
      } else {
        response_data.json(response);
      }
    }
  );
};

//update_item_image
exports.update_item_image = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "item_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;

        console.log(
          "update_item_image :>> " + JSON.stringify(request_data_body)
        );
        var query = {};
        if (request_data_body.item_id == "") {
          query.unique_id_for_store_data = request_data_body.barcode;
        } else {
          query._id = request_data_body.item_id;
        }
        Item.findOne(query).then(
          (item) => {
            if (item) {
              var image_file = request_data.files;
              var file_list_size = 0;
              console.log("image_file :>> ", image_file);

              if (image_file != undefined && image_file.length > 0) {
                file_list_size = image_file.length;

                for (i = 0; i < file_list_size; i++) {
                  image_file[i];
                  var image_name = item._id + utils.generateServerToken(4);
                  var url =
                    utils.getStoreImageFolderPath(FOLDER_NAME.STORE_ITEMS) +
                    item.store_id +
                    "/" +
                    image_name +
                    FILE_EXTENSION.ITEM;

                  item.image_url.push(url);
                  utils.storeImageToFolder(
                    image_file[i].path,
                    item.store_id + "/" + image_name + FILE_EXTENSION.ITEM,
                    FOLDER_NAME.STORE_ITEMS
                  );
                }
                console.log("url :>> ", url);
              }
              item.save().then(
                () => {
                  response_data.json({
                    success: true,
                    message: ITEM_MESSAGE_CODE.ITEM_IMAGE_UPDATE_SUCCESSFULLY,
                    item: item,
                  });
                },
                (error) => {
                  response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                  });
                }
              );
            } else {
              response_data.json({
                success: false,
                error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND,
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
      } else {
        response_data.json(response);
      }
    }
  );
};

/// get store_product_item_list
exports.get_store_product_item_list = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      var user_id = request_data_body.user_id;
      let number_of_rec = request_data_body.number_of_rec
        ? request_data_body.number_of_rec
        : 10;
      let page = request_data_body.page ? request_data_body.page : 1;
      console.log(
        "get_store_product_item_list: " + JSON.stringify(request_data_body)
      );
      var table;
      if (user_id !== undefined) {
        id = request_data_body.user_id;
        table = User;
        var condition1 = { $match: { is_visible_in_store: { $eq: true } } };
      } else {
        id = request_data_body.store_id;
        table = Store;
        var condition1 = { $match: {} };
      }
      var condition2 = { $match: {} };
      if (request_data_body.product_id) {
        condition2 = { $match: { _id: Schema(request_data_body.product_id) } };
      }
      table.findOne({ _id: id }).then(
        (detail) => {
          if (detail) {
            Country.findOne({ _id: detail.country_id }).then(
              (country_data) => {
                if (country_data) {
                  var currency = country_data.currency_sign;
                  var items_array = {
                    $lookup: {
                      from: "items",
                      localField: "_id",
                      foreignField: "product_id",
                      as: "items",
                    },
                  };
                  var condition = {
                    $match: {
                      store_id: {
                        $eq: mongoose.Types.ObjectId(
                          request_data_body.store_id
                        ),
                      },
                    },
                  };

                  var category_condition = { $match: {} };
                  if (request_data_body.category_id) {
                    category_condition = {
                      $match: {
                        category_id: {
                          $eq: mongoose.Types.ObjectId(
                            request_data_body.category_id
                          ),
                        },
                      },
                    };
                  }
                  let $skip = (page - 1) * number_of_rec;
                  let $limit = number_of_rec;

                  Product.aggregate([
                    condition,
                    category_condition,
                    condition1,
                    condition2,
                    items_array,
                    { $skip },
                    { $limit },
                  ]).then(
                    (products) => {
                      if (products.length == 0) {
                        response_data.json({
                          success: false,
                          error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND,
                        });
                      } else {
                        response_data.json({
                          success: true,
                          message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
                          currency: currency,
                          products: products,
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
            response_data.json({
              success: false,
              error_code: ERROR_CODE.DETAIL_NOT_FOUND,
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
    } else {
      response_data.json(response);
    }
  });
};

exports.get_item_by_barcode = function (req, res) {
  const unique_id_for_store_data = req.body.unique_id_for_store_data
    ? req.body.unique_id_for_store_data
    : -1;
  let obj = {
    unique_id_for_store_data: unique_id_for_store_data,
  };
  Item.findOne(obj).then((item) => {
    if (item) {
      res.json({ success: true, item: item });
    } else {
      res.json({
        success: false,
        message: "No item found in the database with this code.",
      });
    }
  });
};

// get_item_list
exports.get_item_list = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      var store_id = request_data_body.store_id;
      Store.findOne({ _id: store_id }).then(
        (store_detail) => {
          if (store_detail) {
            Country.findOne({ _id: store_detail.country_id }).then(
              (country_data) => {
                if (country_data) {
                  var currency = country_data.currency_sign;
                  var products_array = {
                    $lookup: {
                      from: "products",
                      localField: "product_id",
                      foreignField: "_id",
                      as: "products_detail",
                    },
                  };
                  var array_to_json = { $unwind: "$products_detail" };
                  var condition = {
                    $match: {
                      store_id: { $eq: mongoose.Types.ObjectId(store_id) },
                    },
                  };
                  Item.aggregate([
                    condition,
                    products_array,
                    array_to_json,
                  ]).then(
                    (items) => {
                      if (items.length == 0) {
                        response_data.json({
                          success: false,
                          error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND,
                        });
                      } else {
                        response_data.json({
                          success: true,
                          message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
                          currency: currency,
                          items: items,
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
            response_data.json({
              success: false,
              error_code: ERROR_CODE.DETAIL_NOT_FOUND,
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
    } else {
      response_data.json(response);
    }
  });
};

// get_item_data
exports.get_item_data = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "item_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var store_id = request_data_body.store_id;
        var item_id = request_data_body.item_id;
        Store.findOne({ _id: store_id }).then(
          (store_detail) => {
            if (store_detail) {
              Item.findOne({ _id: item_id }).then(
                (item_data) => {
                  if (item_data) {
                    var product_id = item_data.product_id;
                    var specification_array = {
                      $lookup: {
                        from: "specification_groups",
                        localField: "_id",
                        foreignField: "product_id",
                        as: "specifications_detail",
                      },
                    };
                    var condition = {
                      $match: {
                        _id: { $eq: mongoose.Types.ObjectId(product_id) },
                      },
                    };
                    Product.aggregate([condition, specification_array]).then(
                      (product) => {
                        if (product.length == 0) {
                          response_data.json({
                            success: false,
                            error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND,
                          });
                        } else {
                          var store_condition = {
                            $match: {
                              store_id: {
                                $eq: mongoose.Types.ObjectId(
                                  request_data_body.store_id
                                ),
                              },
                            },
                          };
                          var product_condition = {
                            $match: {
                              product_id: {
                                $eq: mongoose.Types.ObjectId(product_id),
                              },
                            },
                          };
                          var item_condition = {
                            $match: {
                              _id: { $ne: mongoose.Types.ObjectId(item_id) },
                            },
                          };

                          Item.aggregate([
                            store_condition,
                            product_condition,
                            item_condition,
                            { $project: { a: "$name" } },
                            { $unwind: "$a" },
                            {
                              $group: {
                                _id: "a",
                                item_name: { $addToSet: "$a" },
                              },
                            },
                          ]).then(
                            (items_array) => {
                              if (item_array.length == 0) {
                                response_data.json({
                                  success: true,
                                  message:
                                    ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
                                  item: item_data,
                                  product: product[0],
                                  item_array: [],
                                });
                              } else {
                                response_data.json({
                                  success: true,
                                  message:
                                    ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
                                  item: item_data,
                                  product: product[0],
                                  item_array: item_array[0].item_name,
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
                    response_data.json({
                      success: false,
                      error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND,
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
            } else {
              response_data.json({
                success: false,
                error_code: ERROR_CODE.DETAIL_NOT_FOUND,
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
      } else {
        response_data.json(response);
      }
    }
  );
};

// item in stock
exports.is_item_in_stock = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "item_id", type: "string" }, { name: "is_item_in_stock" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var item_id = request_data_body.item_id;
        Item.findOne({ _id: item_id }).then(
          (item) => {
            if (item) {
              item.is_item_in_stock = request_data_body.is_item_in_stock;
              item.save().then(
                () => {
                  response_data.json({
                    success: true,
                    message: ITEM_MESSAGE_CODE.ITEM_STATE_CHANGE_SUCCESSFULLY,
                  });
                },
                (error) => {
                  response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                  });
                }
              );
            } else {
              response_data.json({
                success: false,
                error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND,
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
      } else {
        response_data.json(response);
      }
    }
  );
};

exports.delete_item = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [
      { name: "item_id", type: "string" },
      { name: "name", type: "string" },
    ],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var item_id = request_data_body.item_id;
        Store.findOne({ _id: request_data_body.store_id }).then(
          (store_detail) => {
            if (store_detail) {
              Item.findOneAndRemove(
                { _id: item_id },
                function (error, item_data) {
                  if (error) {
                    response_data.json({
                      success: false,
                      error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                    });
                  } else {
                    response_data.json({
                      success: true,
                      message: ITEM_MESSAGE_CODE.DELETE_SUCCESSFULLY,
                    });
                  }
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

// update item
exports.update_item = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [
      { name: "item_id", type: "string" },
      { name: "name", type: "string" },
    ],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var item_id = request_data_body.item_id;
        var name = request_data_body.name.trim();
        name = name.charAt(0).toUpperCase() + name.slice(1);
        request_data_body.name = name;
        var price = request_data_body.price;
        var item_price_without_offer =
          request_data_body.item_price_without_offer;
        if (item_price_without_offer > price) {
          request_data_body.discount_value = item_price_without_offer - price;
          var discount_percentage =
            ((item_price_without_offer - price) / item_price_without_offer) *
            100;
          request_data_body.discount_percentage = Number(
            discount_percentage.toFixed()
          );
        } else {
          request_data_body.discount_value = 0;
          request_data_body.discount_percentage = 0;
        }

        Store.findOne({ _id: request_data_body.store_id }).then(
          (store_detail) => {
            if (store_detail) {
              Item.findOne({
                _id: { $ne: request_data_body.item_id },
                store_id: request_data_body.store_id,
                product_id: request_data_body.product_id,
                name: { $regex: request_data_body.name, $options: "i" },
              }).then(
                (item_detail) => {
                  if (item_detail) {
                    response_data.json({
                      success: false,
                      error_code: ITEM_ERROR_CODE.ITEM_ALREADY_EXIST,
                    });
                  } else {
                    try {
                      if (request_data_body.price !== undefined) {
                        Notification.create({
                          store_id: request_data_body.store_id,
                          attr_name: "item_id",
                          attr_id: request_data_body.item_id,
                          type: "price_change",
                          message: `${request_data_body.name} price is updated to ${request_data_body.price}`,
                        });
                      }
                    } catch (error) {}
                    Item.findOneAndUpdate({ _id: item_id }, request_data_body, {
                      new: true,
                    }).then(
                      (item_data) => {
                        if (item_data) {
                          response_data.json({
                            success: true,
                            message: ITEM_MESSAGE_CODE.UPDATE_SUCCESSFULLY,
                            item: item_data,
                          });
                        } else {
                          response_data.json({
                            success: false,
                            error_code: ITEM_ERROR_CODE.UPDATE_FAILED,
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
              response_data.json({
                success: false,
                error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND,
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
      } else {
        response_data.json(response);
      }
    }
  );
};

////// delete_item_image
exports.delete_item_image = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      Store.findOne({ _id: request_data_body.store_id }).then(
        (store_detail) => {
          if (store_detail) {
            Item.findOne({ _id: request_data_body._id }).then(
              (item) => {
                if (item) {
                  var image_file = request_data_body.image_url;
                  var file_list_size = 0;
                  if (image_file != undefined && image_file.length > 0) {
                    file_list_size = image_file.length;
                    for (i = 0; i < file_list_size; i++) {
                      image_file[i];
                      var image_url = item.image_url;
                      var index = image_url.indexOf(image_file[i]);
                      if (index != -1) {
                        image_url.splice(index, 1);
                      }
                      item.image_url = image_url;
                      utils.deleteImageFromFolder(
                        image_file[i],
                        FOLDER_NAME.STORE_ITEMS
                      );
                    }
                  }

                  item.save().then(
                    () => {
                      response_data.json({
                        success: true,
                        message:
                          ITEM_MESSAGE_CODE.ITEM_IMAGE_UPDATE_SUCCESSFULLY,
                        item: item,
                      });
                    },
                    (error) => {
                      response_data.json({
                        success: false,
                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                      });
                    }
                  );
                } else {
                  response_data.json({
                    success: false,
                    error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND,
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
          } else {
            response_data.json({
              success: false,
              error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND,
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
    } else {
      response_data.json(response);
    }
  });
};

// get_item_detail
exports.get_item_detail = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "type" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var type = Number(request_data_body.type);
        var Table;
        switch (type) {
          case ADMIN_DATA_ID.USER:
            Table = User;
            break;
          case ADMIN_DATA_ID.STORE:
            Table = Store;
            break;
          default:
            break;
        }

        Table.findOne({ _id: request_data_body.id }).then(
          (detail) => {
            if (detail) {
              Item.find({ _id: { $in: request_data_body.item_array } }).then(
                (items) => {
                  if (items.length == 0) {
                    response_data.json({
                      success: false,
                      error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND,
                    });
                  } else {
                    response_data.json({
                      success: true,
                      message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
                      items: items,
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
            } else {
              response_data.json({
                success: false,
                error_code: ERROR_CODE.DETAIL_NOT_FOUND,
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
      } else {
        response_data.json(response);
      }
    }
  );
};

exports.update_sequence_number = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      if (request_data_body.type == 1) {
        request_data_body.filtered_product_list.forEach(function (
          product_data,
          index
        ) {
          Product.findOneAndUpdate(
            { _id: product_data._id },
            { sequence_number: product_data.sequence_number },
            function (error, new_product_data) {
              if (index == request_data_body.filtered_product_list.length - 1) {
                response_data.json({ success: true });
              }
            }
          );
        });
      } else {
        request_data_body.filtered_item_list.forEach(function (
          item_data,
          index
        ) {
          Item.findOneAndUpdate(
            { _id: item_data._id },
            { sequence_number: item_data.sequence_number },
            function (error, new_item_data) {
              if (index == request_data_body.filtered_item_list.length - 1) {
                response_data.json({ success: true });
              }
            }
          );
        });
      }
    } else {
      response_data.json(response);
    }
  });
};

exports.get_substitute_by_barcode = async function (req, res) {
  const unique_id_for_store_data = req.body.unique_id_for_store_data
    ? req.body.unique_id_for_store_data
    : -1;
  const store_id = req.body.store_id;
  const product_id = req.body.product_id;

  let data1 = { success: false };
  let data = { success: true };

  const item = await Item.findOne({
    unique_id_for_store_data,
    store_id,
    product_id,
  });
  if (item) {
    data.item = item;
    res.json(data);
  } else {
    data1.message = "No item found in the database with this code.";
    res.json(data1);
  }
  // res.json(data);
};

//get ingrediant
exports.get_ingrediant = async function (req, res) {
  const ingrediant = await Ingrediant.find({});
  if (ingrediant) {
    res.json({ success: true, ingrediant: ingrediant });
  } else {
    res.json({
      success: false,
      message: "No ingrediant found in the database.",
    });
  }
};

//get ingrediant by id
exports.get_ingrediant_by_id = async function (req, res) {
  const { ingrediant_id } = req.body;
  if (!ingrediant_id) {
    res.json({
      success: false,
      message: "Please pass ingrediant_id.",
    });
    return;
  }
  const ingrediant = await Ingrediant.findOne({ _id: ingrediant_id });
  if (ingrediant) {
    res.json({ success: true, ingrediant: ingrediant });
  } else {
    res.json({
      success: false,
      message: "No ingrediant found in the database.",
    });
  }
};

//get measuring unit
exports.get_measuring_unit = async function (req, res) {
  const measuring_unit = await MeasuringUnit.find({});
  if (measuring_unit) {
    res.json({ success: true, measuring_unit: measuring_unit });
  } else {
    res.json({
      success: false,
      message: "No measuring unit found in the database.",
    });
  }
};

//get modifier
exports.get_modifier = async function (req, res) {
  const modifier = await Modifier.find({});
  if (modifier) {
    res.json({ success: true, modifier: modifier });
  } else {
    res.json({
      success: false,
      message: "No modifier found in the database.",
    });
  }
};

//get discount
exports.get_discount = async function (req, res) {
  const discount = await Discount.find({});
  if (discount) {
    res.json({ success: true, discount: discount });
  } else {
    res.json({
      success: false,
      message: "No discount found in the database.",
    });
  }
};

//get measurement category
exports.get_measurement_category = async function (req, res) {
  const measurment_category = await MeasurementCategory.find({});
  if (measurment_category) {
    res.json({ success: true, measurment_category: measurment_category });
  } else {
    res.json({
      success: false,
      message: "No measurement category found in the database.",
    });
  }
};

//get measurement
exports.get_measurement = async function (req, res) {
  const measurment = await Measurement.find({});
  if (measurment) {
    res.json({ success: true, measurment: measurment });
  } else {
    res.json({
      success: false,
      message: "No measurement found in the database.",
    });
  }
};

//get supplier
exports.get_supplier = async function (req, res) {
  const supplier = await Supplier.find({});
  if (supplier) {
    res.json({ success: true, supplier: supplier });
  } else {
    res.json({
      success: false,
      message: "No supplier found in the database.",
    });
  }
};

//get brand
exports.get_brand = async function (req, res) {
  const brand = await Brand.find({});
  if (brand) {
    res.json({ success: true, brand: brand });
  } else {
    res.json({
      success: false,
      message: "No brand found in the database.",
    });
  }
};
