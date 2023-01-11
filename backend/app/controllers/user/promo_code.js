require("../../utils/message_code");
require("../../utils/error_code");
require("../../utils/constants");
var utils = require("../../utils/utils");
var mongoose = require("mongoose");
var User = require("mongoose").model("user");
var Store = require("mongoose").model("store");
// var City = require("mongoose").model("city");
// var Order = require("mongoose").model("order");
var Order_payment = require("mongoose").model("order_payment");
var loyaltyPoint = require("../../models/user/loyaltyPoint");
var Promo_code = require("mongoose").model("promo_code");
var Cart = require("mongoose").model("cart");
var Setting = require("mongoose").model("setting");
var console = require("../../utils/console");
// var Delivery = require("../../models/admin/delivery");

const removePromoCode = function (req, res) {
  console.log("remove_promo_code:>>>> " + JSON.stringify(req.body));
  utils.check_request_params(
    req.body,
    [{ name: "order_payment_id", type: "string" }],
    async function (response) {
      if (response.success) {
        var body = req.body;
        const order_payment = await Order_payment.findOne({
          _id: body.order_payment_id,
        });

        if (order_payment.promo_id) {
          let promo = await Promo_code.findOne({ _id: order_payment.promo_id });
          promo.payment_apply_on = promo.payment_apply_on.filter(
            (p) => p.toString() != order_payment._id.toString()
          );
          promo.user_used = promo.user_used.filter(
            (p) => p.toString() != order_payment.user_id.toString()
          );
          try {
            const user_used = promo.user_used.filter(
              (p) => p.toString() === order_payment.user_id.toString()
            );
            const payment_apply_on = promo.payment_apply_on.filter(
              (p) => p.toString() === order_payment._id.toString()
            );
            user_used.pop();
            payment_apply_on.pop();
            promo.payment_apply_on =
              promo.payment_apply_on.concat(payment_apply_on);
            promo.user_used = promo.user_used.concat(user_used);
          } catch (error) {}
          promo.used_promo_code--;

          await promo.save();
          order_payment.promo_id = null;
          // order_payment.total_order_price += order_payment.promo_payment;
          order_payment.user_pay_payment += order_payment.promo_payment;
          order_payment.promo_payment = 0;
          order_payment.other_promo_payment_loyalty = 0;
        }
        await order_payment.save();
        let user = await User.findById(order_payment.user_id).lean();

        res.json({
          order_payment,
          success: true,
          error_message: "promo code removed",
          loyalty_points: user && user.loyalty_points ? user.loyalty_points : 0,
        });
      } else {
        res.json(response);
      }
    }
  );
};

const removeLoyaltyPoints = function (req, res) {
  console.log("remove_loyalty_points: " + JSON.stringify(req.body));
  utils.check_request_params(
    req.body,
    [
      { name: "order_payment_id", type: "string" },
      { name: "user_id", type: "string" },
    ],
    async function (response) {
      if (response.success) {
        var body = req.body;
        const order_payment = await Order_payment.findOne({
          _id: body.order_payment_id,
        });
        let loyalty_points = 0;
        if (order_payment.loyalty_payment > 0) {
          const userId = order_payment.user_id
            ? order_payment.user_id
            : body.user_id;
          let user = await User.findOne({ _id: userId });
          user.loyalty_points += order_payment.loyalty_point;
          order_payment.user_pay_payment += order_payment.loyalty_payment;
          order_payment.loyalty_payment = 0;
          order_payment.loyalty_point = 0;
          loyalty_points = user.loyalty_points;
          await user.save();
        }
        await order_payment.save();
        await loyaltyPoint.deleteOne({
          order_payment_id: order_payment._id,
        });

        res.json({
          order_payment,
          loyalty_points,
          success: true,
        });
      } else {
        res.json(response);
      }
    }
  );
};

const get_user_loyalty_summary = async (req, res) => {
  console.log("get_user_loyalty_summary:>>>> " + JSON.stringify(req.body));
  utils.check_request_params(
    req.body,
    [{ name: "user_id", type: "string" }],
    async function (response) {
      if (!response.success) {
        res.json(response);
        return;
      }
      const { user_id } = req.body;

      try {
        let data = await loyaltyPoint
          .find({ user_id })
          .populate("store_delivery_id", "delivery_name icon_url")
          .lean();

        data = data.map((l) => {
          l.icon = l.store_delivery_id.icon_url;
          l.name = l.store_delivery_id.delivery_name;
          delete l.store_delivery_id;
          return l;
        });

        const user = await User.findOne({ _id: user_id });
        res.json({ status: true, data, loyalty_points: user.loyalty_points });
      } catch (error) {
        res.json({
          success: false,
          error_message: error.message || "Something went wrong.",
        });
      }
    }
  );
};

const removeLoyaltyAndPromoBoth = async (orderPayment) => {
  await new Promise((res, rej) => {
    removePromoCode(
      {
        body: {
          order_payment_id: orderPayment._id.toString(),
        },
      },
      {
        json: (data) => {
          res(data);
        },
      }
    );
  });
  await new Promise((res, rej) => {
    removeLoyaltyPoints(
      {
        body: {
          order_payment_id: orderPayment._id.toString(),
          user_id: orderPayment.user_id.toString(),
        },
      },
      {
        json: (data) => {
          res(data);
        },
      }
    );
  });
};

exports.remove_promo_code = removePromoCode;
exports.remove_loyalty_points = removeLoyaltyPoints;
exports.get_user_loyalty_summary = get_user_loyalty_summary;
exports.remove_loyalty_and_promo_both = removeLoyaltyAndPromoBoth;

// APPLY PROMO CODE
// exports.apply_promo_code = function (request_data, response_data) {
//   utils.check_request_params(
//     request_data.body,
//     [
//       { name: "order_payment_id", type: "string" },
//       { name: "promo_code_name", type: "string" },
//       { name: "user_id", type: "string" },
//       { name: "server_token", type: "string" },
//     ],
//     async function (response) {
//       if (response.success) {
//         var request_data_body = request_data.body;
//         console.log("apply_promo_code: " + JSON.stringify(request_data_body));
//         let user = await User.findOne({ _id: request_data_body.user_id });
//         var store;
//         if (!user) {
//           response_data.json({
//             success: false,
//             error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
//             store: store,
//           });
//           return;
//         }
//         if (
//           request_data_body.server_token !== null &&
//           user.server_token !== request_data_body.server_token
//         ) {
//           response_data.json({
//             success: false,
//             error_code: ERROR_CODE.INVALID_SERVER_TOKEN,
//           });
//           return;
//         }
//         response_data.user = user;
//         var promo_code_name = request_data_body.promo_code_name;
//         if (promo_code_name != undefined) {
//           promo_code_name = promo_code_name.toUpperCase();
//         }
//         var date_now = new Date();
//         const order_payment = await Order_payment.findOne({
//           user_id: user._id,
//           _id: request_data_body.order_payment_id,
//         });
//         if (!order_payment) {
//           response_data.json({
//             success: false,
//             error_code: USER_ERROR_CODE.PROMO_APPLY_FAILED,
//             store: store,
//           });
//           return;
//         }

//         var total_delivery_price = order_payment.total_delivery_price;
//         var total_order_price = order_payment.total_order_price;

//         var user_pay_payment = order_payment.user_pay_payment;
//         var total_cart_price = order_payment.total_cart_price;
//         const cart = await Cart.findOne({ _id: order_payment.cart_id });
//         if (!cart) {
//           response_data.json({
//             success: false,
//             error_code: USER_ERROR_CODE.PROMO_APPLY_FAILED,
//             store: store,
//           });
//           return;
//         }
//         store = await Store.findOne({ _id: order_payment.store_id });
//         if (!store) {
//           response_data.json({
//             success: false,
//             error_code: USER_ERROR_CODE.PROMO_APPLY_FAILED,
//             store: store,
//           });
//           return;
//         }

//         const city = await City.findOne({ _id: store.city_id });
//         if (!city) {
//           response_data.json({
//             success: false,
//             error_code: USER_ERROR_CODE.PROMO_APPLY_FAILED,
//             store: store,
//           });
//           return;
//         }
//         if (!city.is_promo_apply) {
//           response_data.json({
//             success: false,
//             error_code: USER_ERROR_CODE.PROMO_CODE_NOT_FOR_CITY,
//             store: store,
//           });
//           return;
//         }
//         let promo_code = await Promo_code.findOne({
//           country_id: store.country_id,
//           $or: [
//             { city_id: city._id },
//             {
//               city_id: mongoose.Types.ObjectId(ID_FOR_ALL.ALL_ID),
//             },
//           ],
//           promo_code_name: promo_code_name,
//           is_active: true,
//           is_approved: true,
//         });
//         if (!promo_code) {
//           promo_code = await Promo_code.findOne({
//             country_id: store.country_id,
//             $or: [
//               { city_id: city._id },
//               {
//                 city_id: mongoose.Types.ObjectId(ID_FOR_ALL.ALL_ID),
//               },
//             ],
//             promo_code_name: request_data_body.promo_code_name,
//             is_active: true,
//             is_approved: true,
//           });
//         }
//         if (!promo_code) {
//           response_data.json({
//             success: false,
//             error_message: "Invalid or expired promo code",
//             error_code: USER_ERROR_CODE.INVALID_OR_EXPIRED_PROMO_CODE,
//             store: store,
//           });
//           return;
//         }
//         // var is_payment_mode_cash = order_payment.is_payment_mode_cash;
//         // var is_payment_mode_card_on_delivery = order_payment.is_payment_mode_card_on_delivery;
//         // var is_payment_mode_online_payment = order_payment.is_payment_mode_online_payment;
//         // var is_promo_for_cash = promo_code.is_promo_for_cash;
//         // var is_promo_for_card_on_delivery = promo_code.is_promo_for_card_on_delivery;
//         // var is_promo_for_online_payment = promo_code.is_promo_for_online_payment;
//         // var err_message;
//         // var is_promo_applicable = false;

//         //   if(is_payment_mode_cash && is_promo_for_cash){
//         //     is_promo_applicable =  true ;
//         //   }
//         //   else if (is_payment_mode_card_on_delivery && is_promo_for_card_on_delivery) {
//         //     is_promo_applicable =  true;
//         //   }
//         //   else if (is_payment_mode_online_payment && is_promo_for_online_payment){
//         //     is_promo_applicable =  true;
//         //   }
//         //   else {
//         //     if(is_promo_for_cash){
//         //       err_message = "This promo code can only be applied on cash payment mode"
//         //     }
//         //     else if(is_promo_for_card_on_delivery){
//         //       err_message = "This promo code can only be applied on card on delivery payment mode"
//         //     }
//         //    else if(is_promo_for_online_payment){
//         //       err_message = "This promo code can only be applied on online payment mode"
//         //     }
//         //     is_promo_applicable =  false ;
//         //   }

//         // if(!is_promo_applicable){
//         //   response_data.json({
//         //     success : false,
//         //     error_message : err_message
//         //   })
//         // }
//         var promoForOrderExist = await promo_code.payment_apply_on.find(
//           (p) =>
//             p && order_payment && p.toString() === order_payment._id.toString()
//         );

//         if (promoForOrderExist) {
//           response_data.json({
//             success: false,
//             error_message: "Promo code already applied successfully",
//           });
//           return;
//         }

//         var is_promo_required_uses = promo_code.is_promo_required_uses;
//         var is_promo_expiry_date = promo_code.is_promo_have_date;
//         var is_promo_have_max_discount_limit =
//           promo_code.is_promo_have_max_discount_limit;
//         var is_promo_have_minimum_amount_limit =
//           promo_code.is_promo_have_minimum_amount_limit;
//         var is_promo_apply_on_completed_order =
//           promo_code.is_promo_apply_on_completed_order;
//         var is_promo_have_item_count_limit =
//           promo_code.is_promo_have_item_count_limit;
//         var promo_code_type = promo_code.promo_code_type;
//         var promo_code_value = promo_code.promo_code_value;
//         var promo_code_max_discount_amount =
//           promo_code.promo_code_max_discount_amount;

//         var promo_apply_value = 0;
//         if (promo_code.promo_for == PROMO_FOR.SERVICE) {
//           promo_apply_value = total_delivery_price;
//         } else {
//           promo_apply_value = total_cart_price;
//         }

//         if (
//           (is_promo_have_item_count_limit &&
//             cart.total_item_count >=
//               promo_code.promo_code_apply_on_minimum_item_count) ||
//           !is_promo_have_item_count_limit
//         ) {
//           const order_count = await Order.countDocuments({
//             user_id: request_data_body.user_id,
//             order_status_id: ORDER_STATUS_ID.COMPLETED,
//           });
//           if (
//             (is_promo_apply_on_completed_order &&
//               order_count >= promo_code.promo_apply_after_completed_order) ||
//             !is_promo_apply_on_completed_order
//           ) {
//             const userUses = Promo_code.findOne({
//               user_id: user._id,
//               promo_id: promo_code._id,
//             });

//             console.log("userUses: ", userUses);
//             if (
//               (is_promo_required_uses &&
//                 promo_code.used_promo_code < promo_code.promo_code_uses) ||
//               !is_promo_required_uses
//             ) {
//               if (
//                 (is_promo_expiry_date &&
//                   promo_code.promo_expire_date >= date_now) ||
//                 !is_promo_expiry_date
//               ) {
//                 if (
//                   (is_promo_have_minimum_amount_limit &&
//                     promo_apply_value >=
//                       promo_code.promo_code_apply_on_minimum_amount) ||
//                   !is_promo_have_minimum_amount_limit
//                 ) {
//                   utils.check_promo_for(
//                     promo_code,
//                     cart,
//                     store,
//                     async function (response) {
//                       if (response.success) {
//                         utils.check_promo_recursion(
//                           promo_code,
//                           city.timezone,
//                           async function (promo_for_response) {
//                             if (promo_for_response) {
//                               const order_payments = await Order_payment.find({
//                                 user_id: user._id,
//                                 promo_id: promo_code._id,
//                               });
//                               if (
//                                 (promo_code.is_promo_user_required_uses &&
//                                   order_payments.length >=
//                                     promo_code.promo_user_code_uses) ||
//                                 (!promo_code.is_promo_user_required_uses &&
//                                   order_payments.length > 0)
//                               ) {
//                                 console.log("testing 1");
//                                 response_data.json({
//                                   success: false,
//                                   error_message: "The Promo code Already Used",
//                                   error_code:
//                                     USER_ERROR_CODE.PROMO_CODE_ALREADY_USED,
//                                 });
//                               } else {
//                                 if (
//                                   promo_code.promo_for == PROMO_FOR.SERVICE &&
//                                   order_payment.is_store_pay_delivery_fees
//                                 ) {
//                                   console.log("testing 2");
//                                   response_data.json({
//                                     success: false,
//                                     error_code:
//                                       USER_ERROR_CODE.YOUR_DELIVERY_CHARGE_FREE_YOU_CAN_NOT_APPLY_PROMO,
//                                   });
//                                 } else {
//                                   var promo_payment = 0;
//                                   if (promo_code_type == 2) {
//                                     // type 2 - Absolute
//                                     promo_payment = promo_code_value;
//                                   } else {
//                                     // type 1- Percentage

//                                     if (
//                                       promo_code.promo_for == PROMO_FOR.SERVICE
//                                     ) {
//                                       promo_payment =
//                                         total_delivery_price *
//                                         promo_code_value *
//                                         0.01;
//                                     } else if (
//                                       promo_code.promo_for ==
//                                         PROMO_FOR.DELIVERIES ||
//                                       promo_code.promo_for == PROMO_FOR.STORE
//                                     ) {
//                                       promo_payment =
//                                         total_order_price *
//                                         promo_code_value *
//                                         0.01;
//                                     } else if (
//                                       promo_code.promo_for ==
//                                         PROMO_FOR.PRODUCT ||
//                                       promo_code.promo_for == PROMO_FOR.ITEM
//                                     ) {
//                                       promo_payment =
//                                         response.price_for_promo *
//                                         promo_code_value *
//                                         0.01;
//                                     }

//                                     if (
//                                       is_promo_have_max_discount_limit &&
//                                       promo_payment >
//                                         promo_code_max_discount_amount
//                                     ) {
//                                       promo_payment =
//                                         promo_code.promo_code_max_discount_amount;
//                                     }
//                                   }

//                                   var promo_code_id = promo_code._id;

//                                   if (
//                                     promo_code.promo_for == PROMO_FOR.SERVICE
//                                   ) {
//                                     if (total_delivery_price > promo_payment) {
//                                       total_delivery_price =
//                                         total_delivery_price - promo_payment;
//                                     } else {
//                                       promo_payment = total_delivery_price;
//                                       total_delivery_price = 0;
//                                     }
//                                   } else {
//                                     if (total_order_price > promo_payment) {
//                                       total_order_price =
//                                         total_order_price - promo_payment;
//                                     } else {
//                                       promo_payment = total_order_price;
//                                       total_order_price = 0;
//                                     }
//                                   }

//                                   user_pay_payment =
//                                     +total_delivery_price + +total_order_price;
//                                   user_pay_payment = utils.precisionRoundTwo(
//                                     Number(user_pay_payment)
//                                   );
//                                   promo_payment = utils.precisionRoundTwo(
//                                     Number(promo_payment)
//                                   );

//                                   // order_payment.total_delivery_price = total_delivery_price;
//                                   // order_payment.total_order_price = total_order_price;
//                                   order_payment.user_pay_payment =
//                                     user_pay_payment;
//                                   order_payment.total_order_price =
//                                     user_pay_payment;
//                                   order_payment.promo_id = promo_code_id;
//                                   if (
//                                     promo_code.promo_for == PROMO_FOR.SERVICE
//                                   ) {
//                                     order_payment.is_promo_for_delivery_service = true;
//                                   } else {
//                                     order_payment.is_promo_for_delivery_service = false;
//                                   }
//                                   var other_promo_payment_loyalty = 0;
//                                   if (promo_code.admin_loyalty_type == 2) {
//                                     // 2 - Absolute
//                                     other_promo_payment_loyalty =
//                                       promo_payment - promo_code.admin_loyalty;
//                                   } else {
//                                     // PERCENTAGE = 1
//                                     other_promo_payment_loyalty =
//                                       promo_payment -
//                                       promo_code.admin_loyalty *
//                                         promo_payment *
//                                         0.01;
//                                   }
//                                   if (other_promo_payment_loyalty < 0) {
//                                     other_promo_payment_loyalty = 0;
//                                   }

//                                   order_payment.other_promo_payment_loyalty =
//                                     utils.precisionRoundTwo(
//                                       Number(other_promo_payment_loyalty)
//                                     );
//                                   order_payment.promo_payment = promo_payment;

//                                   promo_code.used_promo_code =
//                                     promo_code.used_promo_code + 1;

//                                   if (
//                                     request_data_body.deduct_from_wallet &&
//                                     response_data.user &&
//                                     response_data.user.wallet &&
//                                     !isNaN(Number(response_data.user.wallet))
//                                   ) {
//                                     if (user_pay_payment >= 30) {
//                                       if (response_data.user.wallet < 10) {
//                                         order_payment.wallet_deduction =
//                                           response_data.user.wallet;
//                                         response_data.user.wallet -=
//                                           response_data.user.wallet;
//                                         order_payment.user_pay_payment -=
//                                           response_data.user.wallet;
//                                       } else {
//                                         response_data.user.wallet -= 10;
//                                         order_payment.user_pay_payment -= 10;
//                                         order_payment.wallet_deduction = 10;
//                                       }
//                                     }
//                                   }
//                                   promo_code.user_used.push(
//                                     response_data.user._id
//                                   );
//                                   promo_code.payment_apply_on.push(
//                                     order_payment._id
//                                   );
//                                   try {
//                                     if (order_payment.loyalty_payment > 0) {
//                                       user.loyalty_points +=
//                                         order_payment.loyalty_payment;
//                                       // order_payment.user_pay_payment +=
//                                       //   order_payment.loyalty_payment;
//                                       order_payment.loyalty_payment = 0;
//                                       await user.save();
//                                     }
//                                     await order_payment.save();
//                                     promo_code.save();
//                                     response_data.json({
//                                       success: true,
//                                       message:
//                                         USER_MESSAGE_CODE.PROMO_APPLY_SUCCESSFULLY,
//                                       order_payment: {
//                                         ...order_payment.toJSON(),
//                                         promo_code_name:
//                                           promo_code.promo_code_name,
//                                       },
//                                       store: store,
//                                     });
//                                     return;
//                                   } catch (error) {
//                                     console.log(error);
//                                     response_data.json({
//                                       success: false,
//                                       error_code: ERROR_CODE.PROMO_APPLY_FAILED,
//                                       store: store,
//                                     });
//                                   }
//                                 }
//                               }
//                             } else {
//                               console.log("testing 4");
//                               response_data.json({
//                                 success: false,
//                                 error_code:
//                                   USER_ERROR_CODE.INVALID_OR_EXPIRED_PROMO_CODE,
//                                 store: store,
//                               });
//                             }
//                           }
//                         );
//                       } else {
//                         console.log("testing 5");
//                         response_data.json({
//                           success: false,
//                           error_code:
//                             USER_ERROR_CODE.INVALID_OR_EXPIRED_PROMO_CODE,
//                           error_message:
//                             "This promo code not valid in current stores",
//                           store: store,
//                         });
//                       }
//                     }
//                   );
//                 } else {
//                   console.log("testing 3.1");
//                   response_data.json({
//                     success: false,
//                     error_code:
//                       USER_ERROR_CODE.PROMO_AMOUNT_LESS_THEN_MINIMUM_AMOUNT_LIMIT,
//                     error_message:
//                       "Oops! This code is applicable only on orders above AED " +
//                       promo_code.promo_code_apply_on_minimum_amount,
//                     store: store,
//                   });
//                 }
//               } else {
//                 console.log("testing 3.2");
//                 response_data.json({
//                   success: false,
//                   error_message: "Invalid or Expired promo code",
//                   error_code: USER_ERROR_CODE.INVALID_OR_EXPIRED_PROMO_CODE,
//                   store: store,
//                 });
//               }
//             } else {
//               console.log("testing 3.3");
//               response_data.json({
//                 success: false,
//                 error_message: "Promo code out of limit",
//                 error_code: USER_ERROR_CODE.PROMO_USED_OUT_OF_LIMIT,
//                 store: store,
//               });
//             }
//           } else {
//             response_data.json({
//               success: false,
//               error_code: USER_ERROR_CODE.INVALID_OR_EXPIRED_PROMO_CODE,
//               store: store,
//             });
//           }
//         } else {
//           response_data.json({
//             success: false,
//             error_code: USER_ERROR_CODE.INVALID_OR_EXPIRED_PROMO_CODE,
//             store: store,
//           });
//         }
//       } else {
//         response_data.json(response);
//       }
//     }
//   );
// };

exports.apply_promo = function (req, res, _, byPassToken = false) {
  console.log("apply_promo:>>>> " + JSON.stringify(req.body));
  utils.check_request_params(
    req.body,
    [
      { name: "order_payment_id", type: "string" },
      { name: "promo_code_name", type: "string" },
      { name: "user_id", type: "string" },
      { name: "server_token", type: "string" },
    ],
    async function (response) {
      if (!response.success) {
        res.json(response);
        return;
      }
      const { user_id, server_token, promo_code_name, order_payment_id } =
        req.body;

      try {
        let user = await User.findOne({ _id: user_id });
        if (!user) {
          res.json({
            success: false,
            error_message: "User not found!",
          });
          return;
        }
        if (
          server_token !== null &&
          user.server_token !== server_token &&
          !byPassToken
        ) {
          res.json({
            success: false,
            error_message: "Invalid server token.",
          });
          return;
        }
        let promo = await Promo_code.findOne({
          $or: [
            { promo_code_name: promo_code_name },
            { promo_code_name: promo_code_name.toUpperCase() },
          ],
          is_active: true,
          is_approved: true,
        });
        if (!promo) {
          res.json({
            success: false,
            error_message: "Invalid promo code!",
          });
          return;
        }

        if (promo.promo_expire_date && new Date() >= promo.promo_expire_date) {
          res.json({
            success: false,
            error_message: "Promo code expired.",
          });
          return;
        }

        let order_payment = await Order_payment.findOne({
          _id: order_payment_id,
        });
        if (!order_payment) {
          res.json({
            success: false,
            error_message: "Order Payment not found!",
          });
          return;
        }
        const cart = await Cart.findOne({ _id: order_payment.cart_id });
        if (promo.promo_for === 2) {
          const storeExist = promo.promo_apply_on.find(
            (p) =>
              p &&
              order_payment &&
              p.toString() === order_payment.store_id.toString()
          );
          if (!storeExist) {
            res.json({
              success: false,
              error_message: "Promo code is not applicable on this Store.",
            });
            return;
          }
        }

        var promoForOrderExist = promo.payment_apply_on.find(
          (p) =>
            p && order_payment && p.toString() === order_payment._id.toString()
        );

        if (promoForOrderExist) {
          res.json({
            success: false,
            error_message: "Promo code already applied successfully",
          });
          return;
        }
        if (promo.used_promo_code >= promo.promo_code_uses) {
          res.json({
            success: false,
            error_message: "Promo code total usage limit reached.",
          });
          return;
        }
        const userUses = promo.user_used.filter(
          (u) => u.toString() === user._id.toString()
        );
        if (userUses.length >= promo.promo_user_code_uses) {
          res.json({
            success: false,
            error_message: "Promo code per user usage limit reached.",
          });
          return;
        }
        if (
          (promo.is_promo_have_minimum_amount_limit &&
            cart.total_cart_price <=
              promo.promo_code_apply_on_minimum_amount) ||
          !promo.is_promo_have_minimum_amount_limit
        ) {
          res.json({
            success: false,
            error_message:
              "Oops! This code is applicable only on orders above AED " +
              promo.promo_code_apply_on_minimum_amount,
          });
          return;
        }
        // if (promo.is_promo_for_cash && !order_payment.is_payment_mode_cash) {
        //   res.json({
        //     success: false,
        //     error_message:
        //       "This promo code can only be applied on cash payment mode",
        //   });
        //   return;
        // }

        // if (
        //   promo.is_promo_for_card_on_delivery &&
        //   !order_payment.is_payment_mode_card_on_delivery
        // ) {
        //   res.json({
        //     success: false,
        //     error_message:
        //       "This promo code can only be applied on card on delivery payment mode",
        //   });
        //   return;
        // }

        // if (
        //   promo.is_promo_for_online_payment &&
        //   !order_payment.is_payment_mode_online_payment
        // ) {
        //   res.json({
        //     success: false,
        //     error_message:
        //       "This promo code can only be applied on online payment mode",
        //   });
        //   return;
        // }
        let promo_payment;
        if (promo.promo_code_type === 1) {
          promo_payment = parseFloat(
            Math.round(
              (cart.total_cart_price * promo.promo_code_value * 0.01 +
                Number.EPSILON) *
                100
            ) / 100
          );
        } else {
          promo_payment = promo.promo_code_value;
        }
        if (
          promo.is_promo_have_max_discount_limit &&
          promo_payment > promo.promo_code_max_discount_amount
        ) {
          promo_payment = promo.promo_code_max_discount_amount;
        }
        // const delivery_fees = order_payment.total_delivery_price
        //   ? order_payment.total_delivery_price
        //   : 0;
        if (order_payment.loyalty_payment > 0) {
          await new Promise((res, rej) => {
            removeLoyaltyPoints(
              {
                body: {
                  order_payment_id: order_payment._id.toString(),
                  user_id: order_payment.user_id.toString(),
                },
              },
              {
                json: (data) => {
                  res(data);
                },
              }
            );
          });
          order_payment = await Order_payment.findOne({
            _id: order_payment_id,
          });
        }

        order_payment.user_pay_payment =
          order_payment.user_pay_payment - promo_payment;
        order_payment.promo_payment = promo_payment;

        promo.payment_apply_on.push(order_payment._id);
        promo.user_used.push(user._id);
        order_payment.promo_id = promo._id;

        if (!promo.used_promo_code) promo.used_promo_code = 1;
        else promo.used_promo_code++;
        await promo.save();
        await order_payment.save();
        console.log("promo.promo_code_name: " + promo.promo_code_name);
        user = await User.findOne({ _id: user_id });
        order_payment = await Order_payment.findOne({
          _id: order_payment_id,
        });

        res.json({
          success: true,
          message: USER_MESSAGE_CODE.PROMO_APPLY_SUCCESSFULLY,
          order_payment: {
            ...order_payment.toJSON(),
            promo_code_name: promo.promo_code_name,
          },
          loyalty_points: user.loyalty_points,
        });
      } catch (error) {
        res.json({
          success: false,
          error_message: error.message || "Something went wrong.",
        });
      }
    }
  );
};

exports.get_timeslot_delivery_fees = function (req, res, _, byPassToken = false) {
  console.log("get_timeslot_delivery_fees:>>>> " + JSON.stringify(req.body));
  utils.check_request_params(
    req.body,
    [
      { name: "order_payment_id", type: "string" },
      { name: "user_id", type: "string" },
      { name: "server_token", type: "string" },
    ],
    async function (response) {
      if (!response.success) {
        res.json(response);
        return;
      }
      const { user_id, server_token, order_payment_id } = req.body;

      const instant_delivery = req?.body?.instant_delivery;

      const selected_day = req?.body?.selected_day;

      const store_open_time = req?.body?.store_open_time;

      const store_close_time = req?.body?.store_close_time;

      const store_id = req?.body?.store_id;

      try {
        let user = await User.findOne({ _id: user_id });
        if (!user) {
          res.json({
            success: false,
            error_message: "User not found!",
          });
          return;
        }
        if (
          server_token !== null &&
          user.server_token !== server_token &&
          !byPassToken
        ) {
          res.json({
            success: false,
            error_message: "Invalid server token.",
          });
          return;
        }

        let order_payment = await Order_payment.findOne({
          _id: order_payment_id,
        });
        if (!order_payment) {
          res.json({
            success: false,
            error_message: "Order Payment not found!",
          });
          return;
        }

        //store timing logic
        let is_store_delivery_fees = false;
        let store_time;
        if (!instant_delivery) {
          let slot_delivery_fees;
          const store = await Store.findOne({ _id: store_id });
          is_store_delivery_fees = store.is_delivery_fees_from_store_timing;
          //check is_delivery_fees_from_store_timing
          if (store.is_delivery_fees_from_store_timing) {
            store_time = store.store_time;
            const day = store.store_time.find(
              (item) => item.day_name === selected_day
            );
            if (day) {
              const day_time = day.day_time.find(
                (time) =>
                  time.store_open_time === store_open_time &&
                  time.store_close_time === store_close_time
              );
              if (day_time) {
                slot_delivery_fees = Number(day_time.slot_delivery_fees);
                order_payment.total_delivery_price = slot_delivery_fees;
              }
            }
          }
        }

        res.json({
          success: true,
          order_payment: {
            ...order_payment.toJSON(),
            is_delivery_fees_from_store_timing: is_store_delivery_fees,
            store_time:store_time
          },
          message: "",
        });
      } catch (error) {
        res.json({
          success: false,
          error_message: error.message || "Something went wrong.",
        });
      }
    }
  );
};

exports.apply_loyalty_points = function (req, res) {
  console.log("apply_loyalty_points : >> " + JSON.stringify(req.body));
  utils.check_request_params(
    req.body,
    [
      { name: "order_payment_id", type: "string" },
      { name: "user_id", type: "string" },
    ],
    async function (response) {
      if (!response.success) {
        res.json(response);
      }
      const { order_payment_id, store_id, user_id } = req.body;
      let orderPayment = await Order_payment.findOne({
        _id: order_payment_id,
      });
      if (!orderPayment) {
        res.json({
          status: false,
          message: `No order payment found with this order_payment_id.`,
        });
        return;
      }
      const userId = orderPayment.user_id ? orderPayment.user_id : user_id;
      let user = await User.findOne({ _id: userId });

      if (user.loyalty_points <= 0) {
        res.json({
          status: false,
          message: `You don't have any loyalty points to apply.`,
        });
        return;
      }

      if (orderPayment.loyalty_payment > 0) {
        res.json({
          status: false,
          message: `Loyalty points already applied.`,
        });
        return;
      }
      if (user.loyalty_points <= 0) {
        res.json({
          status: false,
          message: `You don't have any loyalty points, order more to get it.`,
        });
        return;
      }

      const storeId = orderPayment.store_id ? orderPayment.store_id : store_id;
      const store = await Store.findOne({ _id: storeId });
      const setting = await Setting.findOne({});
      const minOrderForLoyalty = store.min_order_for_loyalty;
      if (orderPayment.user_pay_payment < minOrderForLoyalty) {
        const amount = minOrderForLoyalty - orderPayment.user_pay_payment;
        res.json({
          status: false,
          message: `You need to add ${amount}AED item(s) more to qualify for applying loyalty point(s). `,
        });
        return;
      }
      if (orderPayment.promo_id && orderPayment.promo_payment > 0) {
        await new Promise((res, rej) => {
          removePromoCode(
            {
              body: {
                order_payment_id: orderPayment._id.toString(),
              },
            },
            {
              json: (data) => {
                res(data);
              },
            }
          );
        });
        orderPayment = await Order_payment.findOne({
          _id: order_payment_id,
        });
      }

      let pointToRedeem = 0;
      if (setting.max_loyalty_per_order_to_redeem < user.loyalty_points) {
        pointToRedeem = setting.max_loyalty_per_order_to_redeem;
      } else {
        pointToRedeem = user.loyalty_points;
      }
      user.loyalty_points -= pointToRedeem;
      user.loyalty_points = parseFloat(user.loyalty_points.toFixed(2));
      await user.save();
      const is_amount_per_loyalty_to_redeem =
        setting.is_amount_per_loyalty_to_redeem
          ? setting.is_amount_per_loyalty_to_redeem
          : 0.5;
      orderPayment.loyalty_point = pointToRedeem;
      orderPayment.loyalty_payment =
        pointToRedeem * is_amount_per_loyalty_to_redeem;
      orderPayment.user_pay_payment -= orderPayment.loyalty_payment;
      await orderPayment.save();
      try {
        await loyaltyPoint.create({
          type: 1,
          user_id: orderPayment.user_id,
          order_payment_id: orderPayment._id,
          amount: orderPayment.loyalty_payment,
          points: orderPayment.loyalty_point,
          store_delivery_id: store.store_delivery_id,
        });
      } catch (error) {
        console.log("error:loyaltyPoint.create ", error);
      }
      res.json({
        status: true,
        message: `${pointToRedeem} Loyalty point applied successfully!`,
        loyalty_points: user.loyalty_points,
        order_payment: orderPayment,
      });
    }
  );
};

exports.get_store_promo_codes = function (req, res) {
  utils.check_request_params(
    req.body,
    [{ name: "store_id", type: "string" }],
    async function (response) {
      if (response.success) {
        var body = req.body;
        console.log("remove_promo_code >>>1");
        var codes = await Promo_code.aggregate([
          {
            $match: {
              is_active: true,
              promo_apply_on: mongoose.Types.ObjectId(body.store_id),
            },
          },
          {
            $project: {
              _id: 0,
              is_active: 1,
              is_approved: 1,
              promo_details: 1,
              promo_code_name: 1,
              created_id: 1,
              promo_start_date: 1,
              promo_expire_date: 1,
              used_promo_code: 1,
              is_promo_have_minimum_amount_limit: 1,
              promo_code_apply_on_minimum_amount: 1,
              is_promo_user_required_uses: 1,
              promo_user_code_uses: 1,
              promo_code_uses: 1,
              promo_code_max_discount_amount: 1,
              is_promo_have_max_discount_limit: 1,
              promo_start_date: 1,
              promo_expire_date: 1,
            },
          },
        ]);
        res.json({
          data: codes,
          success: true,
        });
      } else {
        res.json(response);
      }
    }
  );
};
