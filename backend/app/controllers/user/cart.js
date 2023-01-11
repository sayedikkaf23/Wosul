require("../../utils/message_code");
require("../../utils/error_code");
require("../../utils/push_code");
require("../../utils/constants");
const { Checkout } = require("checkout-sdk-node");
var User = require("mongoose").model("user");
var Provider = require("mongoose").model("provider");
var Store = require("mongoose").model("store");
var Order_payment = require("mongoose").model("order_payment");
var Cart = require("mongoose").model("cart");
var Card = require("mongoose").model("card");
var Country = require("mongoose").model("country");
var City = require("mongoose").model("city");
var Payment_gateway = require("mongoose").model("payment_gateway");
var Promo_code = require("mongoose").model("promo_code");
var utils = require("../../utils/utils");
var my_cart = require("../../controllers/user/cart");
var Installation_setting = require("mongoose").model("installation_setting");
var geolib = require("geolib");
var console = require("../../utils/console");
const { remove_loyalty_and_promo_both, apply_promo } = require("./promo_code");
const { setUseRadiusZone } = require("../../services/user.service");
const { getCart } = require("../../services/cart.service");
var Product = require("mongoose").model("product");
var Item = require("mongoose").model("item");
const UserSetting = require("../../models/user/user_setting");
const paymentDetails = require("../../models/admin/payment_details");
const moment = require("moment");
const card = require("../../models/user/card");

// user add_item_in_cart
exports.add_item_in_cart = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "pickup_addresses" }, { name: "destination_addresses" }],
    async function (response) {
      if (response.success) {
        console.log("add_item_in_cart >>>" + JSON.stringify(request_data.body));
        var request_data_body = request_data.body;
        var cart_unique_token = request_data_body.cart_unique_token;
        var user_type = Number(request_data_body.user_type);
        if (request_data_body.user_id == "") {
          request_data_body.user_id = null;
        }
        const user = await User.findOne({ _id: request_data_body.user_id });
        if (
          user &&
          request_data_body.server_token !== null &&
          user.server_token !== request_data_body.server_token
        ) {
          response_data.json({
            success: false,
            error_code: ERROR_CODE.INVALID_SERVER_TOKEN,
          });
        } else {
          var cart_id = null;
          if (request_data_body.cart_id != undefined) {
            cart_id = request_data_body.cart_id;
          } else {
            cart_id = null;
          }
          var user_id = null;

          var delivery_type = DELIVERY_TYPE.STORE;
          if (request_data_body.delivery_type) {
            delivery_type = request_data_body.delivery_type;
          }
          if (delivery_type == DELIVERY_TYPE.COURIER) {
            request_data_body.store_id = null;
          }
          const store = await Store.findOne({
            _id: request_data_body.store_id,
            is_business: true,
          });
          // if (store) {
          var country_id = request_data_body.country_id;
          var city_id = request_data_body.city_id;
          var store_id = null;
          if (
            !["", null, undefined].includes(request_data_body.min_order_price)
          ) {
            store.min_order_price = request_data_body.min_order_price;
            store.save();
          }

          if (store) {
            country_id = store.country_id;
            city_id = store.city_id;
            store_id = store._id;

            request_data_body.pickup_addresses[0].address = store.address;
            request_data_body.pickup_addresses[0].location = store.location;
            request_data_body.pickup_addresses[0].user_details.country_phone_code =
              store.country_phone_code;
            request_data_body.pickup_addresses[0].user_details.email =
              store.email;
            request_data_body.pickup_addresses[0].user_details.name =
              store.name;
            request_data_body.pickup_addresses[0].user_details.phone =
              store.phone;
          }
          const country_detail = await Country.findOne({ _id: country_id });
          var country_phone_code = "";
          var wallet_currency_code = "";
          var country_code = "";

          if (country_detail) {
            country_id = country_detail._id;
            country_phone_code = country_detail.country_phone_code;
            wallet_currency_code = country_detail.currency_code;
            country_code = country_detail.country_code;
          }

          var phone =
            request_data_body.destination_addresses[0].user_details.phone;
          var email =
            request_data_body.destination_addresses[0].user_details.email;
          var query = { $or: [{ email: email }, { phone: phone }] };
          const user_phone_data = await User.findOne(query);
          if (
            user_type == ADMIN_DATA_ID.STORE &&
            request_data_body.destination_addresses.length > 0
          ) {
            if (user_phone_data) {
              user_phone_data.cart_id = cart_id;
              user_phone_data.save();
              user = user_phone_data;
            } else {
              var server_token = utils.generateServerToken(32);
              var password = "123456";
              password = utils.encryptPassword(password);

              var first_name =
                request_data_body.destination_addresses[0].user_details.name.trim();
              if (
                first_name != "" &&
                first_name != undefined &&
                first_name != null
              ) {
                first_name =
                  first_name.charAt(0).toUpperCase() + first_name.slice(1);
              } else {
                first_name = "";
              }
              var referral_code = await utils.generateReferralCode(phone);
              var user_data = new User({
                user_type: ADMIN_DATA_ID.STORE,
                admin_type: ADMIN_DATA_ID.USER,
                first_name: first_name,
                email: email,
                password: password,
                country_phone_code: country_phone_code,
                phone: phone,
                country_id: country_id,
                server_token: server_token,
                referral_code: referral_code,
                wallet_currency_code: wallet_currency_code,
                cart_id: cart_id,
              });
              user_id = user_data._id;
              cart_id = user_data.cart_id;
              cart_unique_token = null;

              utils.insert_documets_for_new_users(
                user_data,
                null,
                ADMIN_DATA_ID.USER,
                country_id,
                function (document_response) {
                  user_data.is_document_uploaded =
                    document_response.is_document_uploaded;
                  user_data.save();
                  user = user_data;
                }
              );
            }
          }

          if (user) {
            cart_id = user.cart_id;
            user_id = user._id;
            cart_unique_token = null;
          }
          items = request_data_body.order_details[0].items;
          console.log(">>>>> item >>>");
          console.log(items);
          if (items) {
            for (let i = 0; i < items.length; i++) {
              const item = await Item.findOne({
                _id: items[i].item_id,
              });
              if (item) {
                item.note_for_item = items[i].note_for_item;
                await item.save();
              }
            }
          }
          const cart = await Cart.findOne({
            $or: [{ _id: cart_id }, { cart_unique_token: cart_unique_token }],
          });
          if (
            cart &&
            (!cart.store_id || cart.store_id.equals(store_id) || !store_id)
          ) {
            if (
              request_data_body.user_id != "" &&
              request_data_body.user_id != null
            ) {
              cart.cart_unique_token = "";
            }
            cart.delivery_type = delivery_type;
            cart.user_id = user_id;
            cart.user_type_id = user_id;
            cart.user_type = request_data_body.user_type;
            cart.city_id = city_id;
            cart.destination_addresses =
              request_data_body.destination_addresses;
            cart.order_details = request_data_body.order_details;
            cart.pickup_addresses = request_data_body.pickup_addresses;
            cart.store_id = store_id;

            var total_cart_price = request_data_body.total_cart_price;
            var total_item_tax = 0;
            cart.total_cart_price = total_cart_price;

            if (store) {
              if (store.is_use_item_tax) {
                if (request_data_body.total_item_tax) {
                  total_item_tax = request_data_body.total_item_tax;
                }
              } else {
                if (total_cart_price) {
                  total_item_tax = total_cart_price * store.item_tax * 0.01;
                } else {
                  total_cart_price = 0;
                }
              }
            }

            total_item_tax = utils.precisionRoundTwo(Number(total_item_tax));
            cart.total_item_tax = total_item_tax;
            cart.save().then(
              () => {
                response_data.json({
                  success: true,
                  message: CART_MESSAGE_CODE.CART_UPDATED_SUCCESSFULLY,
                  cart_id: cart._id,
                  city_id: city_id,
                  user_id: user_id,
                });
              },
              (error) => {
                response_data.json({
                  success: false,
                  error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                });
              }
            );

            //response_data.json({success: false, error_code: STORE_ERROR_CODE.MISMATCH_STORE_ID});
          } else {
            var total_cart_price = request_data_body.total_cart_price;
            var total_item_tax = 0;
            if (store) {
              if (store.is_use_item_tax) {
                if (request_data_body.total_item_tax) {
                  total_item_tax = request_data_body.total_item_tax;
                }
              } else {
                if (total_cart_price) {
                  total_item_tax = total_cart_price * store.item_tax * 0.01;
                } else {
                  total_cart_price = 0;
                }
              }
            }

            total_item_tax = utils.precisionRoundTwo(Number(total_item_tax));

            var new_cart = new Cart({
              cart_unique_token: request_data_body.cart_unique_token,
              user_id: user_id,
              user_type: request_data_body.user_type,
              delivery_type: delivery_type,
              user_type_id: user_id,
              store_id: store_id,
              order_payment_id: null,
              order_id: null,
              city_id: city_id,
              pickup_addresses: request_data_body.pickup_addresses,
              destination_addresses: request_data_body.destination_addresses,
              order_details: request_data_body.order_details,
              total_cart_price: total_cart_price,
              total_item_tax: total_item_tax,
            });

            if (
              request_data_body.user_id != "" &&
              request_data_body.user_id != undefined
            ) {
              new_cart.cart_unique_token = "";
            }

            new_cart.save().then(
              () => {
                if (user) {
                  user.cart_id = new_cart._id;
                  user.save();
                }

                response_data.json({
                  success: true,
                  message: CART_MESSAGE_CODE.CART_ADDED_SUCCESSFULLY,
                  cart_id: new_cart._id,
                  city_id: city_id,
                  user_id: user_id,
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
          // } else
          // {
          //     response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_BUSINESS_OFF});
          // }
        }
      } else {
        response_data.json(response);
      }
    }
  );
};

const checkPromo = async (cart) => {
  try {
    const order_payment = await Order_payment.findById(cart.order_payment_id);
    if (order_payment) {
      const promoId = order_payment.promo_id;
      await remove_loyalty_and_promo_both(order_payment);
      if (promoId) {
        const promo = await Promo_code.findById(promoId);
        if (promo) {
          await new Promise((res, rej) => {
            apply_promo(
              {
                body: {
                  order_payment_id: order_payment._id.toString(),
                  promo_code_name: promo.promo_code_name,
                  user_id: order_payment.user_id.toString(),
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
        }
      }
    }
    // if (order_payment && order_payment.promo_id) {
    //   const promo = await Promo_code.findById(order_payment.promo_id);
    //   if (
    //     (promo.is_promo_have_minimum_amount_limit &&
    //       cart.total_cart_price <= promo.promo_code_apply_on_minimum_amount) ||
    //     !promo.is_promo_have_minimum_amount_limit
    //   ) {
    //     await new Promise((res, rej) => {
    //       remove_promo_code(
    //         {
    //           body: {
    //             order_payment_id: order_payment._id.toString(),
    //           },
    //         },
    //         {
    //           json: (data) => {
    //             res(data);
    //           },
    //         }
    //       );
    //     });
    //   }
    // }
  } catch (e) {
    console.log("e: " + e);
  }
};

const getTotalItemPrice = (items) => {
  // let totalItemTax = 0;
  let totalItemPrice = 0;
  items.forEach((item) => {
    // totalItemTax += item?.total_item_tax
    //   ? item?.total_item_tax * item?.quantity
    //   : 0;
    const price = item.price || item.item_price || item.total_price;
    totalItemPrice += price ? price * item.quantity : 0;
  });
  return totalItemPrice;
};

const getTotalCartPrice = (orderDetails = []) => {
  let totalCartPrice = 0;
  orderDetails.forEach((det) => {
    det.total_item_price = getTotalItemPrice(det.items);
    totalCartPrice += det.total_item_price || 0;
  });
  return totalCartPrice;
};

exports.create_and_update_cart = async function (req, res) {
  let {
    user_id,
    cart_unique_token,
    store_id,
    user_type,
    total_cart_price,
    total_item_tax,
    destination_addresses,
    pickup_addresses,
    order_details,
    delivery_type,
  } = req.body;
  console.log("create_and_update_cart: >>>" + JSON.stringify(req.body));
  delivery_type = delivery_type ? delivery_type : DELIVERY_TYPE.STORE;
  cart_unique_token = cart_unique_token == "" ? null : cart_unique_token;
  user_id = user_id == "" ? null : user_id;
  const user = await User.findOne({ _id: user_id });
  const cart_id = user && user.cart_id ? user.cart_id : null;
  const cart = await Cart.findOne({
    $or: [{ _id: cart_id }, { cart_unique_token: cart_unique_token }],
  });
  const store = await Store.findOne({
    _id: store_id,
    is_business: true,
  });
  if (!store) {
    res.json({
      success: false,
      error_message: "Store not found",
    });
    return;
  }
  if (!destination_addresses || !destination_addresses.length) {
    res.json({
      success: false,
      error_message: "Destination addresses not selected.",
    });
    return;
  }
  country_id = store.country_id;
  city_id = store.city_id;
  store_id = store._id;
  if (!pickup_addresses || !pickup_addresses.length) {
    pickup_addresses = [{}];
  }
  pickup_addresses[0].address = store.address;
  pickup_addresses[0].location = store.location;
  pickup_addresses[0].user_details.country_phone_code =
    store.country_phone_code;
  pickup_addresses[0].user_details.email = store.email;
  pickup_addresses[0].user_details.name = store.name;
  pickup_addresses[0].user_details.phone = store.phone;
  total_cart_price = getTotalCartPrice(order_details);
  if (store.is_use_item_tax) {
    total_item_tax = total_item_tax ? total_item_tax : 0;
  } else {
    if (total_cart_price) {
      total_item_tax = total_cart_price * store.item_tax * 0.01;
    } else {
      total_cart_price = 0;
    }
  }
  if (user_id != "" && user_id != null) {
    cart_unique_token = "";
  }

  if (cart) {
    cart.cart_unique_token = cart_unique_token;
    cart.delivery_type = delivery_type;
    cart.user_id = user_id;
    cart.user_type_id = user_id;
    cart.user_type = user_type;
    cart.city_id = city_id;
    cart.destination_addresses = destination_addresses;
    cart.order_details = order_details;
    cart.pickup_addresses = pickup_addresses;
    cart.store_id = store_id;
    cart.total_cart_price = total_cart_price;

    total_item_tax = utils.precisionRoundTwo(Number(total_item_tax));
    cart.total_item_tax = total_item_tax;
    await cart.save();
    await checkPromo(cart);
    res.json({
      success: true,
      message: CART_MESSAGE_CODE.CART_UPDATED_SUCCESSFULLY,
      cart_id: cart._id,
      cart: cart,
      cart_unique_token,
    });
  } else {
    const new_cart = new Cart({
      cart_unique_token: cart_unique_token,
      user_id: user_id,
      user_type: user_type,
      delivery_type: delivery_type,
      user_type_id: user_id,
      store_id: store_id,
      order_payment_id: null,
      order_id: null,
      city_id: store.city_id,
      pickup_addresses: pickup_addresses,
      destination_addresses: destination_addresses,
      order_details: order_details,
      total_cart_price: total_cart_price,
      total_item_tax: total_item_tax,
    });
    await new_cart.save();
    if (order_details.length) {
      if (order_details[0].items && order_details[0].items.length) {
        const item = order_details[0].items[0];
        if (item && item.SkuCode) {
          const order_payment = await Order_payment.create({
            cart_id: new_cart._id,
            user_pay_payment: item.total_price
              ? item.total_price
              : item.SendValue,
            store_id,
            is_payment_mode_online_payment: true,
            is_payment_mode_cash: false,
            is_payment_mode_card_on_delivery: false,
          });
          new_cart.order_payment_id = order_payment._id;
          new_cart.save();
        }
      }
    }
    if (user) {
      user.cart_id = new_cart._id;
      user.save();
    }
    res.json({
      success: true,
      message: CART_MESSAGE_CODE.CART_ADDED_SUCCESSFULLY,
      cart_id: new_cart._id,
      new_cart,
    });
  }
};

exports.add_update_item_in_cart_v2 = async function (req, res) {
  let {
    user_id,
    cart_unique_token,
    store_id,
    total_cart_price,
    order_details,
    delivery_type,
  } = req.body;
  console.log("add_update_item_in_cart_v2: >>>" + JSON.stringify(req.body));
  delivery_type = delivery_type ? delivery_type : DELIVERY_TYPE.STORE;
  cart_unique_token = cart_unique_token == "" ? null : cart_unique_token;
  user_id = user_id == "" ? null : user_id;
  const user = await User.findOne({ _id: user_id });
  const cart_id = user && user.cart_id ? user.cart_id : null;
  const cart = await Cart.findOne({
    $or: [{ _id: cart_id }, { cart_unique_token: cart_unique_token }],
  });
  const store = await Store.findOne({
    _id: store_id,
    is_business: true,
  });
  if (!store) {
    res.json({
      success: false,
      error_code: "",
      message: "Store not found",
    });
    return;
  }
  country_id = store.country_id;
  city_id = store.city_id;
  store_id = store._id;
  if (user_id != "" && user_id != null) {
    cart_unique_token = "";
  }

  if (cart) {
    cart.cart_unique_token = cart_unique_token;
    cart.delivery_type = delivery_type;
    cart.user_id = user_id;
    cart.city_id = city_id;
    cart.order_details = order_details;
    cart.store_id = store_id;
    cart.total_cart_price = total_cart_price;
    cart.save();
    res.json({
      success: true,
      message: CART_MESSAGE_CODE.CART_UPDATED_SUCCESSFULLY,
      cart_id: cart._id,
      cart: cart,
      cart_unique_token,
    });
  } else {
    const new_cart = new Cart({
      cart_unique_token: cart_unique_token,
      user_id: user_id,
      delivery_type: delivery_type,
      store_id: store_id,
      order_payment_id: null,
      order_id: null,
      city_id: store.city_id,
      order_details: order_details,
      total_cart_price: total_cart_price,
    });
    await new_cart.save();
    if (user) {
      user.cart_id = new_cart._id;
      user.save();
    }
    res.json({
      success: true,
      message: CART_MESSAGE_CODE.CART_ADDED_SUCCESSFULLY,
      cart_id: new_cart._id,
      new_cart,
    });
  }
};

exports.ramadan_add_item_in_cart = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "pickup_addresses" }, { name: "destination_addresses" }],
    async function (response) {
      if (response.success) {
        console.log("ramadan_cart00 >>>" + JSON.stringify(request_data.body));
        var request_data_body = request_data.body;
        var cart_unique_token = request_data_body.cart_unique_token;
        var user_type = Number(request_data_body.user_type);
        if (request_data_body.user_id == "") {
          request_data_body.user_id = null;
        }
        const user = await User.findOne({ _id: request_data_body.user_id });
        var serverToken = request_data_body.f
          ? request_data_body.f
          : request_data_body.server_token;

        if (user && serverToken !== null && user.server_token !== serverToken) {
          response_data.json({
            success: false,
            error_code: ERROR_CODE.INVALID_SERVER_TOKEN,
          });
        } else {
          var cart_id = null;
          if (request_data_body.cart_id != undefined) {
            cart_id = request_data_body.cart_id;
          } else {
            cart_id = null;
          }
          var user_id = null;

          var delivery_type = DELIVERY_TYPE.STORE;
          if (request_data_body.delivery_type) {
            delivery_type = request_data_body.delivery_type;
          }
          if (delivery_type == DELIVERY_TYPE.COURIER) {
            request_data_body.store_id = null;
          }

          const store = await Store.findOne({
            _id: request_data_body.store_id,
            is_business: true,
          });
          if (store) {
            // if (store) {
            var country_id = request_data_body.country_id;
            var city_id = request_data_body.city_id;
            var store_id = null;
            if (
              !["", null, undefined].includes(request_data_body.min_order_price)
            ) {
              store.min_order_price = request_data_body.min_order_price;
              store.save();
            }

            if (store) {
              country_id = store.country_id;
              city_id = store.city_id;
              store_id = store._id;

              request_data_body.pickup_addresses[0].address = store.address;
              request_data_body.pickup_addresses[0].location = store.location;
              request_data_body.pickup_addresses[0].user_details.country_phone_code =
                store.country_phone_code;
              request_data_body.pickup_addresses[0].user_details.email =
                store.email;
              request_data_body.pickup_addresses[0].user_details.name =
                store.name;
              request_data_body.pickup_addresses[0].user_details.phone =
                store.phone;
            }

            const country_detail = await Country.findOne({ _id: country_id });
            var country_phone_code = "";
            var wallet_currency_code = "";
            var country_code = "";
            if (country_detail) {
              if (country_detail) {
                country_id = country_detail._id;
                country_phone_code = country_detail.country_phone_code;
                wallet_currency_code = country_detail.currency_code;
                country_code = country_detail.country_code;
              }

              var phone =
                request_data_body.destination_addresses[0].user_details.phone;
              var email =
                request_data_body.destination_addresses[0].user_details.email;
              var query = { $or: [{ email: email }, { phone: phone }] };

              User.findOne(query).then(
                async (user_phone_data) => {
                  if (
                    user_type == ADMIN_DATA_ID.STORE &&
                    request_data_body.destination_addresses.length > 0
                  ) {
                    if (user_phone_data) {
                      user_phone_data.cart_id = cart_id;
                      user_phone_data.save();
                      user = user_phone_data;
                    } else {
                      var server_token = utils.generateServerToken(32);
                      var password = "123456";
                      password = utils.encryptPassword(password);

                      var first_name =
                        request_data_body.destination_addresses[0].user_details.name.trim();
                      if (
                        first_name != "" &&
                        first_name != undefined &&
                        first_name != null
                      ) {
                        first_name =
                          first_name.charAt(0).toUpperCase() +
                          first_name.slice(1);
                      } else {
                        first_name = "";
                      }
                      var referral_code = await utils.generateReferralCode(
                        phone
                      );
                      var user_data = new User({
                        user_type: ADMIN_DATA_ID.STORE,
                        admin_type: ADMIN_DATA_ID.USER,
                        first_name: first_name,
                        email: email,
                        password: password,
                        country_phone_code: country_phone_code,
                        phone: phone,
                        country_id: country_id,
                        server_token: server_token,
                        referral_code: referral_code,
                        wallet_currency_code: wallet_currency_code,
                        cart_id: cart_id,
                      });
                      user_id = user_data._id;
                      cart_id = user_data.cart_id;
                      cart_unique_token = null;

                      utils.insert_documets_for_new_users(
                        user_data,
                        null,
                        ADMIN_DATA_ID.USER,
                        country_id,
                        function (document_response) {
                          user_data.is_document_uploaded =
                            document_response.is_document_uploaded;
                          user_data.save();
                          user = user_data;
                        }
                      );
                    }
                  }

                  if (user) {
                    cart_id = user.cart_id;
                    user_id = user._id;
                    cart_unique_token = null;
                  }

                  Cart.findOne({
                    $or: [
                      { _id: cart_id },
                      { cart_unique_token: cart_unique_token },
                    ],
                  }).then(
                    async (cart) => {
                      if (
                        cart &&
                        (!cart.store_id ||
                          cart.store_id.equals(store_id) ||
                          !store_id)
                      ) {
                        if (
                          request_data_body.user_id != "" &&
                          request_data_body.user_id != null
                        ) {
                          cart.cart_unique_token = "";
                        }
                        var total_item_count = 0;
                        var order_details = {};
                        var categories =
                          request_data_body.order_object.package_id;
                        var quantities =
                          request_data_body.order_object.quantity;
                        var products = [];
                        var items = [];
                        var total_cart_price = 0;
                        for (let i = 0; i < categories.length; i++) {
                          if (categories[i]) {
                            var product = await Product.findOne({
                              category_id: categories[i],
                            });
                            products.push(product);
                          }
                        }

                        for (let i = 0; i < products.length; i++) {
                          if (products[i]) {
                            var item = await Item.find({
                              product_id: products[i]._id,
                            });
                            item.forEach((item) => {
                              var ordered_item = {
                                details: item.details,
                                image_url: item.image_url,
                                item_id: item._id,
                                item_name: item.name,
                                note_for_item: item.note_for_item,
                                specifications: item.specifications
                                  ? item.specifications
                                  : [],
                                item_price: item.price,
                                item_tax: item.tax,
                                max_item_quantity: item.max_item_quantity,
                                quantity: quantities[i],
                                total_item_price: quantities[i] * item.price,
                                total_item_tax: 0,
                                total_item_price: quantities[i] * item.price,
                                total_specification_price: 0,
                                total_specification_tax: 0,
                                total_tax: 0,
                                unique_id: item.unique_id,
                                unique_id_for_store_data:
                                  item.unique_id_for_store_data,
                              };
                              total_item_count = total_item_count + 1;
                              total_cart_price =
                                total_cart_price + quantities[i] * item.price;
                              items.push(ordered_item);
                            });
                          }
                        }
                        order_details.items = items;

                        cart.delivery_type = delivery_type;
                        cart.user_id = user_id;
                        cart.user_type_id = user_id;
                        cart.user_type = request_data_body.user_type;
                        cart.city_id = city_id;
                        cart.destination_addresses =
                          request_data_body.destination_addresses;
                        cart.order_details = order_details;
                        cart.pickup_addresses =
                          request_data_body.pickup_addresses;
                        cart.store_id = store_id;
                        var total_item_tax = 0;
                        cart.total_cart_price = total_cart_price;
                        cart.total_item_count = total_item_count;
                        cart.is_ramadan_order = true;
                        if (store) {
                          if (store.is_use_item_tax) {
                            if (request_data_body.total_item_tax) {
                              total_item_tax = request_data_body.total_item_tax;
                            }
                          } else {
                            if (total_cart_price) {
                              total_item_tax =
                                total_cart_price * store.item_tax * 0.01;
                            } else {
                              total_cart_price = 0;
                            }
                          }
                        }

                        total_item_tax = utils.precisionRoundTwo(
                          Number(total_item_tax)
                        );
                        cart.total_item_tax = total_item_tax;
                        Cart.updateOne({ _id: cart_id }, { $set: cart }).then(
                          () => {
                            response_data.json({
                              success: true,
                              message:
                                CART_MESSAGE_CODE.CART_UPDATED_SUCCESSFULLY,
                              cart_id: cart._id,
                              city_id: city_id,
                              user_id: user_id,
                              cart,
                            });
                          },
                          (error) => {
                            console.log("ramadan_cart api1", error);
                            response_data.json({
                              success: false,
                              error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                            });
                          }
                        );

                        //response_data.json({success: false, error_code: STORE_ERROR_CODE.MISMATCH_STORE_ID});
                      } else {
                        var total_cart_price = 0;

                        var total_item_tax = 0;
                        if (store) {
                          if (store.is_use_item_tax) {
                            if (request_data_body.total_item_tax) {
                              total_item_tax = request_data_body.total_item_tax;
                            }
                          } else {
                            if (total_cart_price) {
                              total_item_tax =
                                total_cart_price * store.item_tax * 0.01;
                            } else {
                              total_cart_price = 0;
                            }
                          }
                        }
                        var total_item_count = 0;
                        var order_details = {};
                        var categories =
                          request_data_body.order_object.package_id;
                        var quantities =
                          request_data_body.order_object.quantity;
                        var products = [];
                        var items = [];
                        for (let i = 0; i < categories.length; i++) {
                          if (categories[i]) {
                            var product = await Product.findOne({
                              category_id: categories[i],
                            });
                            products.push(product);
                          }
                        }

                        for (let i = 0; i < products.length; i++) {
                          if (products[i]) {
                            var item = await Item.find({
                              product_id: products[i]._id,
                            });
                            item.forEach((item) => {
                              var ordered_item = {
                                details: item.details,
                                image_url: item.image_url,
                                item_id: item._id,
                                item_name: item.name,
                                note_for_item: item.note_for_item,
                                specifications: item.specifications
                                  ? item.specifications
                                  : [],
                                item_price: item.price,
                                item_tax: item.tax,
                                max_item_quantity: item.max_item_quantity,
                                quantity: quantities[i],
                                total_item_price: quantities[i] * item.price,
                                total_item_tax: 0,
                                total_item_price: quantities[i] * item.price,
                                total_specification_price: 0,
                                total_specification_tax: 0,
                                total_tax: 0,
                                unique_id: item.unique_id,
                                unique_id_for_store_data:
                                  item.unique_id_for_store_data,
                              };
                              total_item_count = total_item_count + 1;
                              total_cart_price =
                                total_cart_price + quantities[i] * item.price;
                              items.push(ordered_item);
                            });
                          }
                        }
                        order_details.items = items;

                        total_item_tax = utils.precisionRoundTwo(
                          Number(total_item_tax)
                        );

                        var cart = new Cart({
                          cart_unique_token:
                            request_data_body.cart_unique_token,
                          user_id: user_id,
                          user_type: request_data_body.user_type,
                          delivery_type: delivery_type,
                          user_type_id: user_id,
                          store_id: store_id,
                          order_payment_id: null,
                          order_id: null,
                          city_id: city_id,
                          pickup_addresses: request_data_body.pickup_addresses,
                          destination_addresses:
                            request_data_body.destination_addresses,
                          order_details: order_details,
                          total_cart_price: total_cart_price,
                          total_item_tax: total_item_tax,
                          total_item_count: total_item_count,
                          is_ramadan_order: true,
                        });

                        if (
                          request_data_body.user_id != "" &&
                          request_data_body.user_id != undefined
                        ) {
                          cart.cart_unique_token = "";
                        }

                        cart.save().then(
                          () => {
                            if (user) {
                              user.cart_id = cart._id;
                              user.save();
                            }

                            response_data.json({
                              success: true,
                              message:
                                CART_MESSAGE_CODE.CART_ADDED_SUCCESSFULLY,
                              cart_id: cart._id,
                              city_id: city_id,
                              user_id: user_id,
                              cart,
                            });
                          },
                          (error) => {
                            console.log(
                              "ramadan_cart api2" + JSON.stringify(error)
                            );
                            response_data.json({
                              success: false,
                              error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                            });
                          }
                        );
                      }
                    },
                    (error) => {
                      console.log("ramadan_cart api3", error);
                      response_data.json({
                        success: false,
                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                      });
                    }
                  );
                },
                (error) => {
                  console.log("ramadan_cart api4", error);
                  response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                  });
                }
              );
            } else {
              console.log("ramadan_cart api5");
              response_data.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
              });
            }
            // } else
            // {
            //     response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_BUSINESS_OFF});
            // }
          } else {
            console.log("ramadan_cart api6");
            response_data.json({
              success: false,
              error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
            });
          }
        }
      } else {
        console.log("ramadan_cart api7");
        response_data.json(response);
      }
    }
  );
};

exports.add_item_in_ramadan_cart = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "pickup_addresses" }, { name: "destination_addresses" }],
    async function (response) {
      if (response.success) {
        console.log("ramadan_cart >>>" + JSON.stringify(request_data.body));
        var request_data_body = request_data.body;
        var cart_unique_token = request_data_body.cart_unique_token;
        var user_type = Number(request_data_body.user_type);
        if (request_data_body.user_id == "") {
          request_data_body.user_id = null;
        }
        const user = await User.findOne({ _id: request_data_body.user_id });

        if (
          user &&
          request_data_body.server_token !== null &&
          user.server_token !== request_data_body.server_token
        ) {
          response_data.json({
            success: false,
            error_code: ERROR_CODE.INVALID_SERVER_TOKEN,
          });
        } else {
          var cart_id = null;
          if (request_data_body.cart_id != undefined) {
            cart_id = request_data_body.cart_id;
          } else {
            cart_id = null;
          }
          var user_id = null;

          var delivery_type = DELIVERY_TYPE.STORE;
          if (request_data_body.delivery_type) {
            delivery_type = request_data_body.delivery_type;
          }
          if (delivery_type == DELIVERY_TYPE.COURIER) {
            request_data_body.store_id = null;
          }

          const store = await Store.findOne({
            _id: request_data_body.store_id,
            is_business: true,
          });
          if (store) {
            // if (store) {
            var country_id = request_data_body.country_id;
            var city_id = request_data_body.city_id;
            var store_id = null;
            if (
              !["", null, undefined].includes(request_data_body.min_order_price)
            ) {
              store.min_order_price = request_data_body.min_order_price;
              store.save();
            }

            if (store) {
              country_id = store.country_id;
              city_id = store.city_id;
              store_id = store._id;

              request_data_body.pickup_addresses[0].address = store.address;
              request_data_body.pickup_addresses[0].location = store.location;
              request_data_body.pickup_addresses[0].user_details.country_phone_code =
                store.country_phone_code;
              request_data_body.pickup_addresses[0].user_details.email =
                store.email;
              request_data_body.pickup_addresses[0].user_details.name =
                store.name;
              request_data_body.pickup_addresses[0].user_details.phone =
                store.phone;
            }

            const country_detail = await Country.findOne({ _id: country_id });
            var country_phone_code = "";
            var wallet_currency_code = "";
            var country_code = "";
            if (country_detail) {
              if (country_detail) {
                country_id = country_detail._id;
                country_phone_code = country_detail.country_phone_code;
                wallet_currency_code = country_detail.currency_code;
                country_code = country_detail.country_code;
              }

              var phone =
                request_data_body.destination_addresses[0].user_details.phone;
              var email =
                request_data_body.destination_addresses[0].user_details.email;
              var query = { $or: [{ email: email }, { phone: phone }] };

              User.findOne(query).then(
                async (user_phone_data) => {
                  if (
                    user_type == ADMIN_DATA_ID.STORE &&
                    request_data_body.destination_addresses.length > 0
                  ) {
                    if (user_phone_data) {
                      user_phone_data.cart_id = cart_id;
                      user_phone_data.save();
                      user = user_phone_data;
                    } else {
                      var server_token = utils.generateServerToken(32);
                      var password = "123456";
                      password = utils.encryptPassword(password);

                      var first_name =
                        request_data_body.destination_addresses[0].user_details.name.trim();
                      if (
                        first_name != "" &&
                        first_name != undefined &&
                        first_name != null
                      ) {
                        first_name =
                          first_name.charAt(0).toUpperCase() +
                          first_name.slice(1);
                      } else {
                        first_name = "";
                      }
                      var referral_code = await utils.generateReferralCode(
                        phone
                      );
                      var user_data = new User({
                        user_type: ADMIN_DATA_ID.STORE,
                        admin_type: ADMIN_DATA_ID.USER,
                        first_name: first_name,
                        email: email,
                        password: password,
                        country_phone_code: country_phone_code,
                        phone: phone,
                        country_id: country_id,
                        server_token: server_token,
                        referral_code: referral_code,
                        wallet_currency_code: wallet_currency_code,
                        cart_id: cart_id,
                      });
                      user_id = user_data._id;
                      cart_id = user_data.cart_id;
                      cart_unique_token = null;

                      utils.insert_documets_for_new_users(
                        user_data,
                        null,
                        ADMIN_DATA_ID.USER,
                        country_id,
                        function (document_response) {
                          user_data.is_document_uploaded =
                            document_response.is_document_uploaded;
                          user_data.save();
                          user = user_data;
                        }
                      );
                    }
                  }

                  if (user) {
                    cart_id = user.cart_id;
                    user_id = user._id;
                    cart_unique_token = null;
                  }

                  Cart.findOne({
                    $or: [
                      { _id: cart_id },
                      { cart_unique_token: cart_unique_token },
                    ],
                  }).then(
                    async (cart) => {
                      if (
                        cart &&
                        (!cart.store_id ||
                          cart.store_id.equals(store_id) ||
                          !store_id)
                      ) {
                        if (
                          request_data_body.user_id != "" &&
                          request_data_body.user_id != null
                        ) {
                          cart.cart_unique_token = "";
                        }
                        var total_item_count = 0;
                        var order_details = {};
                        var categories =
                          request_data_body.order_object.package_id;
                        var quantities =
                          request_data_body.order_object.quantity;
                        var products = [];
                        var items = [];
                        var total_cart_price = 0;
                        for (let i = 0; i < categories.length; i++) {
                          if (categories[i]) {
                            var product = await Product.findOne({
                              category_id: categories[i],
                            });
                            products.push(product);
                          }
                        }

                        for (let i = 0; i < products.length; i++) {
                          if (products[i]) {
                            var item = await Item.find({
                              product_id: products[i]._id,
                            });
                            item.forEach((item) => {
                              var ordered_item = {
                                details: item.details,
                                image_url: item.image_url,
                                item_id: item._id,
                                item_name: item.name,
                                note_for_item: item.note_for_item,
                                specifications: item.specifications
                                  ? item.specifications
                                  : [],
                                item_price: item.price,
                                item_tax: item.tax,
                                max_item_quantity: item.max_item_quantity,
                                quantity: quantities[i],
                                total_item_price: quantities[i] * item.price,
                                total_item_tax: 0,
                                total_item_price: quantities[i] * item.price,
                                total_specification_price: 0,
                                total_specification_tax: 0,
                                total_tax: 0,
                                unique_id: item.unique_id,
                                unique_id_for_store_data:
                                  item.unique_id_for_store_data,
                              };
                              total_item_count = total_item_count + 1;
                              total_cart_price =
                                total_cart_price + quantities[i] * item.price;
                              items.push(ordered_item);
                            });
                          }
                        }
                        order_details.items = items;

                        cart.delivery_type = delivery_type;
                        cart.user_id = user_id;
                        cart.user_type_id = user_id;
                        cart.user_type = request_data_body.user_type;
                        cart.city_id = city_id;
                        cart.destination_addresses =
                          request_data_body.destination_addresses;
                        cart.order_details = order_details;
                        cart.pickup_addresses =
                          request_data_body.pickup_addresses;
                        cart.store_id = store_id;
                        var total_item_tax = 0;
                        cart.total_cart_price = total_cart_price;
                        cart.total_item_count = total_item_count;
                        cart.is_ramadan_order = true;
                        if (store) {
                          if (store.is_use_item_tax) {
                            if (request_data_body.total_item_tax) {
                              total_item_tax = request_data_body.total_item_tax;
                            }
                          } else {
                            if (total_cart_price) {
                              total_item_tax =
                                total_cart_price * store.item_tax * 0.01;
                            } else {
                              total_cart_price = 0;
                            }
                          }
                        }

                        total_item_tax = utils.precisionRoundTwo(
                          Number(total_item_tax)
                        );
                        cart.total_item_tax = total_item_tax;
                        cart.save().then(
                          () => {
                            response_data.json({
                              success: true,
                              message:
                                CART_MESSAGE_CODE.CART_UPDATED_SUCCESSFULLY,
                              cart_id: cart._id,
                              city_id: city_id,
                              user_id: user_id,
                              cart,
                            });
                          },
                          (error) => {
                            console.log("error: 5" + error);
                            response_data.json({
                              success: false,
                              error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                            });
                          }
                        );

                        //response_data.json({success: false, error_code: STORE_ERROR_CODE.MISMATCH_STORE_ID});
                      } else {
                        var total_cart_price = 0;

                        var total_item_tax = 0;
                        if (store) {
                          if (store.is_use_item_tax) {
                            if (request_data_body.total_item_tax) {
                              total_item_tax = request_data_body.total_item_tax;
                            }
                          } else {
                            if (total_cart_price) {
                              total_item_tax =
                                total_cart_price * store.item_tax * 0.01;
                            } else {
                              total_cart_price = 0;
                            }
                          }
                        }
                        var total_item_count = 0;
                        var order_details = {};
                        var categories =
                          request_data_body.order_object.package_id;
                        var quantities =
                          request_data_body.order_object.quantity;
                        var products = [];
                        var items = [];
                        for (let i = 0; i < categories.length; i++) {
                          if (categories[i]) {
                            var product = await Product.findOne({
                              category_id: categories[i],
                            });
                            products.push(product);
                          }
                        }

                        for (let i = 0; i < products.length; i++) {
                          if (products[i]) {
                            var item = await Item.find({
                              product_id: products[i]._id,
                            });
                            item.forEach((item) => {
                              var ordered_item = {
                                details: item.details,
                                image_url: item.image_url,
                                item_id: item._id,
                                item_name: item.name,
                                note_for_item: item.note_for_item,
                                specifications: item.specifications
                                  ? item.specifications
                                  : [],
                                item_price: item.price,
                                item_tax: item.tax,
                                max_item_quantity: item.max_item_quantity,
                                quantity: quantities[i],
                                total_item_price: quantities[i] * item.price,
                                total_item_tax: 0,
                                total_item_price: quantities[i] * item.price,
                                total_specification_price: 0,
                                total_specification_tax: 0,
                                total_tax: 0,
                                unique_id: item.unique_id,
                                unique_id_for_store_data:
                                  item.unique_id_for_store_data,
                              };
                              total_item_count = total_item_count + 1;
                              total_cart_price =
                                total_cart_price + quantities[i] * item.price;
                              items.push(ordered_item);
                            });
                          }
                        }
                        order_details.items = items;

                        total_item_tax = utils.precisionRoundTwo(
                          Number(total_item_tax)
                        );

                        var cart = new Cart({
                          cart_unique_token:
                            request_data_body.cart_unique_token,
                          user_id: user_id,
                          user_type: request_data_body.user_type,
                          delivery_type: delivery_type,
                          user_type_id: user_id,
                          store_id: store_id,
                          order_payment_id: null,
                          order_id: null,
                          city_id: city_id,
                          pickup_addresses: request_data_body.pickup_addresses,
                          destination_addresses:
                            request_data_body.destination_addresses,
                          order_details: order_details,
                          total_cart_price: total_cart_price,
                          total_item_tax: total_item_tax,
                          total_item_count: total_item_count,
                          is_ramadan_order: true,
                        });

                        if (
                          request_data_body.user_id != "" &&
                          request_data_body.user_id != undefined
                        ) {
                          cart.cart_unique_token = "";
                        }

                        cart.save().then(
                          () => {
                            if (user) {
                              user.cart_id = cart._id;
                              user.save();
                            }

                            response_data.json({
                              success: true,
                              message:
                                CART_MESSAGE_CODE.CART_ADDED_SUCCESSFULLY,
                              cart_id: cart._id,
                              city_id: city_id,
                              user_id: user_id,
                              cart,
                            });
                          },
                          (error) => {
                            console.log("error: 6" + error);
                            response_data.json({
                              success: false,
                              error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                            });
                          }
                        );
                      }
                    },
                    (error) => {
                      console.log("error: 1" + error);
                      response_data.json({
                        success: false,
                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                      });
                    }
                  );
                },
                (error) => {
                  console.log("error: 2" + error);
                  response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                  });
                }
              );
            } else {
              console.log("error: 3");
              response_data.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
              });
            }
            // } else
            // {
            //     response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_BUSINESS_OFF});
            // }
          } else {
            console.log("error: 4");
            response_data.json({
              success: false,
              error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
            });
          }
        }
      } else {
        response_data.json(response);
      }
    }
  );
};

// get cart
exports.get_cart = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "cart_unique_token", type: "string" }],
    async function (response) {
      if (response.success) {
        console.log("get_cart >>>" + JSON.stringify(request_data.body));
        var request_data_body = request_data.body;
        var cart_unique_token = request_data_body.cart_unique_token;
        if (request_data_body.user_id == "") {
          request_data_body.user_id = null;
        }
        const user = await User.findOne({ _id: request_data_body.user_id });
        if (
          user &&
          request_data_body.server_token !== null &&
          user.server_token !== request_data_body.server_token
        ) {
          response_data.json({
            success: false,
            error_code: ERROR_CODE.INVALID_SERVER_TOKEN,
          });
        } else {
          var cart_id = null;
          var user_id = null;

          if (user) {
            cart_id = user.cart_id;
            user_id = user._id;
            cart_unique_token = null;
          }
          const cart_detail = await Cart.findOne({
            $or: [{ _id: cart_id }, { cart_unique_token: cart_unique_token }],
          });
          if (!cart_detail) {
            response_data.json({
              success: false,
              error_code: CART_ERROR_CODE.CART_NOT_FOUND,
            });
            return;
          }
          cart_id = cart_detail._id;
          let store = await Store.findOne({
            _id: cart_detail.store_id,
          }).lean();
          if (!store) {
            response_data.json({
              success: false,
              error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND,
            });
            return;
          }
          if (!store.is_business) {
            if (user) {
              user.cart_id = null;
              user.save();
            }
            response_data.json({
              success: false,
              error_code: STORE_ERROR_CODE.STORE_BUSINESS_OFF,
            });
            return;
          }
          const country = await Country.findOne({ _id: store.country_id });
          var currency = "";
          if (country) {
            currency = country.currency_sign;
          }

          let cart = await getCart(cart_id);
          if (cart.length == 0) {
            response_data.json({
              success: false,
              error_code: CART_ERROR_CODE.CART_NOT_FOUND,
            });
            return;
          }
          if (
            store &&
            store.radius_regions &&
            store.radius_regions.length &&
            request_data_body.latitude &&
            request_data_body.longitude
          ) {
            await setUseRadiusZone(
              store,
              request_data_body.latitude,
              request_data_body.longitude,
              cart_id
            );
          }
          if (cart.length) {
            const order_details = cart[0].order_details;
            if (order_details.length) {
              if (order_details[0].items && order_details[0].items.length) {
                const item = order_details[0].items[0];
                if (item && item.SkuCode) {
                  cart[0].order_details = [];
                }
              }
            }
          }
          //check user exists or not
          if (user) {
            const userSetting = await UserSetting.findOne({ userId: user._id });
            if (userSetting && userSetting.free_delivery) {
              store.free_delivery_for_above_order_price =
                userSetting.free_delivery_amount;
              store.is_show_free_delivery_above_order =
                userSetting.free_delivery;
            }
            response_data.json({
              success: true,
              message: CART_MESSAGE_CODE.CART_GET_SUCCESSFULLY,
              currency: currency,
              min_order_price: store.min_order_price,
              cart_id: cart_detail._id,
              city_id: cart_detail.city_id,
              store_id: store._id,
              store_details: store,
              // user_radius_zone,
              store_time: store.store_time,
              is_use_item_tax: store.is_use_item_tax,
              item_tax: store.item_tax,
              name: store.name,
              max_item_quantity_add_by_user:
                store.max_item_quantity_add_by_user,
              destination_addresses: cart_detail.destination_addresses,
              pickup_addresses: cart_detail.pickup_addresses,
              cart: cart[0],
            });
          } else {
            response_data.json({
              success: true,
              message: CART_MESSAGE_CODE.CART_GET_SUCCESSFULLY,
              currency: currency,
              min_order_price: store.min_order_price,
              cart_id: cart_detail._id,
              city_id: cart_detail.city_id,
              store_id: store._id,
              store_details: store,
              // user_radius_zone,
              store_time: store.store_time,
              is_use_item_tax: store.is_use_item_tax,
              item_tax: store.item_tax,
              name: store.name,
              max_item_quantity_add_by_user:
                store.max_item_quantity_add_by_user,
              destination_addresses: cart_detail.destination_addresses,
              pickup_addresses: cart_detail.pickup_addresses,
              cart: cart[0],
            });
          }
        }
      } else {
        response_data.json(response);
      }
    }
  );
};

// clear_cart
exports.clear_cart = function (request_data, response_data) {
  console.log("clear_cart: >>> " + JSON.stringify(request_data.body));
  utils.check_request_params(
    request_data.body,
    [{ name: "cart_id", type: "string" }],
    async function (response) {
      if (!response.success) {
        response_data.json(response);
        return;
      }
      var request_data_body = request_data.body;
      var cart_id = request_data_body.cart_id;
      if (request_data_body.user_id == "") {
        request_data_body.user_id = null;
      }

      try {
        const user = await User.findOne({ _id: request_data_body.user_id });

        if (
          user &&
          request_data_body.server_token !== null &&
          user.server_token !== request_data_body.server_token
        ) {
          response_data.json({
            success: false,
            error_code: ERROR_CODE.INVALID_SERVER_TOKEN,
          });
          return;
        }

        const cart = await Cart.findOne({ _id: cart_id });
        if (!cart) {
          response_data.json({
            success: false,
            error_code: CART_ERROR_CODE.CART_DELETE_FAILED,
          });
          return;
        }

        let promo_code = null;
        if (cart.order_payment_id != null) {
          var order_payment_id = cart.order_payment_id;
          const order_payment = await Order_payment.findOne({
            _id: order_payment_id,
          });
          if (order_payment.loyalty_point > 0) {
            user.loyalty_points += order_payment.loyalty_point;
          }
          if (order_payment) {
            var promo_id = order_payment.promo_id;
            if (promo_id != null) {
              promo_code = await Promo_code.findOne({ _id: promo_id });
            }

            await Order_payment.deleteOne({
              _id: order_payment_id,
            });
          }
        }
        await Cart.deleteOne({ _id: cart_id });
        user.cart_id = null;
        if (promo_code) {
          promo_code.used_promo_code = promo_code.used_promo_code - 1;
          await promo_code.save();
          user.promo_count = user.promo_count - 1;
        }
        await user.save();

        response_data.json({
          success: true,
          message: CART_MESSAGE_CODE.CART_DELETE_SUCCESSFULLY,
        });
      } catch (error) {
        console.log(error);
        response_data.json({
          success: false,
          error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
        });
      }
    }
  );
};

// get_payment_gateway
exports.get_payment_gateway = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "city_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var city_id = request_data_body.city_id;
        var type = Number(request_data_body.type); // 7 = User , 8 = Provider , 2 = Store
        var Table;
        switch (type) {
          case ADMIN_DATA_ID.USER:
            Table = User;
            break;
          case ADMIN_DATA_ID.PROVIDER:
            Table = Provider;
            break;
          case ADMIN_DATA_ID.STORE:
            Table = Store;
            break;
          default:
            Table = User;
            break;
        }

        Table.findOne({ _id: request_data_body.user_id }).then(
          (detail) => {
            if (detail) {
              if (
                request_data_body.server_token !== null &&
                detail.server_token !== request_data_body.server_token
              ) {
                response_data.json({
                  success: false,
                  error_code: ERROR_CODE.INVALID_SERVER_TOKEN,
                });
              } else {
                if (city_id != "" && city_id != undefined && city_id != null) {
                  my_cart.get_payment_gateway_from_city(
                    request_data,
                    detail,
                    city_id,
                    response_data
                  );
                } else {
                  var country = request_data_body.country;
                  var country_code = request_data_body.country_code;
                  var country_code_2 = request_data_body.country_code_2;

                  Country.findOne({
                    $and: [
                      {
                        $or: [
                          { country_name: country },
                          { country_code: country_code },
                          { country_code_2: country_code_2 },
                        ],
                      },
                      { is_business: true },
                    ],
                  }).then(
                    (country_data) => {
                      if (!country_data) {
                        my_cart.get_payment_gateway_from_city(
                          request_data,
                          detail,
                          null,
                          response_data
                        );
                      } else {
                        var city_lat_long = [
                          request_data_body.latitude,
                          request_data_body.longitude,
                        ];
                        var country_id = country_data._id;

                        City.find({
                          country_id: country_id,
                          is_business: true,
                        }).then(
                          (cityList) => {
                            var size = cityList.length;
                            var count = 0;
                            if (size == 0) {
                              my_cart.get_payment_gateway_from_city(
                                request_data,
                                detail,
                                null,
                                response_data
                              );
                            } else {
                              var finalCityId = null;
                              var finalDistance = 1000000;
                              cityList.forEach(function (city_detail) {
                                count++;
                                var cityLatLong = city_detail.city_lat_long;
                                var distanceFromSubAdminCity =
                                  utils.getDistanceFromTwoLocation(
                                    city_lat_long,
                                    cityLatLong
                                  );
                                var cityRadius = city_detail.city_radius;
                                if (city_detail.is_use_radius) {
                                  if (distanceFromSubAdminCity < cityRadius) {
                                    if (
                                      distanceFromSubAdminCity < finalDistance
                                    ) {
                                      finalDistance = distanceFromSubAdminCity;
                                      finalCityId = city_detail._id;
                                    }
                                  }
                                } else {
                                  var store_zone = geolib.isPointInPolygon(
                                    {
                                      latitude: city_lat_long[0],
                                      longitude: city_lat_long[1],
                                    },
                                    city_detail.city_locations
                                  );
                                  if (store_zone) {
                                    finalCityId = city_detail._id;
                                    count = size;
                                  }
                                }

                                if (count == size) {
                                  if (finalCityId != null) {
                                    my_cart.get_payment_gateway_from_city(
                                      request_data,
                                      detail,
                                      finalCityId,
                                      response_data
                                    );
                                  } else {
                                    my_cart.get_payment_gateway_from_city(
                                      request_data,
                                      detail,
                                      null,
                                      response_data
                                    );
                                  }
                                }
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
                }
              }
            } else {
              response_data.json({
                success: false,
                error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
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

//get_payment_gateway_from_city
exports.get_payment_gateway_from_city = function (
  request_data,
  detail,
  city_id,
  response_data
) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      var type = Number(request_data_body.type); // 7 = User , 8 = Provider , 2 = Store

      if (city_id != "" && city_id != undefined && city_id != null) {
        City.findOne({ _id: city_id }).then(
          (city) => {
            if (city) {
              Payment_gateway.find({
                _id: { $in: city.payment_gateway },
                is_payment_visible: true,
              }).then(
                (payment_gateway) => {
                  if (
                    city.is_other_payment_mode == false ||
                    payment_gateway.length == 0
                  ) {
                    payment_gateway = [];
                  }
                  if (type == ADMIN_DATA_ID.USER) {
                    response_data.json({
                      success: true,
                      message: PAYMENT_GATEWAY_MESSAGE_CODE.LIST_SUCCESSFULLY,
                      wallet_currency_code: detail.wallet_currency_code,
                      is_use_wallet: detail.is_use_wallet,
                      is_cash_payment_mode: city.is_cash_payment_mode,
                      wallet: detail.wallet,
                      payment_gateway: payment_gateway,
                    });
                  } else {
                    response_data.json({
                      success: true,
                      message: PAYMENT_GATEWAY_MESSAGE_CODE.LIST_SUCCESSFULLY,
                      wallet_currency_code: detail.wallet_currency_code,
                      is_cash_payment_mode: city.is_cash_payment_mode,
                      wallet: detail.wallet,
                      payment_gateway: payment_gateway,
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
              var payment_gateway = [];
              response_data.json({
                success: true,
                message: PAYMENT_GATEWAY_MESSAGE_CODE.LIST_SUCCESSFULLY,
                wallet_currency_code: detail.wallet_currency_code,
                is_use_wallet: detail.is_use_wallet,
                is_cash_payment_mode: false,
                wallet: detail.wallet,
                payment_gateway: payment_gateway,
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
        var payment_gateway = [];
        response_data.json({
          success: true,
          message: PAYMENT_GATEWAY_MESSAGE_CODE.LIST_SUCCESSFULLY,
          wallet_currency_code: detail.wallet_currency_code,
          is_use_wallet: detail.is_use_wallet,
          is_cash_payment_mode: false,
          wallet: detail.wallet,
          payment_gateway: payment_gateway,
        });
      }
    } else {
      response_data.json(response);
    }
  });
};

exports.check_delivery_available = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      City.findOne(
        { _id: request_data_body.city_id },
        function (error, city_detail) {
          if (city_detail) {
            var store_zone = geolib.isPointInPolygon(
              {
                latitude: request_data_body.latitude,
                longitude: request_data_body.longitude,
              },
              city_detail.city_locations
            );
            var distance = utils.getDistanceFromTwoLocation(
              city_detail.city_lat_long,
              [request_data_body.latitude, request_data_body.longitude]
            );

            if (
              (city_detail.is_use_radius &&
                distance <= city_detail.city_radius) ||
              store_zone
            ) {
              response_data.json({
                success: true,
                message: CART_MESSAGE_CODE.DESTINATION_CHANGE_SUCCESSFULLY,
              });
            } else {
              response_data.json({
                success: false,
                error_code: CART_ERROR_CODE.YOUR_DELIVERY_ADDRESS_OUT_OF_AREA,
              });
            }
          } else {
          }
        }
      );
    } else {
      response_data.json(response);
    }
  });
};

//change_delivery_address
exports.change_delivery_address = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "cart_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var mongoose = require("mongoose");
        var Schema = mongoose.Types.ObjectId;

        var cartid_condition = {
          $match: { _id: { $eq: Schema(request_data_body.cart_id) } },
        };
        var store_lookup = {
          $lookup: {
            from: "stores",
            localField: "store_id",
            foreignField: "_id",
            as: "store_detail",
          },
        };
        var store_unwind = { $unwind: "$store_detail" };
        var city_lookup = {
          $lookup: {
            from: "cities",
            localField: "store_detail.city_id",
            foreignField: "_id",
            as: "city_detail",
          },
        };
        var city_unwind = { $unwind: "$city_detail" };

        Cart.aggregate([
          cartid_condition,
          store_lookup,
          store_unwind,
          city_lookup,
          city_unwind,
        ]).then(
          (cart) => {
            if (cart.length == 0) {
              response_data.json({
                success: false,
                error_code: CART_ERROR_CODE.CART_NOT_FOUND,
              });
            } else {
              var city = cart[0].city_detail;
              var store = cart[0].store_detail;

              Cart.findOne({ _id: request_data_body.cart_id }).then(
                (cart_detail) => {
                  // var store_zone = geolib.isPointInside(
                  //   {
                  //     latitude:
                  //       request_data_body.destination_addresses[0].location[0],
                  //     longitude:
                  //       request_data_body.destination_addresses[0].location[1],
                  //   },
                  //   city.city_locations
                  // );
                  let user_radius_zone = null;
                  if (
                    store &&
                    store.radius_regions &&
                    store.radius_regions.length &&
                    request_data_body.new_lat &&
                    request_data_body.new_long
                  ) {
                    store.radius_regions.forEach((c) => {
                      const coord = c.kmlzone.coordinates;
                      if (coord && coord[0]) {
                        const coordinates = coord[0].map(([lat, long]) => {
                          return {
                            latitude: lat,
                            longitude: long,
                          };
                        });
                        const isInside = geolib.isPointInPolygon(
                          {
                            latitude: request_data_body.new_lat,
                            longitude: request_data_body.new_long,
                          },
                          coordinates
                        );

                        const IsInside = geolib.isPointInPolygon(
                          {
                            latitude: request_data_body.new_long,
                            longitude: request_data_body.new_lat,
                          },
                          coordinates
                        );

                        if (isInside || IsInside) {
                          user_radius_zone = c;
                        }
                      }
                    });
                  }

                  if (user_radius_zone) {
                    cart_detail.destination_addresses =
                      request_data_body.destination_addresses;
                    cart_detail.save().then(() => {
                      response_data.json({
                        user_radius_zone,
                        success: true,
                        message:
                          CART_MESSAGE_CODE.DESTINATION_CHANGE_SUCCESSFULLY,
                      });
                    });
                  } else {
                    response_data.json({
                      success: false,
                      error_code:
                        CART_ERROR_CODE.YOUR_DELIVERY_ADDRESS_OUT_OF_AREA,
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

exports.country_city_list = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var city_lookup = {
        $lookup: {
          from: "cities",
          localField: "_id",
          foreignField: "country_id",
          as: "city_list",
        },
      };

      Country.aggregate([city_lookup]).then(
        (country_list) => {
          response_data.json({ country_list: country_list });
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

exports.checkout_payment = async function (request, response) {
  var order_payment = {};
  var body = request.body;
  const setting = await Installation_setting.findOne({});
  const cko = new Checkout(setting.CKO_SECRET_KEY, {
    pk: setting.CKO_PUBLIC_KEY,
    timeout: 7000,
  });
  console.log("checkout_payment==>>> " + JSON.stringify(request.body));

  try {
    const auth_token = await cko.tokens.request({
      // type:"card" is inferred
      number: body.card_number,
      expiry_month: body.expiry_month,
      expiry_year: body.expiry_year,
      cvv: body.cvv,
    });

    const auth_payment = await cko.payments.request({
      source: {
        type: "token",
        token: auth_token.token,
      },
      amount: 10,
      currency: "AED",
    });
    if (auth_payment.status == "Authorized" && auth_payment.approved == true) {
      const token = await cko.tokens.request({
        // type:"card" is inferred
        number: body.card_number,
        expiry_month: body.expiry_month,
        expiry_year: body.expiry_year,
        cvv: body.cvv,
      });

      const instrument = await cko.instruments.create({
        token: token.token,
      });
      try {
        const card_list = await Card.find({
          user_id: body.user_id,
        });
        card_list.forEach(async (card) => {
          card.is_default = false;
          await card.save();
        });
        const card = await Card.findOne({
          card_number: body.card_number,
        });
        if (!card) {
          await Card.create({
            payment_token: token.token,
            card_type: token.card_type,
            card_type: token.card_type,
            card_number: body.card_number,
            expiry_year: token.expiry_year,
            expiry_month: token.expiry_month,
            card_holder_name: body.name,
            user_id: body.user_id,
            user_type: body.user_type,
            customer_id: body.customer_id,
            last_four: token.last4,
            is_default: true,
            instrument_id: instrument.id,
            is_card_verified: true,
          });
        } else {
          card.is_default = true;
          card.is_card_verified = true;
          card.instrument_id = instrument.id;
          await card.save();
        }
        order_payment = await Order_payment.findOneAndUpdate(
          { _id: body.order_payment_id },
          {
            email: body.email,
            name: body.name,
            description: body.description,
            reference: body.reference,
            checkout_amount: body.amount,
            token: token.token,
            instrument: instrument.id,
          }
        );

        order_payment.checkout_amount = String(
          (Number(order_payment.checkout_amount) - 0.1).toFixed(2)
        );
        await order_payment.save();
      } catch (error) {
        console.log("error:checkout " + error);
      }
      console.log("checkout log >>>>" + JSON.stringify(Object(instrument)));
      response.json({
        data: order_payment,
        instrument: instrument,
        auth_payment: auth_payment,
      });
    } else {
      console.log("wrong cvv");
      response.json({
        success: false,
        error: "invalid cvv",
      });
    }
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.json({
      error: err.message,
    });
  }
};

exports.deduct_amount = async function (request, response) {
  var body = request.body;
  const setting = await Installation_setting.findOne({});
  const cko = new Checkout(setting.CKO_SECRET_KEY, {
    pk: setting.CKO_PUBLIC_KEY,
    timeout: 7000,
  });
  console.log("deduct amount api >>>>>" + JSON.stringify(request.body));

  try {
    let order_payment = await Order_payment.findOne({
      _id: body.order_payment_id,
      "payment_response.approved": true,
    });

    let check_details = await paymentDetails
      .findOne({
        order_payment_id: body.order_payment_id,
      })
      .lean();
    if (check_details) {
      let created_at = check_details.created_at;
      const difference = moment(moment()).diff(created_at);
      const durationInMinutes = moment.duration(difference).asMinutes();
      const checkDuration =
        setting.online_payment_already_paid_error_duration_in_mins;

      if (durationInMinutes < checkDuration) {
        response.json({
          success: false,
          error_message: "Payment for this order is already paid!",
        });
        return;
      }
    }

    if (order_payment) {
      // if (!order_payment.token) {
      //   response.json({
      //     message: CART_CHECKOUT_CODE.INVALID_PAYMENT_TOKEN,
      //   });
      // }
      order_payment.checkout_amount = Number(order_payment.checkout_amount);
      await order_payment.save();
      let checkout_amount;
      if (body.checkout_amount == undefined) {
        checkout_amount = Number(order_payment.checkout_amount) * 100;
        checkout_amount = Number(checkout_amount.toFixed());
      } else {
        checkout_amount = Number(body.checkout_amount) * 100;
        checkout_amount = Number(checkout_amount.toFixed());
      }

      console.log("checkout amount >>>" + checkout_amount);
      const payment = await cko.payments.request({
        source: {
          type: "id",
          id: order_payment.instrument_id,
          cvv: body.cvv,
          // token: order_payment.token, // Generated by Checkout.Frames
        },
        currency: "AED",
        amount: checkout_amount,
        // payment_type: "Regular",
        reference: order_payment.unique_id.toString(),
        // description: order_payment.description,
        // customer: {
        //   email: order_payment.email,
        //   name: order_payment.name,
        // },
      });
      console.log(
        "deduct amount api response >>>>>" + JSON.stringify(Object(payment))
      );
      if (payment) {
        let payment_details = new paymentDetails();
        payment_details.payment_response = payment;
        payment_details.order_payment_id = order_payment._id;
        payment_details.cart_id = order_payment.cart_id;
        payment_details.checkout_amount = order_payment.checkout_amount;
        payment_details.instrument_id = order_payment.instrument_id;
        await payment_details.save();
      }
      response.json({
        payment,
      });
    } else {
      response.json({
        message: CART_CHECKOUT_CODE.ORDER_PAYMENT_NOT_FOUND,
      });
    }
  } catch (err) {
    response.json({
      err: err.message,
    });
    console.log(err);
  }
};

exports.request_card_payment_by_instrument = async function (
  request,
  response
) {
  try {
    var body = request.body;
    const setting = await Installation_setting.findOne({});
    const cko = new Checkout(setting.CKO_SECRET_KEY, {
      pk: setting.CKO_PUBLIC_KEY,
      timeout: 7000,
    });
    console.log(
      "request_card_payment_by_instrument>>>>>" + JSON.stringify(request.body)
    );
    if (!body.instrument_id || !body.amount) {
      response.json({
        success: false,
        message: "you must pass instrument id and amount",
      });
      return;
    }
    let amount = Number(body.amount) * 100;
    amount = Number(amount.toFixed());

    let source = {
      type: "id",
      id: body.instrument_id,
    };
    if (body.cvv) source.cvv = body.cvv;

    const payment = await cko.payments.request({
      source,
      currency: "AED",
      amount,
      reference: body.reference || `${Date.now()}`,
    });

    response.json({
      payment,
    });
  } catch (err) {
    console.log("err: ", err);
    response.json({
      err: err.message,
    });
    console.log(err);
  }
};

exports.card_online_payment = async function (request, response) {
  const body = request.body;
  const setting = await Installation_setting.findOne({});
  const cko = new Checkout(setting.CKO_SECRET_KEY, {
    pk: setting.CKO_PUBLIC_KEY,
    timeout: 7000,
  });
  console.log("card online payment api >>>>>" + JSON.stringify(request.body));

  try {
    let orderPayment = null;
    //check order status
    if (body.order_status < 7) {
      orderPayment = await Order_payment.findOne({
        _id: body.order_payment_id,
      });
      if (orderPayment) {
        orderPayment.instrument_id = body.instrument_id;
        await orderPayment.save();
      }
    } else {
      const card_details = await card
        .findById({
          _id: body.card_id,
        })
        .lean();

      if (!card_details) {
        response.json({
          success: false,
          message: CART_CHECKOUT_CODE.ORDER_PAYMENT_NOT_FOUND,
        });
        return;
      }

      let checkout_amount = Number(body.checkout_amount) * 100;
      checkout_amount = Number(checkout_amount.toFixed());
      const payment_response = await cko.payments.request({
        source: {
          type: "id",
          id: body.instrument_id,
        },
        currency: "AED",
        amount: checkout_amount,
        reference: body.order_payment_unique_id.toString(),
      });

      console.log(
        "card online payment_response api response >>>>>" +
          JSON.stringify(Object(payment_response))
      );

      if (payment_response) {
        await paymentDetails.create({
          payment_response,
          order_payment_id: body.order_payment_id,
          cart_id: body.cart_id,
          checkout_amount: body.checkout_amount,
          instrument_id: body.instrument_id,
        });

        orderPayment = await Order_payment.findOne({
          _id: body.order_payment_id,
        });
      }
    }
    orderPayment.is_payment_mode_cash = false;
    orderPayment.is_payment_mode_card_on_delivery = false;
    orderPayment.is_payment_mode_online_payment = true;
    orderPayment.is_payment_paid = true;
    await orderPayment.save();

    response.json({
      success: true,
      orderPayment,
    });
  } catch (err) {
    response.json({
      err: err.message,
    });
    console.log(err);
  }
};
