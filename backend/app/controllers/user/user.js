require("../../utils/message_code");
require("../../utils/error_code");
require("../../utils/constants");
var utils = require("../../utils/utils");
var emails = require("../../controllers/email_sms/emails");
var wallet_history = require("../../controllers/user/wallet");
var mongoose = require("mongoose");
var Product = require("mongoose").model("product");
var User = require("mongoose").model("user");
var Country = require("mongoose").model("country");
var Provider = require("mongoose").model("provider");
var Store = require("mongoose").model("store");
var City = require("mongoose").model("city");
var Card = require("mongoose").model("card");
var Service = require("mongoose").model("service");
var Order = require("mongoose").model("order");
var Payment_gateway = require("mongoose").model("payment_gateway");
var Order_payment = require("mongoose").model("order_payment");
var Promo_code = require("mongoose").model("promo_code");
var Cart = require("mongoose").model("cart");
var Review = require("mongoose").model("review");
var Referral_code = require("mongoose").model("referral_code");
var Vehicle = require("mongoose").model("vehicle");
var Delivery = require("mongoose").model("delivery");
var Advertise = require("mongoose").model("advertise");
var Item = require("mongoose").model("item");
var Request = require("mongoose").model("request");
var geolib = require("geolib");
var console = require("../../utils/console");
var User_favourite_address = require("mongoose").model(
  "user_favourite_address"
);
var Category = require("mongoose").model("category");
var Setting = require("mongoose").model("setting");
const UserSetting = require("mongoose").model("user_setting");
var Installation_setting = require("mongoose").model("installation_setting");
const { update_cart_detail } = require("../store/item");
// var moment = require("moment");
var moment = require("moment-timezone");
const { google_pay } = require("./card");
const { welcome_mail } = require("../../../report_email_template/welcome_mail");
const {
  getStoresBasedOnLocation,
  storeResponseMap,
  getStoreTime,
  storeAdvFromUserLocation,
  setUseRadiusZone,
} = require("../../services/user.service");
const unregisteredUser = require("../../models/user/unregisteredUser.model");
const { asyncForEach } = require("../../helpers/utils.helper");
const { remove_loyalty_points, remove_promo_code } = require("./promo_code");
const {
  fixItemsImgSpace,
  autoCompleteSearchItems,
  searchItems,
} = require("../../services/item.service");

exports.user_get_substitute_items = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      var store_id = request_data_body.store_id;
      var item_id = request_data_body.item_id;
      var user_id = request_data_body.user_id;
      var if_store_panel = request_data_body.if_store_panel;
      //            User.findOne({_id: mongoose.Types.ObjectId(user_id)}).then((user_detail) => {
      //                if (user_detail) {
      //                    if ((if_store_panel == undefined || if_store_panel == false) && (request_data_body.server_token !== null && user_detail.server_token != request_data_body.server_token)) {
      //
      //                        // if (request_data_body.server_token !== null && user_detail.server_token !== request_data_body.server_token)
      //                        //{
      //                        response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
      //                    } else
      //                    {
      Store.findOne({ _id: mongoose.Types.ObjectId(store_id) }).then(
        (store) => {
          if (store) {
            Country.findOne({ _id: store.country_id }).then(
              (country_data) => {
                var currency = country_data.currency_sign;
                var maximum_phone_number_length =
                  country_data.maximum_phone_number_length;
                var minimum_phone_number_length =
                  country_data.minimum_phone_number_length;
                Item.findOne(
                  { _id: mongoose.Types.ObjectId(item_id) },
                  function (error, item_detail) {
                    if (item_detail) {
                      //
                      var substitute_items = item_detail.substitute_items;
                      var index = substitute_items.indexOf(item_detail._id);
                      if (index >= 0) {
                        substitute_items.splice(index, 1);
                      }
                      substitute_items = substitute_items;
                      Product.findOne(
                        { _id: item_detail.product_id },
                        function (error, product) {
                          Item.find(
                            {
                              _id: { $nin: item_id },
                              product_id: item_detail.product_id,
                            },
                            function (error, items) {
                              if (items.length == 0) {
                                response_data.json({
                                  success: false,
                                  error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND,
                                });
                              } else {
                                response_data.json({
                                  success: true,
                                  message:
                                    ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
                                  currency: currency,
                                  product: product,
                                  items: items,
                                });
                              }
                            }
                          );
                        }
                      );
                    }
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
      //                    }
      //                } else
      //                {
      //
      //                    response_data.json({success: false, error_code: ERROR_CODE.DETAIL_NOT_FOUND});
      //                }
      //            }, (error) => {
      //
      //                response_data.json({
      //                    success: false,
      //                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG
      //                });
      //            });
    } else {
      response_data.json(response);
    }
  });
};

exports.get_store_details = async function (req, resp) {
  const { store_id, latitude, longitude } = req.body;
  let store_details = await Store.findOne({ _id: store_id }).lean();
  let server_time = new Date(moment(new Date()).utc().valueOf());
  if (!store_details) {
    resp.json({
      success: false,
      message: "Store not found",
    });
  } else {
    if (latitude && longitude) {
      await setUseRadiusZone(store_details, latitude, longitude);
    }
    resp.json({
      success: true,
      store_details: store_details,
      server_time: server_time,
    });
  }
};

exports.get_recommended_products = async function (
  request_data,
  response_data
) {
  console.log(
    "get_recommended_products :>> " + JSON.stringify(request_data.body)
  );
  const store_id = request_data.body.store_id;
  const number_of_rec = request_data.body.number_of_rec
    ? request_data.body.number_of_rec
    : 5;
  const page = request_data.body.page ? request_data.body.page : 1;
  const store_details = await Store.findOne({ _id: store_id });
  let user;
  let cart_unique_token = request_data.body.cart_unique_token;
  let cart_id;
  if (!store_details) {
    response_data.json({
      success: false,
      message: "Store not found",
    });
  } else {
    var skip = {};
    skip["$skip"] = page * number_of_rec - number_of_rec;
    var limit = {};
    limit["$limit"] = number_of_rec;
    var items = await Item.aggregate([
      { $match: { is_recommend_in_store: { $eq: true } } },
      { $match: { is_item_in_stock: { $eq: true } } },
      { $match: { store_id: mongoose.Types.ObjectId(store_id) } },
      { $sample: { size: 100 } },
      // skip,
      // limit,
    ]);
    if (request_data.body.user_id) {
      user = await User.findOne({ _id: request_data.body.user_id });
      cart_id = user ? user.cart_id : null;
    }
    if (request_data.body.user_id || cart_unique_token) {
      var cart = await Cart.findOne({
        $or: [{ _id: cart_id }, { cart_unique_token: cart_unique_token }],
      });
      if (cart && cart.order_details) {
        cart.order_details.forEach(async (product) => {
          product.items.forEach((item) => {
            items = items.filter(
              (itm) =>
                itm._id &&
                item.item_id &&
                itm._id.toString() != item.item_id.toString()
            );
          });
        });
      }
    }
    var products = [];
    var numPending = items.length;
    if (numPending == 0) {
      response_data.json({
        success: true,
        message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
        items: fixItemsImgSpace(items),
        products: products,
        // store_details: store_details,
      });
    }
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      Product.findOne({ _id: item.product_id }, function (error, product) {
        numPending--;
        if (!error) {
          products.push(product);
        }
        if (numPending == 0) {
          response_data.json({
            success: true,
            len: items.length,
            message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
            title: "Most Visited Items",
            items: items.filter((i) => i),
            products: products.filter((i) => i),
            //  store_details: store_details,
          });
        }
      });
    }
  }
  // utils.check_request_params(request_data.body, [], function (response) {
  //   if (response.success) {
  //     var store_id = request_data.body.store_id;
  //     var user_id = request_data.body.user_id;
  //     Item.aggregate(
  //       [
  //         { $match: { is_recommend_in_store : { $eq: true } } },
  //         { $match: { store_id: mongoose.Types.ObjectId(store_id) } },
  //         { $sample: { size: 5 } },
  //       ],
  //       function (error, items) {
  //         var products = [];
  //         var numPending = items.length;
  //         if (numPending == 0) {
  //           response_data.json({
  //             success: true,
  //             message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
  //             items: items,
  //             products: products,
  //           });
  //         }
  //
  //         for (var i = 0; i < items.length; i++) {
  //           var item = items[i];
  //           Product.findOne(
  //             { _id: item.product_id },
  //             function (error, product) {
  //               numPending--;
  //               if (!error) {
  //                 products.push(product);
  //               }
  //               if (numPending == 0) {
  //                 response_data.json({
  //                   success: true,
  //                   message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
  //                   items: items,
  //                   products: products,
  //                 });
  //               }
  //             }
  //           );
  //         }
  //       }
  //     );
  //   } else {
  //     response_data.json(response);
  //   }
  // });
};

const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// USER REGISTER API
exports.user_register = function (request_data, response_data) {
  console.log("user_register: >>>>" + JSON.stringify(request_data.body));
  utils.check_request_params(
    request_data.body,
    [
      { name: "email", type: "string" },
      { name: "country_id", type: "string" },
      { name: "phone", type: "string" },
      { name: "country_phone_code", type: "string" },
      { name: "first_name", type: "string" },
    ],
    async function (response) {
      if (!response.success) {
        response_data.json(response);
        return;
      }
      var request_data_body = request_data.body;
      var social_id = request_data_body.social_id;
      var email = request_data_body.email;
      var phoneNumber = request_data_body.phone;
      var cart_unique_token = request_data_body.cart_unique_token;
      const setting = await Setting.findOne({});
      var social_id_array = [];

      if (!social_id && !email && !phoneNumber) {
        response_data.json({
          success: false,
          error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
          error_message: "email,phone or social_id any one is required",
        });
        return;
      }
      if (social_id == undefined || social_id == null || social_id == "") {
        social_id = null;
      } else {
        social_id_array.push(social_id);
      }

      try {
        let country = await Country.findOne({
          _id: request_data_body.country_id,
        });
        if (!country) {
          response_data.json({
            success: false,
            error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
            error_message: "Missing/Invalid country_id",
          });
          return;
        }
        let user_detail = await User.findOne({
          social_ids: { $all: social_id_array },
        });

        if (user_detail) {
          response_data.json({
            success: false,
            error_code: USER_ERROR_CODE.USER_ALREADY_REGISTER_WITH_SOCIAL,
          });
          return;
        }

        user_detail = await User.findOne({ email: request_data_body.email });

        if (user_detail) {
          if (
            social_id != null &&
            user_detail.social_ids.indexOf(social_id) < 0
          ) {
            user_detail.social_ids.push(social_id);
            user_detail.save();
            response_data.json({
              success: true,
              message: USER_MESSAGE_CODE.REGISTER_SUCCESSFULLY,
              minimum_phone_number_length: country.minimum_phone_number_length,
              maximum_phone_number_length: country.maximum_phone_number_length,
              user: user_detail,
            });
          } else {
            response_data.json({
              success: false,
              error_code: USER_ERROR_CODE.EMAIL_ALREADY_REGISTRED,
            });
          }
        } else {
          user_detail = await User.findOne({ phone: request_data_body.phone });

          if (user_detail) {
            if (
              social_id != null &&
              user_detail.social_ids.indexOf(social_id) < 0
            ) {
              user_detail.social_ids.push(social_id);
              user_detail.save();
              response_data.json({
                success: true,
                message: USER_MESSAGE_CODE.REGISTER_SUCCESSFULLY,
                minimum_phone_number_length:
                  country.minimum_phone_number_length,
                maximum_phone_number_length:
                  country.maximum_phone_number_length,
                user: user_detail,
              });
            } else {
              response_data.json({
                success: false,
                error_code: USER_ERROR_CODE.PHONE_NUMBER_ALREADY_REGISTRED,
              });
            }
          } else {
            var first_name = capitalize(request_data_body.first_name);
            var last_name = request_data_body.last_name
              ? capitalize(request_data_body.last_name)
              : "";
            var city = capitalize(request_data_body.city);
            var server_token = utils.generateServerToken(32);

            const max_id = await User.find({}).sort({ unique_id: -1 }).limit(1);
            let unique_id = max_id.length ? max_id[0].unique_id + 1 : 1100;
            var user_data = new User({
              user_type: ADMIN_DATA_ID.ADMIN,
              admin_type: ADMIN_DATA_ID.USER,
              user_type_id: null,
              first_name: first_name,
              last_name: last_name,
              email: request_data_body.email.trim().toLowerCase(),
              password: request_data_body.password,
              social_ids: social_id_array,
              login_by: request_data_body.login_by,
              country_phone_code: request_data_body.country_phone_code,
              phone: request_data_body.phone,
              address: request_data_body.address,
              zipcode: request_data_body.zipcode,
              country_id: request_data_body.country_id,
              city: city,
              device_token: request_data_body.device_token,
              device_type: request_data_body.device_type,
              app_version: request_data_body.app_version,
              is_email_verified: request_data_body.is_email_verified,
              is_phone_number_verified:
                request_data_body.is_phone_number_verified,
              server_token: server_token,
              unique_id: unique_id,
            });

            var image_file = request_data.files;
            if (image_file != undefined && image_file.length > 0) {
              var image_name = user_data._id + utils.generateServerToken(4);
              var url =
                utils.getStoreImageFolderPath(FOLDER_NAME.USER_PROFILES) +
                image_name +
                FILE_EXTENSION.USER;
              user_data.image_url = url;
              utils.storeImageToFolder(
                image_file[0].path,
                image_name + FILE_EXTENSION.USER,
                FOLDER_NAME.USER_PROFILES
              );
            }

            if (
              social_id == undefined ||
              social_id == null ||
              social_id == ""
            ) {
              user_data.password = utils.encryptPassword(
                request_data_body.password
              );
            }

            user_data.referral_code = await utils.generateReferralCode(
              user_data.phone
            );
            user_data.wallet_currency_code = country.currency_code;
            //  WELCOME WALLET

            if (setting.is_recieved_welcome_wallet) {
              user_data.wallet = user_data.wallet + setting.welcome_wallet;
              var device_type = user_data.device_type;
              var device_token = user_data.device_token;
              var message = {
                title: setting.welcome_wallet_message_title.replace(
                  "%NAME%",
                  user_data.first_name
                ),
                body: setting.welcome_wallet_message_body.replace(
                  "%AMOUNT%",
                  setting.welcome_wallet
                ),
                image:
                  "http://staging.yeepeey.com:8000/ads_mobile_images/5d943218e2c4311f2c22ddabF27G.jpg",
              };
              utils.sendNotification(
                ADMIN_DATA_ID.USER,
                device_type,
                device_token,
                message,
                ""
              );
            }
            // Start Apply Referral //
            if (request_data_body.referral_code != "") {
              let user = await User.findOne({
                referral_code: request_data_body.referral_code,
              });

              if (user) {
                var referral_bonus_to_user =
                  country.referral_bonus_to_user || 0;
                // country.referral_bonus_to_user;
                var referral_bonus_to_user_friend =
                  country.referral_bonus_to_user_friend;
                var user_refferal_count = user.total_referrals || 0;
                if (!user.total_referrals) user.total_referrals = 0;
                if (user_refferal_count < country.no_of_user_use_referral) {
                  user.total_referrals = +user.total_referrals + 1;
                  user_data.is_referral = true;
                  user_data.referred_by = user._id;
                  user_data.wallet = referral_bonus_to_user;
                  if (!user_data.wallet) user_data.wallet = 0;

                  // var wallet_information = {
                  //   referral_code: referral_code,
                  //   user_friend_id: user_data._id,
                  // };
                  // var total_wallet_amount = wallet_history.add_wallet_history(
                  //   ADMIN_DATA_ID.USER,
                  //   user.unique_id,
                  //   user._id,
                  //   user.country_id,
                  //   country.currency_code,
                  //   country.currency_code,
                  //   1,
                  //   referral_bonus_to_user,
                  //   user.wallet,
                  //   WALLET_STATUS_ID.ADD_WALLET_AMOUNT,
                  //   WALLET_COMMENT_ID.ADDED_BY_REFERRAL,
                  //   "Using Refferal : " + request_data_body.referral_code,
                  //   wallet_information
                  // );

                  // Entry in wallet Table //
                  // user.wallet = total_wallet_amount;
                  // Entry in wallet Table //
                  // wallet_information = {
                  //   referral_code: referral_code,
                  //   user_friend_id: user._id,
                  // };
                  // var new_total_wallet_amount =
                  //   wallet_history.add_wallet_history(
                  //     ADMIN_DATA_ID.USER,
                  //     user_data.unique_id,
                  //     user_data._id,
                  //     user_data.country_id,
                  //     country.currency_code,
                  //     country.currency_code,
                  //     1,
                  //     referral_bonus_to_user_friend,
                  //     user_data.wallet,
                  //     WALLET_STATUS_ID.ADD_WALLET_AMOUNT,
                  //     WALLET_COMMENT_ID.ADDED_BY_REFERRAL,
                  //     "Using Refferal : " + request_data_body.referral_code,
                  //     wallet_information
                  //   );

                  // user_data.wallet = new_total_wallet_amount;
                  await user_data.save();

                  // Entry in referral_code Table //
                  // var referral_code = new Referral_code({
                  //   user_type: ADMIN_DATA_ID.USER,
                  //   user_id: user._id,
                  //   user_unique_id: user.unique_id,
                  //   user_referral_code: user.referral_code,
                  //   referred_id: user_data._id,
                  //   referred_unique_id: user_data.unique_id,
                  //   country_id: user_data.country_id,
                  //   current_rate: 1,
                  //   referral_bonus_to_user_friend:
                  //     referral_bonus_to_user_friend,
                  //   referral_bonus_to_user: referral_bonus_to_user,
                  // });

                  // utils.getCurrencyConvertRate(
                  //   1,
                  //   country.currency_code,
                  //   setting.admin_currency_code,
                  //   function (response) {
                  //     if (response.success) {
                  //       referral_code.current_rate = response.current_rate;
                  //     } else {
                  //       referral_code.current_rate = 1;
                  //     }
                  //     referral_code.save();
                  //   }
                  // );
                }
              }
            }
            // End Apply Referral //
            user_data.is_recieved_welcome_message = false;
            utils.insert_documets_for_new_users(
              user_data,
              null,
              ADMIN_DATA_ID.USER,
              user_data.country_id,
              async function (document_response) {
                user_data.is_document_uploaded =
                  document_response.is_document_uploaded;

                if (setting.is_mail_notification && false) {
                  const to = user_data.email;
                  const sub = `Welcome To YeePeey.`;
                  const text = " ";
                  const html = welcome_mail(user_data.first_name);
                  utils.mail_notification(to, sub, text, html);
                }

                let cart = await Cart.findOne({
                  cart_unique_token: cart_unique_token,
                });
                if (cart) {
                  cart.user_id = user_data._id;
                  cart.cart_unique_token = "";
                  await cart.save();
                  user_data.cart_id = cart._id;
                }
                await user_data.save();
                const in_app_ad = await Advertise.findOne({
                  in_app_notification: true,
                  is_ads_visible: true,
                }).lean();

                response_data.json({
                  success: true,
                  message: USER_MESSAGE_CODE.REGISTER_SUCCESSFULLY,
                  minimum_phone_number_length:
                    country.minimum_phone_number_length,
                  maximum_phone_number_length:
                    country.maximum_phone_number_length,
                  user: user_data,
                  in_app_ad,
                });
              }
            );
          }
        }
      } catch (error) {
        response_data.json({
          success: false,
          error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
        });
      }
    }
  );
};

//USER LOGIN API
exports.user_login = function (request_data, response_data) {
  console.log("user_login: >>>>" + JSON.stringify(request_data.body));
  utils.check_request_params(
    request_data.body,
    [{ name: "email", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var email = request_data_body.email.trim().toLowerCase();
        var social_id = request_data_body.social_id;
        var cart_unique_token = request_data_body.cart_unique_token;
        if (!email) {
          email = null;
        }
        var encrypted_password = request_data_body.password;
        if (social_id == undefined || social_id == null || social_id == "") {
          social_id = "";
        }
        if (
          encrypted_password == undefined ||
          encrypted_password == null ||
          encrypted_password == ""
        ) {
          encrypted_password = "";
        } else {
          encrypted_password = utils.encryptPassword(encrypted_password);
        }
        var query = {
          $or: [
            { email: email },
            { phone: email },
            { social_ids: { $all: [social_id] } },
          ],
        };

        if (encrypted_password || social_id) {
          User.findOne(query).then(
            async (user_detail) => {
              const userObj = user_detail.toJSON();
              if (
                social_id == undefined ||
                social_id == null ||
                social_id == ""
              ) {
                social_id = null;
              }
              if (social_id == null && email == "") {
                response_data.json({
                  success: false,
                  error_code: USER_ERROR_CODE.LOGIN_FAILED,
                });
              } else if (user_detail) {
                if (
                  social_id == null &&
                  encrypted_password != "" &&
                  encrypted_password != user_detail.password
                ) {
                  response_data.json({
                    success: false,
                    error_code: USER_ERROR_CODE.INVALID_PASSWORD,
                  });
                } else if (
                  social_id != null &&
                  user_detail.social_ids.indexOf(social_id) < 0
                ) {
                  response_data.json({
                    success: false,
                    error_code: USER_ERROR_CODE.USER_NOT_REGISTER_WITH_SOCIAL,
                  });
                } else {
                  const default_address = await User_favourite_address.findOne({
                    user_id: user_detail._id,
                    is_default_address: true,
                  });
                  Country.findOne({ _id: user_detail.country_id }).then(
                    (country) => {
                      var server_token = utils.generateServerToken(32);
                      user_detail.server_token = server_token;
                      var device_token = "";
                      var device_type = "";
                      if (
                        user_detail.device_token != "" &&
                        user_detail.device_token !=
                          request_data_body.device_token
                      ) {
                        device_token = user_detail.device_token;
                        device_type = user_detail.device_type;
                      }
                      user_detail.device_token = request_data_body.device_token;
                      user_detail.device_type = request_data_body.device_type;
                      user_detail.login_by = request_data_body.login_by;
                      user_detail.app_version = request_data_body.app_version;

                      user_detail.save().then(
                        () => {
                          Cart.findOne({
                            cart_unique_token: cart_unique_token,
                          }).then((cart) => {
                            if (cart) {
                              cart.user_id = user_detail._id;
                              cart.user_type_id = user_detail._id;
                              cart.cart_unique_token = "";
                              cart.save();

                              user_detail.cart_id = cart._id;
                              user_detail.save();
                            }
                          });

                          if (device_token != "") {
                            utils.sendPushNotification(
                              ADMIN_DATA_ID.USER,
                              device_type,
                              device_token,
                              USER_PUSH_CODE.LOGIN_IN_OTHER_DEVICE,
                              PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS
                            );
                          }
                          response_data.json({
                            success: true,
                            message: USER_MESSAGE_CODE.LOGIN_SUCCESSFULLY,
                            minimum_phone_number_length:
                              country.minimum_phone_number_length,
                            maximum_phone_number_length:
                              country.maximum_phone_number_length,
                            user: user_detail,
                            default_address: default_address,
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
                  );
                }
              } else {
                response_data.json({
                  success: false,
                  error_code: USER_ERROR_CODE.NOT_A_REGISTERED,
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
            error_code: USER_ERROR_CODE.LOGIN_FAILED,
          });
        }
      } else {
        response_data.json(response);
      }
    }
  );
};

// USER UPDATE PROFILE DETAILS
exports.user_update = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;

      var user_id = request_data_body.user_id;
      var old_password = request_data_body.old_password;
      var social_id = request_data_body.social_id;

      if (social_id == undefined || social_id == null || social_id == "") {
        social_id = null;
      }
      if (
        old_password == undefined ||
        old_password == null ||
        old_password == ""
      ) {
        old_password = "";
      } else {
        old_password = utils.encryptPassword(old_password);
      }

      User.findOne({ _id: user_id }).then(
        (user) => {
          if (user) {
            if (
              social_id == null &&
              old_password != "" &&
              old_password != user.password
            ) {
              response_data.json({
                success: false,
                error_code: USER_ERROR_CODE.INVALID_PASSWORD,
              });
            } else if (
              social_id != null &&
              user.social_ids.indexOf(social_id) < 0
            ) {
              response_data.json({
                success: false,
                error_code: USER_ERROR_CODE.USER_NOT_REGISTER_WITH_SOCIAL,
              });
            } else {
              Country.findOne({ _id: user.country_id }).then(
                (country) => {
                  var new_email = request_data_body.email;
                  var new_phone = request_data_body.phone;

                  if (request_data_body.new_password != "") {
                    var new_password = utils.encryptPassword(
                      request_data_body.new_password
                    );
                    request_data_body.password = new_password;
                  }
                  request_data_body.social_ids = user.social_ids;
                  User.findOne({
                    _id: { $ne: user_id },
                    email: new_email,
                  }).then(
                    (user_details) => {
                      var is_update = false;
                      if (user_details) {
                        if (
                          setting_detail.is_user_mail_verification &&
                          (request_data_body.is_email_verified != null ||
                            request_data_body.is_email_verified != undefined)
                        ) {
                          is_update = true;
                          user_details.email =
                            "notverified" + user_details.email;
                          user_details.is_email_verified = false;
                          user_details.save();
                        }
                      } else {
                        is_update = true;
                      }

                      if (is_update) {
                        is_update = false;
                        User.findOne({
                          _id: { $ne: user_id },
                          phone: new_phone,
                        }).then((user_phone_details) => {
                          if (user_phone_details) {
                            if (
                              setting_detail.is_user_sms_verification &&
                              (request_data_body.is_phone_number_verified !=
                                null ||
                                request_data_body.is_phone_number_verified !=
                                  undefined)
                            ) {
                              is_update = true;
                              user_phone_details.phone =
                                "00" + user_phone_details.phone;
                              user_phone_details.is_phone_number_verified = false;
                              user_phone_details.save();
                            }
                          } else {
                            is_update = true;
                          }
                          if (is_update == true) {
                            var social_id_array = [];
                            if (social_id != null) {
                              social_id_array.push(social_id);
                            }
                            var user_update_query = {
                              $or: [
                                { password: old_password },
                                { social_ids: { $all: social_id_array } },
                              ],
                            };
                            user_update_query = {
                              $and: [{ _id: user_id }, user_update_query],
                            };

                            User.findOneAndUpdate(
                              user_update_query,
                              request_data_body,
                              { new: true }
                            ).then((user_data) => {
                              if (user_data) {
                                var image_file = request_data.files;
                                if (
                                  image_file != undefined &&
                                  image_file.length > 0
                                ) {
                                  utils.deleteImageFromFolder(
                                    user_data.image_url,
                                    FOLDER_NAME.USER_PROFILES
                                  );
                                  var image_name =
                                    user_data._id +
                                    utils.generateServerToken(4);
                                  var url =
                                    utils.getStoreImageFolderPath(
                                      FOLDER_NAME.USER_PROFILES
                                    ) +
                                    image_name +
                                    FILE_EXTENSION.USER;
                                  utils.storeImageToFolder(
                                    image_file[0].path,
                                    image_name + FILE_EXTENSION.USER,
                                    FOLDER_NAME.USER_PROFILES
                                  );
                                  user_data.image_url = url;
                                }

                                // var first_name = utils.get_string_with_first_letter_upper_case(
                                //   request_data_body.first_name
                                // );

                                var first_name = request_data_body.first_name;
                                var last_name = request_data_body.last_name;

                                // var last_name = utils.get_string_with_first_letter_upper_case(
                                //   request_data_body.last_name
                                // );
                                user_data.first_name = first_name;
                                user_data.last_name = last_name;
                                if (
                                  request_data_body.is_phone_number_verified !=
                                  undefined
                                ) {
                                  user_data.is_phone_number_verified =
                                    request_data_body.is_phone_number_verified;
                                }
                                if (
                                  request_data_body.is_email_verified !=
                                  undefined
                                ) {
                                  user_data.is_email_verified =
                                    request_data_body.is_email_verified;
                                }

                                user_data.save().then(
                                  () => {
                                    response_data.json({
                                      success: true,
                                      message:
                                        USER_MESSAGE_CODE.UPDATE_SUCCESSFULLY,
                                      minimum_phone_number_length:
                                        country.minimum_phone_number_length,
                                      maximum_phone_number_length:
                                        country.maximum_phone_number_length,
                                      user: user_data,
                                    });
                                  },
                                  (error) => {
                                    response_data.json({
                                      success: false,
                                      error_code:
                                        ERROR_CODE.SOMETHING_WENT_WRONG,
                                    });
                                  }
                                );
                              } else {
                                response_data.json({
                                  success: false,
                                  error_code: USER_ERROR_CODE.UPDATE_FAILED,
                                });
                              }
                            });
                          } else {
                            response_data.json({
                              success: false,
                              error_code:
                                USER_ERROR_CODE.PHONE_NUMBER_ALREADY_REGISTRED,
                            });
                          }
                        });
                      } else {
                        response_data.json({
                          success: false,
                          error_code: USER_ERROR_CODE.EMAIL_ALREADY_REGISTRED,
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
            response_data.json({
              success: false,
              error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
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
// USER UPDATE PROFILE DETAILS
// exports.user_update = function (request_data, response_data) {
//   utils.check_request_params(request_data.body, [], function (response) {
//     if (response.success) {
//       var request_data_body = request_data.body;
//
//       var user_id = request_data_body.user_id;
//       var old_password = request_data_body.old_password;
//       var social_id = request_data_body.social_id;
//       if (social_id == undefined || social_id == null || social_id == "") {
//         social_id = null;
//       }
//       if (
//         old_password == undefined ||
//         old_password == null ||
//         old_password == ""
//       ) {
//         old_password = "";
//       } else {
//         old_password = utils.encryptPassword(old_password);
//       }

//       User.findOne({ _id: user_id }).then( (user) => {
//         if (user) {
//           if (
//             request_data_body.server_token !== null &&
//             user.server_token !== request_data_body.server_token
//           ) {
//             response_data.json({
//               success: false,
//               error_code: USER_ERROR_CODE.INVALID_SERVER_TOKEN,
//             });
//           } else if (
//             social_id == null &&
//             old_password != "" &&
//             old_password != user.password
//           ) {
//             response_data.json({
//               success: false,
//               error_code: USER_ERROR_CODE.INVALID_PASSWORD,
//             });
//           } else if (
//             social_id != null &&
//             user.social_ids.indexOf(social_id) < 0
//           ) {
//             response_data.json({
//               success: false,
//               error_code: USER_ERROR_CODE.USER_NOT_REGISTER_WITH_SOCIAL,
//             });
//           } else {
//             Country.findOne({ _id: user.country_id }).then( (country) => {
//               var new_email = request_data_body.email;
//               var new_phone = request_data_body.phone;

//               if (request_data_body.new_password != "") {
//                 var new_password = utils.encryptPassword(
//                   request_data_body.new_password
//                 );
//                 request_data_body.password = new_password;
//               }
//               request_data_body.social_ids = user.social_ids;
//               User.findOne({
//                 _id: { $ne: user_id },
//                 email: new_email,
//               }).then( (user_details) => {
//                 var is_update = false;
//                 if (user_details) {
//                   if (
//                     setting_detail.is_user_mail_verification &&
//                     (request_data_body.is_email_verified != null ||
//                       request_data_body.is_email_verified != undefined)
//                   ) {
//                     is_update = true;
//                     user_details.email =
//                       "notverified" + user_details.email;
//                     user_details.is_email_verified = false;
//                     user_details.save();
//                   }
//                 } else {
//                   is_update = true;
//                 }
//                 if (is_update) {
//                   is_update = false;
//                   User.findOne({
//                     _id: { $ne: user_id },
//                     phone: new_phone,
//                   }).then((user_phone_details) => {
//                     if (user_phone_details) {
//                       if (
//                         setting_detail.is_user_sms_verification &&
//                         (request_data_body.is_phone_number_verified !=
//                           null ||
//                           request_data_body.is_phone_number_verified !=
//                             undefined)
//                       ) {
//                         is_update = true;
//                         user_phone_details.phone =
//                           "00" + user_phone_details.phone;
//                         user_phone_details.is_phone_number_verified = false;
//                         user_phone_details.save();
//                       }
//                     } else {
//                       is_update = true;
//                     }
//                     if (is_update == true) {
//                       var social_id_array = [];
//                       if (social_id != null) {
//                         social_id_array.push(social_id);
//                       }
//                       var user_update_query = {
//                         $or: [
//                           { password: old_password },
//                           { social_ids: { $all: social_id_array } },
//                         ],
//                       };
//                       user_update_query = {
//                         $and: [{ _id: user_id }, user_update_query],
//                       };
//                       User.findOneAndUpdate(
//                         user_update_query,
//                         request_data_body,
//                         { new: true }
//                       ).then((user_data) => {
//                         if (user_data) {
//                           var image_file = request_data.files;
//                           if (
//                             image_file != undefined &&
//                             image_file.length > 0
//                           ) {
//                             utils.deleteImageFromFolder(
//                               user_data.image_url,
//                               FOLDER_NAME.USER_PROFILES
//                             );
//                             var image_name = user_data._id + utils.generateServerToken(4);
//                             var url = utils.getStoreImageFolderPath( FOLDER_NAME.USER_PROFILES ) + image_name + FILE_EXTENSION.USER;
//                             utils.storeImageToFolder(
//                               image_file[0].path,
//                               image_name + FILE_EXTENSION.USER,
//                               FOLDER_NAME.USER_PROFILES
//                             );
//                             user_data.image_url = url;
//                           }
//                           var first_name = utils.get_string_with_first_letter_upper_case(
//                             request_data_body.first_name
//                           );
//                           var last_name = utils.get_string_with_first_letter_upper_case(
//                             request_data_body.last_name
//                           );
//                           user_data.first_name = first_name;
//                           user_data.last_name = last_name;
//                           if (
//                             request_data_body.is_phone_number_verified !=
//                             undefined
//                           ) {
//                             user_data.is_phone_number_verified =
//                             request_data_body.is_phone_number_verified;
//                           }
//                           if (
//                             request_data_body.is_email_verified !=
//                             undefined
//                           ) {
//                             user_data.is_email_verified =
//                               request_data_body.is_email_verified;
//                           }
//                           user_data.save().then( () => {
//                             response_data.json({
//                               success: true,
//                               message: USER_MESSAGE_CODE.UPDATE_SUCCESSFULLY,
//                               minimum_phone_number_length: country.minimum_phone_number_length,
//                               maximum_phone_number_length: country.maximum_phone_number_length,
//                               user: user_data,
//                             });
//                           }, (error) => {
//
//                             response_data.json({
//                               success: false,
//                               error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
//                             });
//                           });
//                         } else {
//                           response_data.json({
//                             success: false,
//                             error_code: USER_ERROR_CODE.UPDATE_FAILED,
//                           });
//                         }
//                       });
//                     } else {
//                       response_data.json({
//                         success: false,
//                         error_code:
//                           USER_ERROR_CODE.PHONE_NUMBER_ALREADY_REGISTRED,
//                       });
//                     }
//                   });
//                 } else {
//                   response_data.json({
//                     success: false,
//                     error_code: USER_ERROR_CODE.EMAIL_ALREADY_REGISTRED,
//                   });
//                 }
//               }, (error) => {
//
//                 response_data.json({
//                   success: false,
//                   error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
//                 });
//               });
//             }, (error) => {
//
//               response_data.json({
//                 success: false,
//                 error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
//               });
//             });
//           }
//         } else {
//           response_data.json({
//             success: false,
//             error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
//           });
//         }
//       }, (error) => {
//
//         response_data.json({
//           success: false,
//           error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
//         });
//       });
//     } else {
//       response_data.json(response);
//     }
//   });
// };

// SET DEFAULT ADDRESS
exports.set_default_address = async function (req, res) {
  const { user_id, latitude, longitude, cart_id, store_id } = req.body;
  var address_list = [];
  const setting = await Setting.findOne({});
  const limit = setting.user_default_address_limit_in_meters / 1000;
  const fav_address = await User_favourite_address.find({
    user_id: user_id,
  }).lean();

  let inside = false;
  if (store_id) {
    const store = await Store.findOne({ _id: store_id });
    store.radius_regions.forEach(async (c) => {
      const coord = c.kmlzone.coordinates;
      if (coord && coord[0]) {
        const coordinates = coord[0].map(([long, lat]) => {
          return {
            latitude: lat,
            longitude: long,
          };
        });
        const isInside = geolib.isPointInPolygon(
          {
            latitude: latitude,
            longitude: longitude,
          },
          coordinates
        );
        if (isInside) {
          inside = true;
          store.isInside = isInside;
          store.user_radius_zone = c;
        }
      }
    });
  }
  if (fav_address.length == 0) {
    res.json({
      success: false,
      inside: inside,
      message:
        "Seems like you're far from the selected address. Still deliver here?",
    });
    return;
  }
  fav_address.forEach(function (address) {
    const dist = utils.getDistanceFromTwoLocation(
      [latitude, longitude],
      address.location
    );
    address = { ...address, distance: dist };
    address_list.push(address);
  });
  address_list.sort(function (a, b) {
    if (a.distance < b.distance) {
      return -1;
    } else if (a.distance > b.distance) {
      return 1;
    } else {
      return 0;
    }
  });
  if (address_list.length && address_list[0].distance < limit) {
    await User_favourite_address.updateMany(
      { user_id: user_id },
      { $set: { is_default_address: false } }
    );
    await User_favourite_address.findOneAndUpdate(
      { _id: address_list[0]._id },
      { is_default_address: true }
    );
    if (cart_id) {
      const cart = await Cart.findOne({ _id: cart_id });
      const user = await User.findOne({ _id: user_id });
      if (cart) {
        const destination_add = {
          address: address_list[0].address ? address_list[0].address : "",
          address_type: "destination",
          appartmentno: address_list[0].appartmentno
            ? address_list[0].appartmentno
            : "",
          building_no: address_list[0].building_no
            ? address_list[0].building_no
            : "",
          city: user.city ? user.city : "Dubai",
          delivery_status: 0,
          location: address_list[0].location,
          note: "",
          user_details: {
            country_phone_code: user.country_phone_code,
            email: user.email,
            name: user.first_name,
            phone: user.phone,
          },
          user_type: 7,
        };
        cart.destination_addresses = [destination_add];
        await cart.save();
      }
    }
    res.json({
      success: true,
      inside: inside,
      message:
        "Seems like you're far from the selected address. Still deliver here?",
      nearby_address: address_list[0],
    });
    return;
  } else {
    res.json({
      success: false,
      inside: inside,
      message:
        "Seems like you're far from the selected address. Still deliver here?",
    });
    return;
  }
};

// GET USER DETAILS
exports.get_detail = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;

      User.findOne({ _id: request_data_body.user_id }).then(
        async (user) => {
          if (user) {
            {
              const default_address = await User_favourite_address.findOne({
                user_id: request_data_body.user_id,
                is_default_address: true,
              });
              Country.findOne({ _id: user.country_id }).then(
                (country) => {
                  user.app_version = request_data_body.app_version;
                  if (request_data_body.device_token != undefined) {
                    user.device_token = request_data_body.device_token;
                  }
                  user.save().then(
                    () => {
                      response_data.json({
                        success: true,
                        message: USER_MESSAGE_CODE.GET_DETAIL_SUCCESSFULLY,
                        minimum_phone_number_length:
                          country.minimum_phone_number_length,
                        maximum_phone_number_length:
                          country.maximum_phone_number_length,
                        user: user,
                        // default_address: default_address,
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
          } else {
            response_data.json({
              success: false,
              error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
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

// UPDATE USER DEVICE TOKEN
exports.update_device_token = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "device_token", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        User.findOne({ _id: request_data_body.user_id }).then(
          (user) => {
            if (user) {
              user.device_token = request_data_body.device_token;
              user.save().then(
                () => {
                  response_data.json({
                    success: true,
                    message: USER_MESSAGE_CODE.DEVICE_TOKEN_UPDATE_SUCCESSFULLY,
                  });
                  return;
                },
                (error) => {
                  response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                  });
                  return;
                }
              );
            } else {
              response_data.json({
                success: false,
                error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
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

// AFTER EMAIL PHONE VERIFICATION CALL API
exports.user_otp_verification = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      User.findOne({ _id: request_data_body.user_id }).then(
        (user) => {
          if (user) {
            if (request_data_body.is_phone_number_verified != undefined) {
              user.is_phone_number_verified =
                request_data_body.is_phone_number_verified;
              if (user.phone != request_data_body.phone) {
                User.findOne({ phone: request_data_body.phone }).then(
                  (user_phone_detail) => {
                    if (user_phone_detail) {
                      user_phone_detail.phone =
                        utils.getNewPhoneNumberFromOldNumber(
                          user_phone_detail.phone
                        );
                      user_phone_detail.is_phone_number_verified = false;
                      user_phone_detail.save();
                    }
                  }
                );
                user.phone = request_data_body.phone;
              }
            }
            if (request_data_body.is_email_verified != undefined) {
              user.is_email_verified = request_data_body.is_email_verified;
              if (user.email != request_data_body.email) {
                User.findOne({ email: request_data_body.email }).then(
                  (user_email_detail) => {
                    if (user_email_detail) {
                      user_email_detail.email =
                        "notverified" + user_email_detail.email;
                      user_email_detail.is_email_verified = false;
                      user_email_detail.save();
                    }
                  }
                );
                user.email = request_data_body.email;
              }
            }

            user.save().then(
              () => {
                response_data.json({
                  success: true,
                  message: USER_MESSAGE_CODE.OTP_VERIFICATION_SUCCESSFULLY,
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
              error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
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

// USER LOGOUT
exports.logout = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      User.findOne({ _id: request_data_body.user_id }).then(
        (user) => {
          if (user) {
            user.device_token = "";
            user.server_token = "";
            user.save().then(
              () => {
                response_data.json({
                  success: true,
                  message: USER_MESSAGE_CODE.LOGOUT_SUCCESSFULLY,
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
              error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
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

exports.getStoreFromUserLocation = async function (lat, long, stores) {
  var store_list = [];

  stores.forEach(function (store) {
    store.distance = utils.getDistanceFromTwoLocation(
      [lat, long],
      store.location
    );

    store_list.push(store);
  });
  store_list.sort(function (a, b) {
    return a.distance - b.distance;
  });

  const _stores = await getStoresBasedOnLocation({
    stores: store_list,
    latitude: lat,
    longitude: long,
  });
  _stores.sort(function (a, b) {
    return a.store_sequence - b.store_sequence;
  });
  return _stores;
};

// CHECK STORE DELIVERY LOCATION, PASS LAT-LONG AND STORE_ID

exports.check_serving_at_location = async function (req, res) {
  const { latitude, longitude } = req.body;
  const stores = await Store.aggregate([
    {
      $match: {
        $and: [
          { is_approved: { $eq: true } },
          { is_business: { $eq: true } },
          { is_visible: { $eq: true } },
        ],
      },
    },
  ]);
  if (stores.length == 0) {
    res.json({
      success: false,
      count: 0,
    });
    return;
  }

  const _stores = await getStoresBasedOnLocation({
    stores,
    latitude,
    longitude,
  });
  res.json({
    success: _stores.length > 0 ? true : false,
    count: _stores.length > 0 ? _stores.length : 0,
  });
};
exports.check_store_delivery_location = async function (req, res) {
  const { latitude, longitude, store_id } = req.body;
  let inside = false;
  const store = await Store.findOne({ _id: store_id });
  store.radius_regions.forEach(async (c) => {
    const coord = c.kmlzone.coordinates;
    if (coord && coord[0]) {
      const coordinates = coord[0].map(([long, lat]) => {
        return {
          latitude: lat,
          longitude: long,
        };
      });
      const isInside = geolib.isPointInPolygon(
        {
          latitude: latitude,
          longitude: longitude,
        },
        coordinates
      );
      if (isInside) {
        inside = true;
        store.isInside = isInside;
        store.user_radius_zone = c;
      }
    }
  });
  if (inside) {
    res.json({
      success: true,
      inside: inside,
      // store : store,
    });
  } else {
    res.json({
      success: false,
      inside: inside,
      // store
    });
  }
};

// GET DELIVERY LIST OF CITY, pass CITY NAME - LAT LONG
exports.get_delivery_list_for_nearest_city = function (req, res) {
  utils.check_request_params(
    req.body,
    [
      { name: "country", type: "string" },
      { name: "latitude" },
      { name: "longitude" },
    ],
    async function (response) {
      if (response.success) {
        var request_data_body = req.body;

        var {
          country,
          country_code,
          country_code_2,
          latitude,
          longitude,
          user_id,
        } = request_data_body;
        var server_time = new Date(moment(new Date()).utc().valueOf());
        const country_data = await Country.findOne({
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
        });

        if (!country_data) {
          res.json({
            success: false,
            error_code: COUNTRY_ERROR_CODE.BUSINESS_NOT_IN_YOUR_COUNTRY,
          });
          return;
        }
        var city_lat_long = [latitude, longitude];
        var country_id = country_data._id;
        const cityList = await City.find({
          country_id: country_id,
          is_business: true,
        });
        if (cityList.length == 0) {
          res.json({
            success: false,
            error_code: CITY_ERROR_CODE.BUSINESS_NOT_IN_YOUR_CITY,
          });
          return;
        }
        var count = 0;
        var size = cityList.length;
        var finalCityId = null;
        var finalDistance = 1000000;

        cityList.forEach(async function (city_detail) {
          count++;
          if (city_detail.is_use_radius) {
            var cityLatLong = city_detail.city_lat_long;
            var distanceFromSubAdminCity = utils.getDistanceFromTwoLocation(
              city_lat_long,
              cityLatLong
            );
            var cityRadius = city_detail.city_radius;

            if (distanceFromSubAdminCity < cityRadius) {
              if (distanceFromSubAdminCity < finalDistance) {
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
            if (finalCityId == null) {
              res.json({
                success: false,
                error_code: CITY_ERROR_CODE.BUSINESS_NOT_IN_YOUR_CITY,
              });
              return;
            }
            var city_id = finalCityId;
            var delivery_query = {
              $lookup: {
                from: "deliveries",
                localField: "deliveries_in_city",
                foreignField: "_id",
                as: "deliveries",
              },
            };

            var cityid_condition = {
              $match: { _id: { $eq: city_id } },
            };
            const city = await City.aggregate([
              cityid_condition,
              delivery_query,
            ]);

            if (city.length == 0) {
              res.json({
                success: false,
                error_code:
                  DELIVERY_ERROR_CODE.DELIVERY_DATA_NOT_FOUND_IN_YOUR_CITY,
              });

              return;
            }
            let city1 = city.map(
              ({
                city_locations,
                payment_gateway,
                is_cash_payment_mode,
                is_other_payment_mode,
                is_promo_apply,
                is_use_radius,
                zone_business,
                is_ads_visible,
                is_business,
                city_radius,
                is_check_provider_wallet_amount_for_received_cash_request,
                provider_min_wallet_amount_for_received_cash_request,
                is_provider_earning_add_in_wallet_on_cash_payment,
                is_store_earning_add_in_wallet_on_cash_payment,
                is_provider_earning_add_in_wallet_on_other_payment,
                is_store_earning_add_in_wallet_on_other_payment,
                daily_cron_date,
                ...rest
              }) => ({ ...rest })
            );
            if (!city[0].is_business) {
              res.json({
                success: false,
                error_code:
                  DELIVERY_ERROR_CODE.DELIVERY_DATA_NOT_FOUND_IN_YOUR_CITY,
              });
              return;
            }
            const adv = await storeAdvFromUserLocation(latitude, longitude, 1);
            if (!request_data_body.is_courier) {
              Delivery.find(
                {
                  _id: {
                    $in: city[0].deliveries_in_city,
                  },
                  is_business: true,
                },
                function (error, delivery) {
                  if (delivery.length == 0) {
                    response_data.json({
                      success: false,
                      error_code:
                        DELIVERY_ERROR_CODE.DELIVERY_DATA_NOT_FOUND_IN_YOUR_CITY,
                    });
                    return;
                  } else {
                    var condition = {
                      $match: {
                        $and: [
                          {
                            country_id: {
                              $eq: country_id,
                            },
                          },
                          {
                            ads_for: {
                              $eq: ADS_TYPE.FOR_DELIVERY_LIST,
                            },
                          },
                          {
                            is_ads_visible: { $eq: true },
                          },
                          {
                            $or: [
                              {
                                city_id: {
                                  $eq: city[0]._id,
                                },
                              },
                              {
                                city_id: {
                                  $eq: mongoose.Types.ObjectId(
                                    ID_FOR_ALL.ALL_ID
                                  ),
                                },
                              },
                            ],
                          },
                        ],
                      },
                    };
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

                    var store_condition = {
                      $match: {
                        $or: [
                          {
                            is_ads_redirect_to_store: {
                              $eq: false,
                            },
                          },
                          {
                            $and: [
                              {
                                is_ads_redirect_to_store: {
                                  $eq: true,
                                },
                              },
                              {
                                "store_detail.is_approved": {
                                  $eq: true,
                                },
                              },
                              {
                                "store_detail.is_business": {
                                  $eq: true,
                                },
                              },
                            ],
                          },
                        ],
                      },
                    };
                    if (request_data_body.user_id == "") {
                      Advertise.aggregate(
                        [
                          condition,
                          store_query,
                          array_to_json_store_detail,
                          store_condition,
                        ],
                        function (error, advertise) {
                          if (
                            city[0] &&
                            city[0].is_ads_visible &&
                            country_data &&
                            country_data.is_ads_visible
                          ) {
                            ads = advertise;
                          }
                          res.json({
                            success: true,
                            message:
                              DELIVERY_MESSAGE_CODE.DELIVERY_LIST_FOR_NEAREST_CITY_SUCCESSFULLY,
                            recent_orders: [],
                            city: city1[0],
                            // deliveries: delivery,
                            ads: adv,
                            city_data: request_data_body,
                            currency_code: country_data.currency_code,
                            country_id: country_data._id,
                            currency_sign: country_data.currency_sign,
                            server_time: server_time,
                          });
                        }
                      );
                      return;
                    } else {
                      User.findOne({
                        _id: request_data_body.user_id,
                      }).then(async (user) => {
                        const user_condition = {
                          $match: {
                            user_id: {
                              $eq: mongoose.Types.ObjectId(
                                request_data_body.user_id
                              ),
                            },
                          },
                        };
                        const order_status_condition = {
                          $match: {
                            $or: [
                              {
                                order_status: ORDER_STATE.ORDER_COMPLETED,
                                is_user_show_invoice: true,
                              },
                              { order_status: ORDER_STATE.STORE_CANCELLED },
                              { order_status: ORDER_STATE.CANCELED_BY_USER },
                              { order_status: ORDER_STATE.STORE_REJECTED },
                            ],
                          },
                        };

                        // const recent_orders = await Order.find({ user_id : request_data_body.user_id}).sort({_id : -1}).limit(4)
                        const recent_orders = await Order.aggregate([
                          user_condition,
                          order_status_condition,
                          {
                            $lookup: {
                              from: "stores",
                              localField: "store_id",
                              foreignField: "_id",
                              as: "store_detail",
                            },
                          },
                          {
                            $unwind: {
                              path: "$store_detail",
                              preserveNullAndEmptyArrays: true,
                            },
                          },

                          {
                            $lookup: {
                              from: "cities",
                              localField: "city_id",
                              foreignField: "_id",
                              as: "city_detail",
                            },
                          },
                          { $unwind: "$city_detail" },

                          {
                            $lookup: {
                              from: "countries",
                              localField: "city_detail.country_id",
                              foreignField: "_id",
                              as: "country_detail",
                            },
                          },
                          { $unwind: "$country_detail" },
                          {
                            $lookup: {
                              from: "requests",
                              localField: "request_id",
                              foreignField: "_id",
                              as: "request_detail",
                            },
                          },
                          {
                            $unwind: {
                              path: "$request_detail",
                              preserveNullAndEmptyArrays: true,
                            },
                          },
                          {
                            $lookup: {
                              from: "order_payments",
                              localField: "order_payment_id",
                              foreignField: "_id",
                              as: "order_payment_detail",
                            },
                          },
                          { $unwind: "$order_payment_detail" },
                          { $sort: { _id: -1 } },
                          { $limit: 5 },
                          {
                            $project: {
                              created_at: "$created_at",
                              order_status: "$order_status",
                              order_status_id: "$order_status_id",
                              completed_at: "$completed_at",
                              is_ramadan_order: "$is_ramadan_order",
                              unique_id: "$unique_id",
                              total: "$order_payment_detail.total",
                              refund_amount:
                                "$order_payment_detail.refund_amount",
                              total_service_price:
                                "$order_payment_detail.total_service_price",
                              total_order_price:
                                "$order_payment_detail.total_order_price",
                              currency: "$country_detail.currency_sign",
                              user_pay_payment:
                                "$order_payment_detail.user_pay_payment",
                              checkout_amount:
                                "$order_payment_detail.checkout_amount",
                              delivery_type: "$delivery_type",
                              image_url: "$image_url",
                              request_detail: {
                                created_at: "$request_detail.created_at",
                                request_unique_id: "$request_detail.unique_id",
                                delivery_status:
                                  "$request_detail.delivery_status",
                                delivery_status_manage_id:
                                  "$request_detail.delivery_status_manage_id",
                              },
                              store_detail: {
                                name: {
                                  $cond: [
                                    "$store_detail",
                                    "$store_detail.name",
                                    "",
                                  ],
                                },
                                min_order_price: {
                                  $cond: [
                                    "$store_detail",
                                    "$store_detail.min_order_price",
                                    "",
                                  ],
                                },
                                image_url: {
                                  $cond: [
                                    "$store_detail",
                                    "$store_detail.image_url",
                                    "",
                                  ],
                                },
                              },
                            },
                          },
                        ]);

                        Advertise.aggregate(
                          [
                            condition,
                            store_query,
                            array_to_json_store_detail,
                            store_condition,
                          ],
                          function (error, advertise) {
                            if (
                              city[0] &&
                              city[0].is_ads_visible &&
                              country_data &&
                              country_data.is_ads_visible
                            ) {
                              ads = advertise;
                            }

                            res.json({
                              success: true,
                              message:
                                DELIVERY_MESSAGE_CODE.DELIVERY_LIST_FOR_NEAREST_CITY_SUCCESSFULLY,
                              recent_orders: recent_orders,
                              city: city1[0],
                              // deliveries: delivery,
                              ads: adv,
                              user: user,
                              city_data: request_data_body,
                              currency_code: country_data.currency_code,
                              country_id: country_data._id,
                              currency_sign: country_data.currency_sign,
                              server_time: server_time,
                            });
                          }
                        );
                      });
                      return;
                    }

                    // Advertise.find({
                    //     country_id: country_id,
                    //     $or: [{city_id: city[0]._id}, {city_id: mongoose.Types.ObjectId(ID_FOR_ALL.ALL_ID)}],
                    //     ads_for: ADS_TYPE.FOR_DELIVERY_LIST,
                    //     is_ads_visible: true
                    // }).then((advertise) => {
                    //     if (city[0] && city[0].is_ads_visible && country_data && country_data.is_ads_visible) {
                    //         ads = advertise;
                    //     }

                    //     response_data.json({
                    //         success: true,
                    //         message: DELIVERY_MESSAGE_CODE.DELIVERY_LIST_FOR_NEAREST_CITY_SUCCESSFULLY,
                    //         city: city[0],
                    //         deliveries: delivery,
                    //         ads: ads,
                    //         city_data: request_data_body,
                    //         currency_code: country_data.currency_code,
                    //         country_id: country_data._id,
                    //         currency_sign: country_data.currency_sign,
                    //         server_time: server_time
                    //     });
                    // }, (error) => {
                    //
                    //     response_data.json({
                    //         success: false,
                    //         error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                    //     });
                    // });
                  }
                }
              ).sort({ sequence_number: 1 });
              return;
            }
            res.json({
              success: true,
              message:
                DELIVERY_MESSAGE_CODE.DELIVERY_LIST_FOR_NEAREST_CITY_SUCCESSFULLY,
              recent_orders: [],
              city: city[0],
              city_data: request_data_body,
              currency_code: country_data.currency_code,
              is_delivery_new: country_data.is_delivery_new,
              currency_sign: country_data.currency_sign,
              country_id: country_data._id,
              server_time: server_time,
              ads: adv,
            });
          }
        });
      } else {
        res.json(response);
      }
    }
  );
};

const getUserAddressfromLatLong = async (user_id, latitude, longitude) => {
  var address_list = [];
  const setting = await Setting.findOne({});
  const limit = setting.user_default_address_limit_in_meters / 1000;
  const fav_address = await User_favourite_address.find({
    user_id: user_id,
  }).lean();
  if (fav_address.length == 0) {
    return {
      message: "",
    };
  }
  fav_address.forEach(function (address) {
    const dist = utils.getDistanceFromTwoLocation(
      [latitude, longitude],
      address.location
    );
    address = { ...address, distance: dist };
    address_list.push(address);
  });
  address_list.sort(function (a, b) {
    if (a.distance < b.distance) {
      return -1;
    } else if (a.distance > b.distance) {
      return 1;
    } else {
      return 0;
    }
  });
  if (address_list.length && address_list[0].distance < limit) {
    await User_favourite_address.updateMany(
      { user_id: user_id },
      { $set: { is_default_address: false } }
    );
    await User_favourite_address.findOneAndUpdate(
      { _id: address_list[0]._id },
      { is_default_address: true }
    );
    return {
      nearby_address: address_list[0],
    };
  } else {
    return {
      message:
        "Seems like you're far from the selected address. Still deliver here?",
    };
  }
};

exports.get_delivery_list_for_nearest_city_v2 = function (req, res) {
  console.log(
    "get_delivery_list_for_nearest_city_v2 >>>" + JSON.stringify(req.body)
  );
  utils.check_request_params(
    req.body,
    [
      { name: "country", type: "string" },
      { name: "latitude" },
      { name: "longitude" },
    ],
    async function (response) {
      if (response.success) {
        var request_data_body = req.body;

        var {
          country,
          country_code,
          country_code_2,
          latitude,
          longitude,
          user_id,
        } = request_data_body;
        let addressData = {};
        let home_page_item_store;
        var server_time = new Date(moment(new Date()).utc().valueOf());
        const country_data = await Country.findOne({
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
        });

        if (user_id) {
          addressData = await getUserAddressfromLatLong(
            user_id,
            latitude,
            longitude
          );
        }

        if (!country_data) {
          res.json({
            success: false,
            error_code: COUNTRY_ERROR_CODE.BUSINESS_NOT_IN_YOUR_COUNTRY,
          });
          return;
        }
        var city_lat_long = [latitude, longitude];
        var country_id = country_data._id;
        const cityList = await City.find({
          country_id: country_id,
          is_business: true,
        });
        if (cityList.length == 0) {
          res.json({
            success: false,
            error_code: CITY_ERROR_CODE.BUSINESS_NOT_IN_YOUR_CITY,
          });
          return;
        }
        var count = 0;
        var size = cityList.length;
        var finalCityId = null;
        var finalDistance = 1000000;

        cityList.forEach(async function (city_detail) {
          count++;
          if (city_detail.is_use_radius) {
            var cityLatLong = city_detail.city_lat_long;
            var distanceFromSubAdminCity = utils.getDistanceFromTwoLocation(
              city_lat_long,
              cityLatLong
            );
            var cityRadius = city_detail.city_radius;

            if (distanceFromSubAdminCity < cityRadius) {
              if (distanceFromSubAdminCity < finalDistance) {
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
            if (finalCityId == null) {
              res.json({
                success: false,
                error_code: CITY_ERROR_CODE.BUSINESS_NOT_IN_YOUR_CITY,
              });
              return;
            }
            var city_id = finalCityId;
            var delivery_query = {
              $lookup: {
                from: "deliveries",
                let: { deliveryId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: ["$$deliveryId", "$_id"],
                      is_business: true,
                    },
                  },
                ],
                as: "deliveries",
              },
            };

            var cityid_condition = {
              $match: { _id: { $eq: city_id } },
            };
            const city = await City.aggregate([
              cityid_condition,
              delivery_query,
            ]);

            if (city.length == 0) {
              res.json({
                success: false,
                error_code:
                  DELIVERY_ERROR_CODE.DELIVERY_DATA_NOT_FOUND_IN_YOUR_CITY,
              });

              return;
            }
            let city1 = city.map(
              ({
                city_locations,
                payment_gateway,
                is_cash_payment_mode,
                is_other_payment_mode,
                is_promo_apply,
                is_use_radius,
                zone_business,
                is_ads_visible,
                is_business,
                city_radius,
                admin_profit_value_on_delivery,
                admin_profit_mode_on_delivery,
                deliveries_in_city,
                city_lat_long,
                created_at,
                currency_sign,
                currency_code,
                is_check_provider_wallet_amount_for_received_cash_request,
                provider_min_wallet_amount_for_received_cash_request,
                is_provider_earning_add_in_wallet_on_cash_payment,
                is_store_earning_add_in_wallet_on_cash_payment,
                is_provider_earning_add_in_wallet_on_other_payment,
                is_store_earning_add_in_wallet_on_other_payment,
                daily_cron_date,
                ...rest
              }) => ({ ...rest })
            );
            let filteredDeliveries = [];
            city1[0].deliveries.forEach(async (del) => {
              const store_list = await Store.find(
                {
                  store_delivery_id: mongoose.Types.ObjectId(del._id),
                  is_approved: true,
                  is_business: true,
                  is_visible: true,
                }
                // { location: 1 , radius_regions: 1,  name : 1}
              ).lean();
              var filteredStores = await exports.getStoreFromUserLocation(
                latitude,
                longitude,
                store_list
              );
              if (filteredStores.length > 0) {
                filteredDeliveries.push(del);
              }
              filteredDeliveries.sort(function (a, b) {
                if (a.sequence_number < b.sequence_number) {
                  return -1;
                } else if (a.sequence_number > b.sequence_number) {
                  return 1;
                } else {
                  return 0;
                }
              });
            });
            city1[0].deliveries = filteredDeliveries;
            if (!city[0].is_business) {
              res.json({
                success: false,
                error_code:
                  DELIVERY_ERROR_CODE.DELIVERY_DATA_NOT_FOUND_IN_YOUR_CITY,
              });
              return;
            }
            const adv = await storeAdvFromUserLocation(latitude, longitude, 1);
            if (request_data_body.is_courier) {
              res.json({
                success: true,
                message:
                  DELIVERY_MESSAGE_CODE.DELIVERY_LIST_FOR_NEAREST_CITY_SUCCESSFULLY,
                city: city[0],
                city_data: request_data_body,
                // currency_code: country_data.currency_code,
                is_delivery_new: country_data.is_delivery_new,
                // currency_sign: country_data.currency_sign,
                country_id: country_data._id,
                server_time: server_time,
                ads: adv,
              });
              return;
            }
            var ads = [];
            const delivery = await Delivery.find({
              _id: {
                $in: city[0].deliveries_in_city,
              },
              is_business: true,
            })
              .sort({ sequence_number: 1 })
              .lean();

            if (delivery.length == 0) {
              response_data.json({
                success: false,
                error_code:
                  DELIVERY_ERROR_CODE.DELIVERY_DATA_NOT_FOUND_IN_YOUR_CITY,
              });
              return;
            } else {
              let deliveries = [];
              await asyncForEach(delivery, async (del) => {
                const { count, stores } = await getStoreCountBasedOnLocation(
                  latitude,
                  longitude,
                  del._id
                );
                if (!home_page_item_store) {
                  home_page_item_store = stores.find(
                    (s) => s.show_items_home_page
                  );
                }
                if (count) {
                  deliveries.push({
                    ...del,
                    store_count: count,
                    store_id: count === 1 ? stores[0]._id : "",
                    // stores,
                  });
                }
              });
              city1[0].deliveries = deliveries;
            }
            var condition = {
              $match: {
                $and: [
                  { country_id: { $eq: country_id } },
                  { ads_for: { $eq: ADS_TYPE.FOR_DELIVERY_LIST } },
                  {
                    is_ads_visible: { $eq: true },
                  },
                  {
                    $or: [
                      {
                        city_id: {
                          $eq: city[0]._id,
                        },
                      },
                      {
                        city_id: {
                          $eq: mongoose.Types.ObjectId(ID_FOR_ALL.ALL_ID),
                        },
                      },
                    ],
                  },
                ],
              },
            };
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

            var store_condition = {
              $match: {
                $or: [
                  {
                    is_ads_redirect_to_store: {
                      $eq: false,
                    },
                  },
                  {
                    $and: [
                      {
                        is_ads_redirect_to_store: {
                          $eq: true,
                        },
                      },
                      {
                        "store_detail.is_approved": {
                          $eq: true,
                        },
                      },
                      {
                        "store_detail.is_business": {
                          $eq: true,
                        },
                      },
                    ],
                  },
                ],
              },
            };

            const advertise = await Advertise.aggregate([
              condition,
              store_query,
              array_to_json_store_detail,
              store_condition,
            ]);
            if (
              city[0] &&
              city[0].is_ads_visible &&
              country_data &&
              country_data.is_ads_visible
            ) {
              ads = advertise.filter((a) => !a.in_app_notification);
            }

            let response = {
              success: true,
              message:
                DELIVERY_MESSAGE_CODE.DELIVERY_LIST_FOR_NEAREST_CITY_SUCCESSFULLY,
              city: city1[0],
              ads: adv,
              // recent_orders:recentOrders({user_id:request_data_body.user_id}),
              city_data: request_data_body,
              // currency_code: country_data.currency_code,
              is_delivery_new: country_data.is_delivery_new,
              country_id: country_data._id,
              // currency_sign: country_data.currency_sign,
              server_time: server_time,
              // homepage_items:getHomePageItems({store_id:home_page_item_store._id}),
            };
            if (request_data_body.user_id) {
              let user = await User.findOne({
                _id: request_data_body.user_id,
              });
              const setting = await Installation_setting.findOne({});

              if (setting.is_received_in_app_notification) {
                response.user = { ...user.toJSON() };
                response.is_received_in_app_notification =
                  user.is_received_in_app_notification;
                user.is_received_in_app_notification = true;
              } else {
                user.is_received_in_app_notification = true;
                response.is_received_in_app_notification =
                  user.is_received_in_app_notification;
                response.user = { ...user.toJSON() };
              }
              user.save();
              response = { ...response, ...addressData };
            } else {
              let unrUser = await unregisteredUser.findOne({
                device_token: request_data_body.device_token,
              });
              if (unrUser) {
                response.is_received_in_app_notification =
                  unrUser.is_received_in_app_notification;
                unrUser.is_received_in_app_notification = true;
                await unrUser.save();
              } else {
                unrUser = await unregisteredUser.create({
                  device_token: request_data_body.device_token,
                });
                response.is_received_in_app_notification =
                  unrUser.is_received_in_app_notification;
              }
            }

            response.in_app_ad = await Advertise.findOne({
              in_app_notification: true,
              is_ads_visible: true,
            }).lean();
            res.json(response);
          }
        });
      } else {
        res.json(response);
      }
    }
  );
};

// GET STORE LIST AFTER CLICK ON DELIVERIES
exports.get_store_list_old = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [
      { name: "city_id", type: "string" },
      { name: "store_delivery_id", type: "string" },
    ],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var Schema = mongoose.Types.ObjectId;
        var server_time = new Date(moment(new Date()).utc().valueOf());
        var city_id = request_data_body.city_id;
        var store_delivery_id = request_data_body.store_delivery_id;
        var ads = [];
        Advertise.find({
          $or: [
            { city_id: request_data_body.city_id },
            { city_id: mongoose.Types.ObjectId(ID_FOR_ALL.ALL_ID) },
          ],
          ads_for: ADS_TYPE.STORE_LIST,
          is_ads_visible: true,
        }).then(
          (advertise) => {
            City.findOne({ _id: city_id }).then(
              (city) => {
                if (city) {
                  var city_lat_long = city.city_lat_long;

                  if (
                    request_data_body.latitude &&
                    request_data_body.longitude
                  ) {
                    city_lat_long = [
                      request_data_body.latitude,
                      request_data_body.longitude,
                    ];
                  }

                  var distance = city.city_radius / UNIT.DEGREE_TO_KM;

                  Country.findOne({ _id: city.country_id }).then(
                    (country) => {
                      if (
                        city &&
                        city.is_ads_visible &&
                        country &&
                        country.is_ads_visible
                      ) {
                        ads = advertise;
                      }

                      var store_location_query = {
                        $geoNear: {
                          near: city_lat_long,
                          distanceField: "distance",
                          uniqueDocs: true,
                          maxDistance: 100000000,
                        },
                      };

                      Store.aggregate([
                        store_location_query,
                        {
                          $match: {
                            $and: [
                              { is_approved: { $eq: true } },
                              { is_business: { $eq: true } },
                              { is_visible: { $eq: true } },
                              { city_id: { $eq: Schema(city_id) } },
                              {
                                store_delivery_id: {
                                  $eq: Schema(store_delivery_id),
                                },
                              },
                            ],
                          },
                        },
                        {
                          $lookup: {
                            from: "items",
                            localField: "_id",
                            foreignField: "store_id",
                            as: "item_detail",
                          },
                        },
                        {
                          $group: {
                            _id: "$_id",
                            name: { $first: "$name" },
                            image_url: { $first: "$image_url" },
                            delivery_time: { $first: "$delivery_time" },
                            delivery_time_max: { $first: "$delivery_time_max" },
                            user_rate: { $first: "$user_rate" },
                            user_rate_count: { $first: "$user_rate_count" },
                            delivery_radius: { $first: "$delivery_radius" },
                            is_provide_delivery_anywhere: {
                              $first: "$is_provide_delivery_anywhere",
                            },
                            website_url: { $first: "$website_url" },
                            slogan: { $first: "$slogan" },
                            is_visible: { $first: "$is_visible" },
                            is_store_busy: { $first: "$is_store_busy" },
                            phone: { $first: "$phone" },
                            item_tax: { $first: "$item_tax" },
                            is_use_item_tax: { $first: "$is_use_item_tax" },
                            country_phone_code: {
                              $first: "$country_phone_code",
                            },
                            famous_products_tags: {
                              $first: "$famous_products_tags",
                            },
                            store_time: { $first: "$store_time" },
                            location: { $first: "$location" },
                            address: { $first: "$address" },
                            is_taking_schedule_order: {
                              $first: "$is_taking_schedule_order",
                            },
                            is_order_cancellation_charge_apply: {
                              $first: "$is_order_cancellation_charge_apply",
                            },

                            is_store_pay_delivery_fees: {
                              $first: "$is_store_pay_delivery_fees",
                            },
                            branchio_url: { $first: "$branchio_url" },
                            referral_code: { $first: "$referral_code" },
                            price_rating: { $first: "$price_rating" },
                            items: { $first: "$item_detail.name" },
                            distance: { $first: "$distance" },
                          },
                        },
                        {
                          $sort: { distance: 1 },
                        },
                      ]).then(
                        (stores) => {
                          if (stores.length == 0) {
                            response_data.json({
                              success: false,
                              error_code: USER_ERROR_CODE.STORE_LIST_NOT_FOUND,
                            });
                          } else {
                            //
                            //
                            var store_list = [];
                            stores.forEach(function (store_detail, index) {
                              if (
                                store_detail.is_provide_delivery_anywhere ==
                                  true ||
                                (store_detail.is_provide_delivery_anywhere ==
                                  false &&
                                  store_detail.distance <=
                                    store_detail.delivery_radius)
                              ) {
                                store_list.push(store_detail);
                              }
                              if (index == stores.length - 1) {
                                if (store_list.length > 0) {
                                  response_data.json({
                                    success: true,
                                    message:
                                      USER_MESSAGE_CODE.GET_STORE_LIST_SUCCESSFULLY,
                                    server_time: server_time,
                                    ads: ads,
                                    stores: store_list,
                                    city_name: city.city_name,
                                  });
                                } else {
                                  response_data.json({
                                    success: false,
                                    error_code:
                                      USER_ERROR_CODE.STORE_LIST_NOT_FOUND,
                                  });
                                }
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

//04 mar 20
exports.get_store_list = function (req, res) {
  try {
    utils.check_request_params(
      req.body,
      [
        // { name: "city_id", type: "string" },
        { name: "store_delivery_id", type: "string" },
      ],
      async function (response) {
        if (!response.success) {
          res.json(response);
          return;
        }

        var request_data_body = req.body;
        var { city_id, store_delivery_id, latitude, longitude } =
          request_data_body;
        var Schema = mongoose.Types.ObjectId;
        var server_time = new Date(moment().utcOffset("+04:00").valueOf());
        var time = moment()
          .utcOffset("+04:00")
          .format("MMMM Do YYYY, h:mm:ss a");
        const ads = await storeAdvFromUserLocation(longitude, latitude, 2);
        var city;
        if (city_id) {
          city = await City.findOne({ _id: city_id });
        }
        if (latitude && longitude) {
          city_lat_long = [Number(latitude), Number(longitude)];
        }

        const stores = await Store.aggregate([
          {
            $match: {
              $and: [
                { is_approved: { $eq: true } },
                { is_business: { $eq: true } },
                { is_visible: { $eq: true } },
                {
                  store_delivery_id: {
                    $eq: Schema(store_delivery_id),
                  },
                },
              ],
            },
          },
        ]);
        if (stores.length == 0) {
          res.json({
            success: false,
            error_code: USER_ERROR_CODE.STORE_LIST_NOT_FOUND,
          });
          return;
        }
        var store_list = [];

        stores.forEach(function (store) {
          // if(store?._id.toString()==="6285f58a51c598c058cc139f"){
          //   store.rating_type='cheapest';
          // }
          // else{
          //   store.rating_type='Top Rated';
          // }
          if (!store.rating_type) {
            store.rating_type = "";
          }
          store.distance = utils.getDistanceFromTwoLocation(
            [latitude, longitude],
            store.location
          );

          store_list.push(store);
        });
        store_list.sort(function (a, b) {
          return a.distance - b.distance;
        });

        const _stores = await getStoresBasedOnLocation({
          stores: store_list,
          latitude: longitude,
          longitude: latitude,
        });
        _stores.sort((a, b) => a.store_sequence - b.store_sequence);

        _stores.forEach((store, index) => {
          store.store_time = getStoreTime(store.store_time);
          if (
            store.user_radius_zone.delivery_fees != null ||
            store.user_radius_zone.delivery_fees != undefined
          ) {
            store.delivery_text =
              store.user_radius_zone.delivery_fees == 0
                ? store.free_delivery_text == null ||
                  store.free_delivery_text == undefined
                  ? "Free Delivery"
                  : store.free_delivery_text
                : store.paid_delivery_text == null ||
                  store.paid_delivery_text == undefined
                ? "Assured Delivery"
                : store.paid_delivery_text;
          } else {
            store.delivery_text =
              store.paid_delivery_text == null ||
              store.paid_delivery_text == undefined
                ? "Assured Delivery"
                : store.paid_delivery_text;
          }
        });
        const filteredStore = storeResponseMap(_stores);

        res.json({
          success: true,
          message: USER_MESSAGE_CODE.GET_STORE_LIST_SUCCESSFULLY,
          server_time,
          time,
          ads,
          stores: filteredStore,
          city_name: city && city.city_name ? city.city_name : "Dubai",
        });
      }
    );
  } catch (error) {
    res.json({
      success: false,
      error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
    });
  }
};

exports.generate_random_promo_code = async function (req, res) {
  let { prefix, no_of_code } = req.body;
  var request_data_body = req.body;
  delete request_data_body["prefix"];
  delete request_data_body["no_of_code"];
  let tokens = [];
  prefix = prefix ? prefix : "STEPPI";
  no_of_code = no_of_code ? no_of_code : 1;

  try {
    for (let i = 0; i < no_of_code; i++) {
      request_data_body.promo_code_name = utils.genrateRandomPromo(prefix);
      var is_promo_have_date = request_data_body.is_promo_have_date;
      if (is_promo_have_date == true) {
        var promo_start_date = request_data_body.promo_start_date;
        var promo_expire_date = request_data_body.promo_expire_date;

        if (promo_start_date != undefined && promo_start_date != null) {
          promo_start_date = request_data_body.promo_start_date;
        }
        if (promo_expire_date != undefined && promo_expire_date != null) {
          promo_expire_date = request_data_body.promo_expire_date;
        }
        promo_start_date = new Date(promo_start_date);
        promo_start_date = promo_start_date.setHours(0, 0, 0, 0);
        promo_start_date = new Date(promo_start_date);
        promo_expire_date = new Date(promo_expire_date);
        promo_expire_date = promo_expire_date.setHours(23, 59, 59, 999);
        promo_expire_date = new Date(promo_expire_date);
        request_data_body.promo_start_date = promo_start_date;
        request_data_body.promo_expire_date = promo_expire_date;
      }

      var created_by = ADMIN_DATA_ID.ADMIN;
      request_data_body.created_by = created_by;
      request_data_body.created_id = request_data_body.admin_id;
      const promo_code = new Promo_code(request_data_body);
      await promo_code.save();
      tokens.push(promo_code);
    }
    res.json({
      success: true,
      promo_code_list: tokens,
      // request_data_body : request_data_body
      // promo_code
    });
  } catch (error) {
    res.json({
      success: false,
      error_code: error.message,
    });
  }
};

// GET STORE PRODUCT ITEM LIST
exports.user_search_item_words = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "store_id", type: "string" }],
    async function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        console.log(
          "user_search_item_words >> " + JSON.stringify(request_data_body)
        );
        var store_id = request_data_body.store_id;
        var search_value = request_data_body.search_value;
        var page = request_data_body.page ? request_data_body.page : 1;
        var number_of_rec = request_data_body.no_of_record
          ? request_data_body.no_of_record
          : 10;
        var skip = 0;
        var searchCondition = { $match: {} };
        if (search_value !== undefined) {
          search_value = search_value.replace(/^\s+|\s+$/g, "");
          search_value = search_value.replace(/ +(?= )/g, "");
          searchCondition = {
            $match: {
              name: { $regex: new RegExp("\\b" + search_value + ".*", "i") },
            },
          };
        }

        let items = [];
        // const settings = await Setting.findOne({});
        // let items = await searchItems({
        //   search_value,
        //   page: 1,
        //   number_of_rec:
        //     settings && settings.exact_search_item_count
        //       ? settings.exact_search_item_count
        //       : 20,
        //   store_id,
        // });
        // number_of_rec =
        //   number_of_rec - (items && items.length ? items.length : 1);

        const _items = await autoCompleteSearchItems({
          search_value,
          page,
          number_of_rec,
          store_id,
        });

        if (page === 1) {
          items = items.concat(_items);
        } else {
          items = _items;
        }

        if (items.length == 0) {
          response_data.json({
            success: true,
            message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
            items: [],
          });
          return;
        }

        if (request_data_body.addTag && request_data_body.tag) {
          const sdf = await Item.updateMany(
            {
              _id: {
                $in: items.map((i) => mongoose.Types.ObjectId(i._id)),
              },
            },
            [
              {
                $set: {
                  tags: { $concat: ["$tags", ` ${request_data_body.tag}`] },
                },
              },
            ]
          );

          db.items.updateMany({}, [
            { $set: { tags: { $concat: ["", "$name"] } } },
          ]);
        }
        const products = [];
        items = items.map(function ({
          product_detail,
          substitute_items,
          current_substitute_item_id,
          super_item_id,
          total_quantity,
          in_cart_quantity,
          total_added_quantity,
          total_used_quantity,
          unique_id_for_store_data,
          is_recommend_in_store,
          is_express_in_delivery,
          specifications_unique_id_count,
          tags,
          category_details,
          __v,
          ...rest
        }) {
          let tm = {
            ...rest,
          };
          if (tm._id && tm.unique_id_for_store_data !== "undefined") {
            tm.unique_id_for_store_data = tm.unique_id_for_store_data + "";
          } else if (tm._id) {
            tm.unique_id_for_store_data = "0";
          }
          if (
            tm.product_detail &&
            tm.product_detail.unique_id_for_store_data !== "undefined"
          ) {
            tm.product_detail.unique_id_for_store_data =
              tm.product_detail.unique_id_for_store_data + "";
          } else if (tm.product_detail) {
            tm.product_detail.unique_id_for_store_data = "0";
          }
          if (!unique_id_for_store_data) unique_id_for_store_data = "";
          return {
            _id: {
              ...rest,
              unique_id_for_store_data,
              product_name: product_detail.name,
              category_name: category_details.name,
            },
            product_detail: [product_detail],
          };
        });
        response_data.json({
          success: true,
          message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
          // words,
          // words_and_category: words_and_category,
          // trending_items,
          items,
          // products,
        });
      } else {
        response_data.json(response);
      }
    }
  );
};
exports.search_items_tags = function (req, res) {
  var search_value = req.body.search_value;
  var page = req.body.page ? req.body.page : 1;
  var skip = (page - 1) * 1000;
  if (search_value !== undefined) {
    search_value = search_value.replace(/^\s+|\s+$/g, "");
    search_value = search_value.replace(/ +(?= )/g, "");
    searchCondition = {
      $match: {
        tags: { $regex: new RegExp("\\b" + search_value + ".*", "i") },
      },
    };
  }
  var pfLength = 3;
  if (/\s/g.test(search_value) && search_value.length > 6) {
    pfLength = 6;
  }
  var condition1 = { $match: { is_visible_in_store: { $eq: true } } };
  Item.aggregate(
    [
      {
        $search: {
          compound: {
            should: [
              {
                autocomplete: {
                  query: `${search_value}`,
                  path: "tags",
                  fuzzy: {
                    maxEdits: 2,
                    prefixLength: pfLength,
                  },
                },
              },
            ],
          },
        },
      },
      condition1,
      {
        $skip: skip,
      },
      {
        $limit: 1000,
      },
    ],
    async function (error, items) {
      if (!items) {
        response_data.json({
          success: true,
          success: true,
          message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
          items: [],
        });
        return;
      }

      let words = items.map((item) => ({
        tags: item.tags,
        name: item.name,
        item_id: item._id,
      }));
      res.json({
        success: true,
        message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
        items: words,
        // fuxz : fuxz
      });
    }
  );
};
exports.update_search_tags = async function (req, res) {
  const { tags, isAddTag, items } = req.body;
  if (!isAddTag) {
    res.json({
      success: false,
      message: "Update Tags Failed",
    });
  }
  const sdf = await Item.updateMany(
    {
      _id: {
        $in: items.map((i) => mongoose.Types.ObjectId(i.item_id)),
      },
    },
    [
      {
        $set: {
          tags: { $concat: ["$tags", ` ${tags}`] },
        },
      },
    ]
  );
  res.json({
    success: true,
    data: sdf,
    message: "Tags Updated successfully",
  });
};
exports.update_search_score = async function (req, res) {
  const item = await Item.findOne({ _id: req.body.item_id });
  if (!item) {
    res.json({
      success: false,
      message: "Item not found",
    });
  } else {
    item.search_score = item.search_score + 1;
    await item.save();
    res.json({
      success: true,
      message: "Search score update success",
    });
  }
};
// GET STORE PRODUCT ITEM LIST
exports.search_items = function (request_data, response_data) {
  console.log("search_items: >>>>" + JSON.stringify(request_data.body));
  utils.check_request_params(
    request_data.body,
    [{ name: "store_id", type: "string" }],
    async function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var store_id = request_data_body.store_id;
        var page = request_data_body.page ? request_data_body.page : 1;
        var number_of_rec = request_data_body.no_of_record
          ? request_data_body.no_of_record
          : 20;
        var search_value = request_data_body.search_value;
        var selected_item = [];
        if (request_data_body.item_id) {
          selected_item = await Item.findOne({
            _id: request_data_body.item_id,
            price: { $ne: 0 },
          }).lean();
          if (selected_item && selected_item.product_id) {
            var product1 = await Product.findById(
              selected_item.product_id
            ).lean();
            selected_item.product_detail = product1;
          }
          selected_item = [selected_item];
        }
        if (search_value !== undefined) {
          search_value = search_value.replace(/^\s+|\s+$/g, "");
          search_value = search_value.replace(/ +(?= )/g, "");
          searchCondition = {
            $match: {
              tags: { $regex: new RegExp("\\b" + search_value + ".*", "i") },
            },
          };
        }

        const condition = {
          $match: { store_id: { $eq: mongoose.Types.ObjectId(store_id) } },
        };
        const condition1 = { $match: { is_visible_in_store: { $eq: true } } };
        const condition2 = { $match: { is_item_in_stock: { $eq: true } } };
        let skip = 0;
        skip = (page - 1) * number_of_rec;
        var sort = { $sort: {} };
        sort["$sort"]["unique_id"] = parseInt(1);

        let items = [];
        // const settings = await Setting.findOne({});
        // items = await searchItems({
        //   search_value,
        //   page: 1,
        //   number_of_rec:
        //     settings && settings.exact_search_item_count
        //       ? settings.exact_search_item_count
        //       : 20,
        //   store_id,
        // });
        // number_of_rec =
        //   number_of_rec - (items && items.length ? items.length : 1);

        const _items = await autoCompleteSearchItems({
          search_value,
          page,
          number_of_rec,
          store_id,
        });

        if (page === 1) {
          items = items.concat(_items);
        } else {
          items = _items;
        }
        if (items.length == 0) {
          response_data.json({
            success: true,
            message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
            selected_item: fixItemsImgSpace(selected_item),
            itemCount: 0,
            items: [],
          });
        } else {
          let itm = items.map(function ({
            product_detail,
            substitute_items,
            current_substitute_item_id,
            super_item_id,
            total_quantity,
            in_cart_quantity,
            total_added_quantity,
            total_used_quantity,
            is_recommend_in_store,
            is_express_in_delivery,
            specifications_unique_id_count,
            unique_id_for_store_data,
            tags,
            __v,
            ...rest
          }) {
            let tm = { ...rest };
            if (tm._id && tm.unique_id_for_store_data !== "undefined") {
              tm.unique_id_for_store_data = tm.unique_id_for_store_data + "";
            } else if (tm._id) {
              tm.unique_id_for_store_data = "0";
            }
            if (
              tm.product_detail &&
              tm.product_detail.unique_id_for_store_data !== "undefined"
            ) {
              tm.product_detail.unique_id_for_store_data =
                tm.product_detail.unique_id_for_store_data + "";
            } else if (tm.product_detail) {
              tm.product_detail.unique_id_for_store_data = "0";
            }
            if (!unique_id_for_store_data) unique_id_for_store_data = "";
            return {
              _id: { ...rest, unique_id_for_store_data },
              product_detail: [product_detail],
            };
          });

          let related_items = await Item.aggregate([
            condition,
            condition1,
            condition2,
            // searchCondition,
            {
              $match: {
                price: { $ne: 0 },
              },
            },
            {
              $lookup: {
                from: "products",
                localField: "product_id",
                foreignField: "_id",
                as: "product_detail",
              },
            },
            { $unwind: "$product_detail" },
            {
              $match: {
                product_id: {
                  $eq: mongoose.Types.ObjectId(itm[0].product_detail[0]._id),
                },
              },
            },
            {
              $group: {
                _id: {
                  _id: "$_id",
                  unique_id: "$unique_id",
                  name: "$name",
                  image_url: "$image_url",
                  tax: "$tax",
                  item_tax: "$item_tax",
                  item_price_without_offer: "$item_price_without_offer",
                  offer_message_or_percentage: "$offer_message_or_percentage",
                  quantity: "$quantity",
                  store_id: "$store_id",
                  unique_id_for_store_data: "$unique_id_for_store_data",
                  total_price: "$total_price",
                  price: "$price",
                  instruction: "$instruction",
                  product_id: "$product_id",
                  is_item_in_stock: "$is_item_in_stock",
                  no_of_order: "$no_of_order",
                  is_default: "$is_default",
                  specifications: "$specifications",
                  updated_at: "$updated_at",
                  discount_percentage: "$discount_percentage",
                  discount_value: "$discount_value",
                  details: "$details",
                  details_1: "$details_1",
                  total_specification_price: "$total_specification_price",
                  max_item_quantity: "$max_item_quantity",
                  is_visible_in_store: "$is_visible_in_store",
                  created_at: "$created_at",
                  sequence_number: "$sequence_number",
                },
                product_detail: { $push: "$product_detail" },
              },
            },
            {
              $skip: skip,
            },
            {
              $limit: number_of_rec,
            },
          ]);

          if (request_data_body.item_id) {
            related_items = related_items.filter(
              (item) => item._id._id != request_data_body.item_id
            );
            // itm = itm.filter((item) => item._id._id != request_data_body.item_id);
          }
          response_data.json({
            success: true,
            message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
            selected_item: fixItemsImgSpace(selected_item),
            items: fixItemsImgSpace(itm),
            related_items: fixItemsImgSpace(related_items),
            itemCount: 426,
          });
        }
      } else {
        response_data.json(response);
      }
    }
  );
};

exports.user_get_store_product_item_list = async (
  request_data,
  response_data
) => {
  var request_data_body = request_data.body;
  var store_id = request_data_body.store_id;
  var is_include_relevant_products =
    request_data_body.is_include_relevant_products;
  console.log(
    "user_get_store_product_item_list :>> " + JSON.stringify(request_data_body)
  );
  // var is_include_offers = request_data_body.is_include_offers;
  var category_id = request_data_body.category_id;
  var server_time = new Date(moment(new Date()).utc().valueOf());
  // var category = await Category.find({
  //   _id: request_data_body.category_id,
  //   is_visible_in_store: true,
  // });
  // var store = await Store.findOne({ _id: request_data_body.store_id });
  // var product_id = await Product.findOne({ _id: request_data_body.product_id });
  // var country = Country.findOne({ _id: store.country_id });
  // var city = City.findOne({ _id: store.city_id });
  // var delivery = Delivery.findOne({ _id: store.store_delivery_id });

  const product = await Product.aggregate([
    {
      $match: {
        store_id: mongoose.Types.ObjectId(store_id),
        category_id: mongoose.Types.ObjectId(category_id),
        is_visible_in_store: true,
      },
    },
    {
      $lookup: {
        from: "items",
        localField: "_id",
        foreignField: "product_id",
        as: "items",
      },
    },
    {
      $sort: { sequence_number: 1 },
    },
    {
      $project: {
        // _id : "$_id",
        name: "$name",
        is_visible_in_store: "$is_visible_in_store",
        super_product_id: "$super_product_id",
        unique_id_for_store_data: "$unique_id_for_store_data",
        store_id: "$store_id",
        category_id: "$category_id",
        created_at: "$created_at",
        updated_at: "$updated_at",
        unique_id: "$unique_id",
        __v: "$__v",
        count: { $size: "$items" },
      },
    },
    {
      $redact: {
        $cond: {
          if: { $eq: ["$count", 0] },
          then: "$$PRUNE",
          else: "$$DESCEND",
        },
      },
    },
  ]);
  const filteredProd = product.map(({ count, ...rest }) => ({ ...rest }));
  // const filteredStore = items.map(
  //   ({
  //     store_id: store_id,
  //     category_id: category_id,
  //   }))

  //
  // .sort({ sequence_number: 1 })
  // .skip(skip)
  // .limit(limit);
  if (product) {
    response_data.json({
      success: true,
      product: filteredProd,
    });
  } else {
    response_data.json({
      success: false,
      message: "Not Found",
    });
  }
};

// GET STORE PRODUCT ITEM LIST
// exports.user_get_store_product_item_list = async function (req, res) {
//   utils.check_request_params(
//     req.body,
//     [{ name: "store_id", type: "string" }],
//     async function (response) {
//       if (response.success) {
//         var request_data_body = req.body;
//         console.log(
//           "user_get_store_product_item_list >>>" +
//             JSON.stringify(request_data_body)
//         );
//         var { store_id, category_id, page } = request_data_body;
//         var number_of_rec = req.body.number_of_rec
//           ? req.body.number_of_rec
//           : 10;
//         page = page ? page : 1;
//         const skip = (page - 1) * number_of_rec;
//         var server_time = new Date(moment(new Date()).utc().valueOf());
//         var condition = {
//           $match: { store_id: { $eq: mongoose.Types.ObjectId(store_id) } },
//         };
//         var category_condition = { $match: {} };
//         if (category_id !== undefined)
//           category_condition = {
//             $match: {
//               category_id: { $eq: mongoose.Types.ObjectId(category_id) },
//             },
//           };

//         var condition1 = { $match: { is_visible_in_store: { $eq: true } } };
//         const store = await Store.findOne({ _id: store_id });
//         if (!store) {
//           res.json({
//             success: false,
//             error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND,
//           });
//           return;
//         }
//         const country_data = await Country.findOne({ _id: store.country_id });
//         const city_data = await City.findOne({ _id: store.city_id });
//         const delivery_data = await Delivery.findOne({
//           _id: store.store_delivery_id,
//         });
//         var currency = country_data.currency_sign;
//         var maximum_phone_number_length =
//           country_data.maximum_phone_number_length;
//         var minimum_phone_number_length =
//           country_data.minimum_phone_number_length;
//         var timezone = city_data.timezone;
//         const products = await Product.aggregate([
//           condition,
//           category_condition,
//           condition1,
//           {
//             $lookup: {
//               from: "items",
//               localField: "_id",
//               foreignField: "product_id",
//               as: "items",
//             },
//           },
//           { $unwind: "$items" },
//           // searchCondition,
//           { $sort: { "items.sequence_number": 1 } },
//           { $match: { "items.is_visible_in_store": true } },
//           {
//             $match: {
//               $and: [
//                 { "items.is_visible_in_store": true },
//                 { "items.is_item_in_stock": true },
//               ],
//             },
//           },
//           {
//             $group: {
//               _id: {
//                 _id: "$_id",
//                 unique_id: "$unique_id",
//                 name: "$name",
//                 details: "$details",
//                 details_1: "$details_1",
//                 image_url: "$image_url",
//                 discount_percentage: "$discount_percentage",
//                 discount_value: "$discount_value",
//                 is_visible_in_store: "$is_visible_in_store",
//                 created_at: "$created_at",
//                 sequence_number: "$sequence_number",
//                 updated_at: "$updated_at",
//               },
//               items: { $push: "$items" },
//             },
//           },
//           {
//             $skip: skip,
//           },
//           {
//             $limit: number_of_rec,
//           },
//           {
//             $sort: { "_id.sequence_number": 1 },
//           },
//         ]);
//         if (products.length == 0) {
//           res.json({
//             success: false,
//             error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND,
//             store: store,
//           });
//           return;
//         }
//         var ads = [];
//         const promo_codes = await Promo_code.find({
//           created_id: store._id,
//           is_approved: true,
//           is_active: true,
//         });
//         const advertise = await Advertise.find({
//           $or: [
//             { city_id: store.city_id },
//             {
//               city_id: mongoose.Types.ObjectId(ID_FOR_ALL.ALL_ID),
//             },
//           ],
//           ads_for: ADS_TYPE.FOR_INSIDE_STORE,
//           is_ads_visible: true,
//         });
//         if (
//           country_data &&
//           country_data.is_ads_visible &&
//           city_data &&
//           city_data.is_ads_visible
//         ) {
//           ads = advertise;
//         }
//         res.json({
//           success: true,
//           message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
//           currency: currency,
//           maximum_phone_number_length: maximum_phone_number_length,
//           minimum_phone_number_length: minimum_phone_number_length,
//           city_name: city_data.city_name,
//           server_time: server_time,
//           timezone: timezone,
//           delivery_name: delivery_data.delivery_name,
//           ads: ads,
//           // store: store,
//           promo_codes: promo_codes,
//           products: products,
//         });
//       } else {
//         res.json(response);
//       }
//     }
//   );
// };
exports.user_get_items = async function (req, res) {
  const { product_id, store_id, category_id } = req.body;
  const page = req.body.page ? req.body.page : 1;
  const limit = req.body.number_of_rec ? req.body.number_of_rec : 10;
  const skip = (page - 1) * limit;

  const condition = {
    store_id: store_id,
    product_id: product_id,
    is_visible_in_store: true,
    is_item_in_stock: true,
    price: { $ne: 0 },
  };
  // const awsUrl = "https://yeepeeyimages.s3.ap-south-1.amazonaws.com/"
  // const awsUrl = "https://yeep.s3.me-south-1.amazonaws.com/";
  const items = await Item.find(condition)
    .skip(skip)
    .limit(limit)
    .sort({ order_score: -1, _id: 1 })
    .select({
      substitute_items: 0,
      super_item_id: 0,
      current_substitute_item_id: 0,
      details_1: 0,
      discount_percentage: 0,
      discount_value: 0,
      offer_message_or_percentage: 0,
      in_cart_quantity: 0,
      is_express_in_delivery: 0,
      specifications: 0,
      specifications_unique_id_count: 0,
    });
  // .sort({ sequence_number: 1 });
  // items.forEach((itm)=>{
  //   itm.image_url[0] = awsUrl + itm.image_url[0]
  // })
  if (items.length == 0) {
    res.json({
      success: false,
      error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND,
    });
    return;
  }
  res.json({
    success: true,
    count: await Item.countDocuments(condition),
    message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
    items: fixItemsImgSpace(items),
  });
};

// exports.user_get_store_product_item_list = async (request_data, response_data) => {
//   var request_data_body = request_data.body;
//   var store_id = request_data_body.store_id;
//   var is_include_relevant_products = request_data_body.is_include_relevant_products
//   var is_include_offers = request_data_body.is_include_offers
//   var category_id = request_data_body.category_id;
//   var server_time = new Date(moment(new Date()).utc().valueOf());
//   var category = await Category.find({ _id: request_data_body.category_id, is_visible_in_store: true, });
//   var store = await Store.findOne({ _id: request_data_body.store_id });
//   // var country = Country.findOne({ _id: store.country_id });
//   var city = City.findOne({ _id: store.city_id });
//   var delivery =  Delivery.findOne({ _id: store.store_delivery_id });
//

//    const product = await Product.aggregate([
//     { $match:
//       {
//       store_id: mongoose.Types.ObjectId(store_id),
//       is_include_offers : is_include_offers,
//       // is_include_relevant_products : is_include_relevant_products

//      }
//     },

//     {
//       $lookup:
//          {
//             from: "items",
//             localField: "_id",
//             foreignField: "product_id",
//             as: "items"
//         },

//    },
//    { $unwind: "$items" },
//    {
//     $group: {
//       _id: {
//         _id: "$_id",
//         unique_id: "$unique_id",
//         name: "$name",
//         details: "$details",
//         details_1: "$details_1",
//         image_url: "$image_url",
//         discount_percentage: "$discount_percentage",
//         discount_value: "$discount_value",
//         is_visible_in_store: "$is_visible_in_store",
//         created_at: "$created_at",
//         sequence_number: "$sequence_number",
//         updated_at: "$updated_at",
//       },
//       items: { $push: "$items" },
//     },
//   },

//   ])
//
//   if(product){
//     response_data.json({
//       success : true,
//       product
//     })
//   }
//   else{
//     response_data.json({
//       success : false,
//       message : "Not Found"
//     })
//   }
// }
exports.get_special_category_list = async function (req, res) {
  let { store_id, page, no_of_record } = req.body;
  page = page ? page : 1;
  no_of_record = no_of_record ? no_of_record : 1000;
  let skip = (page - 1) * no_of_record;

  const categories = await Category.find(
    { store_id: store_id, is_special_category: true },
    { _id: 1, name: 1, store_id: 1, image_url: 1 }
  )
    .skip(skip)
    .limit(no_of_record);
  const store__id = req.body.store_id;
  const store_details = await Store.findOne({ _id: store__id });

  var store_name = store_details.name;
  if (categories.length > 0) {
    res.json({
      success: true,
      categories: categories,
      store_name: store_name,
      total_count: await Category.countDocuments({
        store_id: store_id,
        is_special_category: true,
      }),
    });
  } else {
    res.json({
      success: false,
      categories: [],
    });
  }
};
exports.get_special_category_item_list = async function (req, res) {
  let { store_id, category_id, page, no_of_record } = req.body;
  page = page ? page : 1;
  no_of_record = no_of_record ? no_of_record : 10;
  let skip = (page - 1) * no_of_record;
  const product = await Product.findOne(
    { store_id: store_id, category_id: category_id },
    {
      _id: 1,
      name: 1,
      unique_id: 1,
      is_visible_in_store: 1,
      sequence_number: 1,
      created_at: 1,
      updated_at: 1,
    }
  );
  const category = await Category.findOne(
    { _id: category_id },
    { name: 1, _id: 1 }
  );
  if (!product) {
    res.json({
      success: false,
      product: [],
      total_count: 0,
    });
    return;
  }
  const items = await Item.find({
    store_id: store_id,
    product_id: product._id,
    is_item_in_stock: true,
    is_visible_in_store: true,
  })
    .skip(skip)
    .limit(no_of_record);
  const respObj = {
    _id: product,
    category_name: category.name,
    category_id: category._id,
    items: items,
  };
  if (items.length == 0) {
    res.json({
      success: false,
      product: [],
      total_count: 0,
    });
    return;
  }
  res.json({
    success: true,
    product: [respObj],
    total_count: await Item.countDocuments({
      store_id: store_id,
      product_id: product._id,
      is_item_in_stock: true,
      is_visible_in_store: true,
    }),
  });
};
exports.get_category_list = async (request_data, response_data) => {
  var store_id = request_data.body.store_id;
  var request_data_body = request_data.body;
  var is_include_relevant_products =
    request_data_body.is_include_relevant_products;
  var is_include_offers = request_data_body.is_include_offers;
  var product_id = ["5fb39726acf8e248f85cb129"];
  var store_detail = await Store.findOne({ _id: request_data_body.store_id });
  var items = await Item.find({ product_id });

  var category = await Category.find({ store_id, is_visible_in_store: true })
    .sort({ sequence_number: 1 })
    .lean();
  category = category.map(
    ({
      created_at,
      is_visible_in_store,
      updated_at,
      __v,
      sequence_number,
      ...rest
    }) => ({ ...rest })
  );
  const spl_cat = await Category.countDocuments({
    store_id: store_id,
    is_special_category: true,
  });
  if (is_include_offers) {
    category = category.filter((catg) => catg.name != "Exclusive Offers");
    const product = await Product.aggregate([
      {
        $match: {
          store_id: mongoose.Types.ObjectId(store_id),
          is_include_offers: is_include_offers,
          // is_include_relevant_products : is_include_relevant_products
        },
      },

      {
        $lookup: {
          from: "items",
          localField: "_id",
          foreignField: "product_id",
          as: "items",
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "categories",
        },
      },
      { $unwind: "$categories" },
      {
        $group: {
          _id: {
            _id: "$_id",
            unique_id: "$unique_id",
            name: "$name",
            details: "$details",
            details_1: "$details_1",
            image_url: "$image_url",
            is_visible_in_store: "$is_visible_in_store",
            created_at: "$created_at",
            sequence_number: "$sequence_number",
            updated_at: "$updated_at",
          },
          category_name: { $first: "$categories.name" },
          category_id: { $first: "$categories._id" },
          items: { $push: "$items" },
        },
      },
    ]);
    // const product = await Product.findOne({})

    if (product) {
      response_data.json({
        success: true,
        message: CATEGORY_MESSAGE_CODE.CATEGORY_LIST_SUCCESSFULLY,
        is_special_category: spl_cat > 0 ? true : false,
        category: category,
        // store_detail: store_detail,
        product: product,
        // items: items,
      });
    } else {
      response_data.json({
        success: false,
        error_code: CATEGORY_ERROR_CODE.CATEGORY_DATA_NOT_FOUND,
      });
    }
  } else {
    if (category.length == 0) {
      response_data.json({
        success: false,
        error_code: CATEGORY_ERROR_CODE.CATEGORY_DATA_NOT_FOUND,
      });
    } else {
      response_data.json({
        success: true,
        message: CATEGORY_MESSAGE_CODE.CATEGORY_LIST_SUCCESSFULLY,
        category: category,
        is_special_category: spl_cat > 0 ? true : false,
        // store_detail: store_detail,
        items: items,
      });
    }
  }
};

exports.get_item_list_by_price = async function (req, res) {
  let { store_id, product_id, no_of_record, page } = req.body;
  no_of_record = no_of_record ? no_of_record : 10;
  page = page ? page : 10;
  let skip = (page - 1) * no_of_record;
  let query;
  const store = await Store.findOne({ _id: store_id }).lean();
  if (!store) {
    res.json({
      success: false,
      error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND,
      items: [],
    });
  }
  let price = store.under_item_price ? store.under_item_price : 1;
  if (product_id) {
    query = {
      store_id: store_id,
      product_id: product_id,
      price: { $lt: price },
    };
  } else {
    query = { store_id: store_id, price: { $lt: price } };
  }

  const items = await Item.find(query)
    .sort({ price: 1 })
    .skip(skip)
    .limit(no_of_record)
    .lean();
  const count = await Item.countDocuments(query);
  if (items.length != 0) {
    res.json({
      success: true,
      total_count: count,
      message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
      items: items,
    });
  } else {
    res.json({
      success: false,
      error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND,
      items: [],
    });
  }
};

//get_store_list_nearest_city
exports.get_store_list_nearest_city = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [
      { name: "country", type: "string" },
      { name: "latitude" },
      { name: "longitude" },
    ],
    async function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var country = request_data_body.country;
        var server_time = new Date(moment(new Date()).utc().valueOf());
        var country_code = request_data_body.country_code
          ? request_data_body.country_code
          : "";
        var country_code_2 = request_data_body.country_code_2
          ? request_data_body.country_code_2
          : "";
        const country_data = await Country.findOne({
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
        });

        if (!country_data) {
          response_data.json({
            success: false,
            error_code: COUNTRY_ERROR_CODE.BUSINESS_NOT_IN_YOUR_COUNTRY,
          });
          return;
        }
        var city_lat_long = [
          request_data_body.latitude,
          request_data_body.longitude,
        ];
        const country_id = country_data._id;
        const cityList = await City.find({
          country_id: country_id,
          is_business: true,
        });
        var size = cityList.length;
        var count = 0;
        if (size == 0) {
          response_data.json({
            success: false,
            error_code: CITY_ERROR_CODE.BUSINESS_NOT_IN_YOUR_CITY,
          });
          return;
        }
        var finalCityId = null;
        var finalDistance = 1000000;
        cityList.forEach(async function (city_detail) {
          count++;
          var cityLatLong = city_detail.city_lat_long;
          var distanceFromSubAdminCity = utils.getDistanceFromTwoLocation(
            city_lat_long,
            cityLatLong
          );
          var cityRadius = city_detail.city_radius;

          if (distanceFromSubAdminCity < cityRadius) {
            if (distanceFromSubAdminCity < finalDistance) {
              finalDistance = distanceFromSubAdminCity;
              finalCityId = city_detail._id;
            }
          }
          if (count == size) {
            if (finalCityId == null) {
              response_data.json({
                success: false,
                error_code: CITY_ERROR_CODE.BUSINESS_NOT_IN_YOUR_CITY,
              });
              return;
            }

            var city_id = finalCityId;

            var delivery_query = {
              $lookup: {
                from: "deliveries",
                localField: "deliveries_in_city",
                foreignField: "_id",
                as: "deliveries",
              },
            };

            var cityid_condition = {
              $match: { _id: { $eq: city_id } },
            };
            const city = await City.aggregate([
              cityid_condition,
              delivery_query,
            ]);
            if (city.length == 0) {
              response_data.json({
                success: false,
                error_code:
                  DELIVERY_ERROR_CODE.DELIVERY_DATA_NOT_FOUND_IN_YOUR_CITY,
              });
              return;
            }
            if (city[0].is_business) {
              var ads = [];
              const stores = await Store.find({
                city_id: city[0]._id,
                is_business: true,
                is_approved: true,
                store_delivery_id: request_data_body.store_delivery_id,
              }).sort({ sequence_number: 1 });
              if (stores.length == 0) {
                response_data.json({
                  success: false,
                  error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND,
                });
                return;
              }

              const advertise = await Advertise.find({
                country_id: country_id,
                $or: [
                  { city_id: city[0]._id },
                  {
                    city_id: mongoose.Types.ObjectId(ID_FOR_ALL.ALL_ID),
                  },
                ],
                ads_for: ADS_TYPE.STORE_LIST,
                is_ads_visible: true,
              });
              if (
                city[0] &&
                city[0].is_ads_visible &&
                country_data &&
                country_data.is_ads_visible
              ) {
                ads = advertise;
              }
              response_data.json({
                success: true,
                message:
                  DELIVERY_MESSAGE_CODE.DELIVERY_LIST_FOR_NEAREST_CITY_SUCCESSFULLY,
                city: city[0],
                stores: stores,
                ads: ads,
                city_data: request_data_body,
                currency_code: country_data.currency_code,
                currency_sign: country_data.currency_sign,
                server_time: server_time,
              });
            } else {
              response_data.json({
                success: false,
                error_code:
                  DELIVERY_ERROR_CODE.DELIVERY_DATA_NOT_FOUND_IN_YOUR_CITY,
              });
            }
          }
        });
      } else {
        response_data.json(response);
      }
    }
  );
};

// store_list_for_item
exports.store_list_for_item = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [
      { name: "city_id", type: "string" },
      { name: "store_delivery_id", type: "string" },
    ],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var Schema = mongoose.Types.ObjectId;
        var item_name = request_data_body.item_name;
        var city_id = request_data_body.city_id;
        var store_delivery_id = request_data_body.store_delivery_id;

        User.findOne({ _id: request_data_body.user_id }).then(
          (user_detail) => {
            if (user_detail) {
              var item_condition = { $match: { name: { $eq: item_name } } };

              Item.aggregate([
                item_condition,
                {
                  $lookup: {
                    from: "stores",
                    localField: "store_id",
                    foreignField: "_id",
                    as: "store_detail",
                  },
                },

                {
                  $match: {
                    $and: [
                      { "store_detail.city_id": { $eq: Schema(city_id) } },
                      {
                        "store_detail.store_delivery_id": {
                          $eq: Schema(store_delivery_id),
                        },
                      },
                    ],
                  },
                },

                { $unwind: "$store_detail" },

                {
                  $group: {
                    _id: "$name",
                    stores: { $push: "$store_detail" },
                  },
                },
              ]).then(
                (item) => {
                  if (item.length == 0) {
                    response_data.json({
                      success: false,
                      error_code: USER_ERROR_CODE.STORE_LIST_NOT_FOUND,
                    });
                  } else {
                    response_data.json({
                      success: true,
                      message: USER_MESSAGE_CODE.GET_STORE_LIST_SUCCESSFULLY,
                      item: item[0],
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
                error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
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

// GET PROVIDER LOCATION
exports.get_provider_location = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "provider_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        User.findOne({ _id: request_data_body.user_id }).then(
          (user_detail) => {
            if (user_detail) {
              Provider.findOne({ _id: request_data_body.provider_id }).then(
                (provider) => {
                  var provider_location = [];
                  var bearing = 0;
                  var map_pin_image_url = "";

                  if (provider) {
                    provider_location = provider.location;
                    bearing = provider.bearing;

                    Vehicle.findOne({ _id: provider.vehicle_id }).then(
                      (vehicle) => {
                        if (vehicle) {
                          map_pin_image_url = vehicle.map_pin_image_url;
                        }

                        response_data.json({
                          success: true,
                          message:
                            USER_MESSAGE_CODE.GET_PROVIDER_LOCATION_SUCCESSFULLY,
                          provider_location: provider_location,
                          bearing: bearing,
                          map_pin_image_url: map_pin_image_url,
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
                    response_data.json({ success: false });
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
                error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
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

// GET RUNNING ORDER LIST
exports.get_orders = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;

      User.findOne({ _id: request_data_body.user_id }).then(
        (user_detail) => {
          if (user_detail) {
            var user_condition = {
              $match: {
                user_id: {
                  $eq: mongoose.Types.ObjectId(request_data_body.user_id),
                },
              },
            };
            var order_invoice_condition = {
              $match: { is_user_show_invoice: false },
            };

            var order_status_condition = {
              $match: {
                $and: [
                  { order_status: { $ne: ORDER_STATE.STORE_REJECTED } },
                  { order_status: { $ne: ORDER_STATE.CANCELED_BY_USER } },
                  { order_status: { $ne: ORDER_STATE.STORE_CANCELLED } },
                ],
              },
            };

            Order.aggregate([
              user_condition,
              order_invoice_condition,
              order_status_condition,
              {
                $lookup: {
                  from: "stores",
                  localField: "store_id",
                  foreignField: "_id",
                  as: "store_detail",
                },
              },
              {
                $unwind: {
                  path: "$store_detail",
                  preserveNullAndEmptyArrays: true,
                },
              },

              {
                $lookup: {
                  from: "cities",
                  localField: "city_id",
                  foreignField: "_id",
                  as: "city_detail",
                },
              },
              { $unwind: "$city_detail" },

              {
                $lookup: {
                  from: "countries",
                  localField: "city_detail.country_id",
                  foreignField: "_id",
                  as: "country_detail",
                },
              },
              { $unwind: "$country_detail" },

              {
                $lookup: {
                  from: "order_payments",
                  localField: "order_payment_id",
                  foreignField: "_id",
                  as: "order_payment_detail",
                },
              },
              {
                $unwind: "$order_payment_detail",
              },
              {
                $lookup: {
                  from: "requests",
                  localField: "request_id",
                  foreignField: "_id",
                  as: "request_detail",
                },
              },
              {
                $unwind: {
                  path: "$request_detail",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "carts",
                  localField: "cart_id",
                  foreignField: "_id",
                  as: "cart_detail",
                },
              },
              {
                $unwind: "$cart_detail",
              },
              {
                $project: {
                  _id: "$_id",
                  unique_id: "$unique_id",
                  currency: "$country_detail.currency_sign",
                  request_unique_id: "$request_detail.unique_id",
                  request_id: "$request_detail._id",
                  delivery_status: "$request_detail.delivery_status",
                  estimated_time_for_delivery_in_min:
                    "$request_detail.estimated_time_for_delivery_in_min",
                  total_time: "$order_payment_detail.total_time",
                  total_order_price: "$order_payment_detail.total_order_price",
                  confirmation_code_for_complete_delivery:
                    "$confirmation_code_for_complete_delivery",
                  created_at: "$created_at",
                  image_url: "$image_url",
                  order_status: "$order_status",
                  is_user_show_invoice: "$is_user_show_invoice",
                  order_status_id: "$order_status_id",
                  user_pay_payment: "$order_payment_detail.user_pay_payment",
                  checkout_amount: "$order_payment_detail.checkout_amount",
                  is_payment_mode_online_payment:
                    "$order_payment_detail.is_payment_mode_online_payment",
                  cart_id: "$cart_detail._id",
                  pickup_addresses: "$cart_detail.pickup_addresses",
                  destination_addresses: "$cart_detail.destination_addresses",
                  store_id: "$store_detail._id",
                  store_name: "$store_detail.name",
                  store_delivery_id: "$store_detail.store_delivery_id",
                  store_image: "$store_detail.image_url",
                  store_country_phone_code: "$store_detail.country_phone_code",
                  store_phone: "$store_detail.phone",
                  delivery_type: "$delivery_type",
                  delivery_time_max: "$store_detail.delivery_time_max",
                  order_details: "$cart_detail.order_details",
                  deliver_in: "$deliver_in",
                  order_status_details: "$date_time",
                  payment_gateway_name: {
                    $switch: {
                      branches: [
                        {
                          case: "$order_payment_detail.is_payment_mode_online_payment",
                          then: "Online",
                        },
                        {
                          case: "$order_payment_detail.is_payment_mode_card_on_delivery",
                          then: "Card on Delivery",
                        },
                      ],
                      default: "Cash",
                    },
                  },
                },
              },
            ]).then(
              (orders) => {
                if (orders.length == 0) {
                  response_data.json({
                    success: false,
                    // error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                  });
                } else {
                  response_data.json({
                    success: true,
                    message: ORDER_MESSAGE_CODE.ORDER_LIST_SUCCESSFULLY,
                    order_list: orders,
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
              error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
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

// GET RUNNING ORDER STATUS
exports.get_order_status = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "order_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;

        User.findOne({ _id: request_data_body.user_id }).then(
          (user_detail) => {
            if (user_detail) {
              Order.findOne({ _id: request_data_body.order_id }).then(
                (order) => {
                  Store.findOne({ _id: order.store_id }).then(
                    (store) => {
                      // if (store) {
                      var country_id = order.country_id;

                      Country.findOne({ _id: country_id }).then(
                        (country) => {
                          var currency = country.currency_sign;

                          Order_payment.findOne({
                            _id: order.order_payment_id,
                          }).then(
                            (order_payment) => {
                              if (order_payment) {
                                var is_order_cancellation_charge_apply = false;
                                var order_cancellation_charge = 0;
                                var order_status = order.order_status;
                                var order_status_details = order.date_time;
                                if (store) {
                                  is_order_cancellation_charge_apply =
                                    store.is_order_cancellation_charge_apply;
                                }

                                if (is_order_cancellation_charge_apply) {
                                  var order_cancellation_charge_for_above_order_price =
                                    store.order_cancellation_charge_for_above_order_price;
                                  var order_cancellation_charge_type =
                                    store.order_cancellation_charge_type;
                                  var order_cancellation_charge_value =
                                    store.order_cancellation_charge_value;
                                  switch (order_cancellation_charge_type) {
                                    case ORDER_CANCELLATION_CHARGE_TYPE.PERCENTAGE /* 1 - percentage */:
                                      order_cancellation_charge_value =
                                        order_payment.total_order_price *
                                        order_cancellation_charge_value *
                                        0.01;
                                      break;
                                    case ORDER_CANCELLATION_CHARGE_TYPE.ABSOLUTE /* 2 - absolute */:
                                      order_cancellation_charge_value =
                                        order_cancellation_charge_value;
                                      break;
                                    default:
                                      /* 1- percentage */
                                      order_cancellation_charge_value =
                                        order_payment.total_order_price *
                                        order_cancellation_charge_value *
                                        0.01;
                                      break;
                                  }
                                  order_cancellation_charge_value =
                                    utils.precisionRoundTwo(
                                      Number(order_cancellation_charge_value)
                                    );
                                  if (
                                    order_status >= ORDER_STATE.ORDER_READY &&
                                    order_payment.total_order_price >
                                      order_cancellation_charge_for_above_order_price
                                  ) {
                                    order_cancellation_charge =
                                      order_cancellation_charge_value;
                                  }
                                }

                                Cart.findOne({ _id: order.cart_id }).then(
                                  (cart) => {
                                    Request.findOne({
                                      _id: order.request_id,
                                    }).then(
                                      (request) => {
                                        var request_id = null;
                                        var request_unique_id = 0;
                                        var delivery_status = 0;
                                        var current_provider = null;
                                        var destination_addresses = [];
                                        var estimated_time_for_delivery_in_min = 0;
                                        var delivery_status_details = [];

                                        if (cart) {
                                          destination_addresses =
                                            cart.destination_addresses;
                                        }

                                        if (request) {
                                          request_id = request._id;
                                          request_unique_id = request.unique_id;
                                          delivery_status =
                                            request.delivery_status;
                                          current_provider =
                                            request.current_provider;
                                          estimated_time_for_delivery_in_min =
                                            request.estimated_time_for_delivery_in_min;
                                          delivery_status_details =
                                            request.date_time;
                                        }

                                        Provider.findOne({
                                          _id: current_provider,
                                        }).then(
                                          (provider) => {
                                            var provider_id = null;
                                            var provider_first_name = "";
                                            var provider_last_name = "";
                                            var provider_image = "";
                                            var provider_country_phone_code =
                                              "";
                                            var provider_phone = "";
                                            var user_rate = 0;
                                            if (provider) {
                                              provider_id = provider._id;
                                              provider_first_name =
                                                provider.first_name;
                                              provider_last_name =
                                                provider.last_name;
                                              provider_image =
                                                provider.image_url;
                                              provider_country_phone_code =
                                                provider.country_phone_code;
                                              provider_phone = provider.phone;
                                              user_rate = provider.user_rate;
                                            }

                                            console.log(
                                              "order_status: " + order_status
                                            );
                                            let payment_gateway_name =
                                              order_payment.is_payment_mode_cash
                                                ? "Cash"
                                                : order_payment.is_payment_mode_card_on_delivery
                                                ? "Card on Delivery"
                                                : "Online";
                                            response_data.json({
                                              success: true,
                                              message:
                                                ORDER_MESSAGE_CODE.GET_ORDER_STATUS_SUCCESSFULLY,
                                              unique_id: order.unique_id,
                                              order_id: order._id,
                                              store_id: order.store_id,
                                              total_cart_price:
                                                order_payment.total_cart_price,
                                              request_id: request_id,
                                              request_unique_id:
                                                request_unique_id,
                                              delivery_status: delivery_status,
                                              order_status: order_status,
                                              is_user_confirmed:
                                                order.is_user_confirmed,
                                              order_status_details:
                                                order_status_details,
                                              delivery_status_details:
                                                delivery_status_details,
                                              currency: currency,
                                              estimated_time_for_delivery_in_min:
                                                estimated_time_for_delivery_in_min,
                                              total_time:
                                                order_payment.total_time,
                                              order_cancellation_charge:
                                                order_cancellation_charge,
                                              is_confirmation_code_required_at_pickup_delivery:
                                                setting_detail.is_confirmation_code_required_at_pickup_delivery,
                                              is_confirmation_code_required_at_complete_delivery:
                                                setting_detail.is_confirmation_code_required_at_complete_delivery,
                                              is_user_pick_up_order:
                                                order_payment.is_user_pick_up_order,
                                              confirmation_code_for_complete_delivery:
                                                order.confirmation_code_for_complete_delivery,
                                              confirmation_code_for_pick_up_delivery:
                                                order.confirmation_code_for_pick_up_delivery,
                                              delivery_type:
                                                order.delivery_type,
                                              destination_addresses:
                                                destination_addresses,
                                              provider_id: provider_id,
                                              provider_first_name:
                                                provider_first_name,
                                              provider_last_name:
                                                provider_last_name,
                                              provider_image: provider_image,
                                              provider_country_phone_code:
                                                provider_country_phone_code,
                                              provider_phone: provider_phone,
                                              user_rate: user_rate,
                                              user_pay_payment:
                                                order_payment.user_pay_payment,
                                              checkout_amount:
                                                order_payment.checkout_amount,
                                              store_id: order_payment.store_id,
                                              order_id: order_payment.order_id,
                                              store_delivery_id:
                                                store.store_delivery_id,
                                              delivery_time_max:
                                                store.delivery_time_max,
                                              created_at: order.created_at,
                                              deliver_in: order.deliver_in,
                                              payment_gateway_name:
                                                payment_gateway_name,
                                            });
                                          },
                                          (error) => {
                                            response_data.json({
                                              success: false,
                                              error_code:
                                                ERROR_CODE.SOMETHING_WENT_WRONG,
                                            });
                                          }
                                        );
                                      },
                                      (error) => {
                                        response_data.json({
                                          success: false,
                                          error_code:
                                            ERROR_CODE.SOMETHING_WENT_WRONG,
                                        });
                                      }
                                    );
                                  },
                                  (error) => {
                                    response_data.json({
                                      success: false,
                                      error_code:
                                        ERROR_CODE.SOMETHING_WENT_WRONG,
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
                        },
                        (error) => {
                          response_data.json({
                            success: false,
                            error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                          });
                        }
                      );
                      // }
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
            } else {
              response_data.json({
                success: false,
                error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
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
//GENRATE INVOICE
exports.get_order_cart_invoice = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [
      { name: "store_id", type: "string" },
      { name: "total_time" },
      { name: "total_distance" },
    ],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        console.log(
          "get_order_cart_invoice: " + JSON.stringify(request_data_body)
        );
        var cart_unique_token = request_data_body.cart_unique_token;
        var server_time = new Date(moment(new Date()).utc().valueOf());
        var order_type = Number(request_data_body.order_type);

        if (request_data_body.user_id == "") {
          request_data_body.user_id = null;
        }

        User.findOne({ _id: request_data_body.user_id }).then(
          (user) => {
            var cart_id = null;
            var user_id = null;
            var wallet_currency_code = "";
            if (user) {
              cart_id = user.cart_id;
              user_id = user._id;
              cart_unique_token = null;
              wallet_currency_code = user.wallet_currency_code;
              var wallet = user.wallet;
              is_payment_max = user.is_payment_max;
              is_pay_valid = user.is_pay_valid;
            }
            Cart.findOne({
              $or: [{ _id: cart_id }, { cart_unique_token: cart_unique_token }],
            }).then(
              (cart) => {
                if (cart) {
                  var destination_location =
                    cart.destination_addresses[0].location;
                  Store.findOne({ _id: request_data_body.store_id }).then(
                    (store) => {
                      if (store) {
                        var store_location = store.location;
                        var city_id = store.city_id;
                        var country_id = store.country_id;

                        Country.findOne({ _id: country_id }).then(
                          (country) => {
                            var is_distance_unit_mile = false;
                            if (country) {
                              var is_distance_unit_mile =
                                country.is_distance_unit_mile;
                              if (!user) {
                                wallet_currency_code = country.currency_code;
                              }
                            }

                            if (wallet_currency_code == "") {
                              wallet_currency_code = store.wallet_currency_code;
                            }

                            City.findOne({ _id: city_id }).then(
                              (city_detail) => {
                                if (city_detail) {
                                  var admin_profit_mode_on_delivery =
                                    city_detail.admin_profit_mode_on_delivery;
                                  var admin_profit_value_on_delivery =
                                    city_detail.admin_profit_value_on_delivery;

                                  var delivery_price_used_type =
                                    ADMIN_DATA_ID.ADMIN;
                                  var delivery_price_used_type_id = null;
                                  var is_order_payment_status_set_by_store = false;
                                  if (
                                    store.is_store_can_add_provider ||
                                    store.is_store_can_complete_order
                                  ) {
                                    delivery_price_used_type =
                                      ADMIN_DATA_ID.STORE;
                                    delivery_price_used_type_id = store._id;
                                    is_order_payment_status_set_by_store = true;
                                  }

                                  var delivery_type = DELIVERY_TYPE.STORE;

                                  var query = {};
                                  if (request_data_body.vehicle_id) {
                                    var vehicle_id =
                                      request_data_body.vehicle_id;
                                    query = {
                                      city_id: city_id,
                                      delivery_type: delivery_type,
                                      vehicle_id: vehicle_id,
                                      type_id: delivery_price_used_type_id,
                                    };
                                  } else {
                                    query = {
                                      city_id: city_id,
                                      delivery_type: delivery_type,
                                      type_id: delivery_price_used_type_id,
                                    };
                                  }

                                  Service.find(query).then(
                                    (service_list) => {
                                      var service = null;
                                      var default_service_index =
                                        service_list.findIndex(
                                          (service) =>
                                            service.is_default == true
                                        );
                                      if (
                                        default_service_index !== -1 &&
                                        !vehicle_id
                                      ) {
                                        service =
                                          service_list[default_service_index];
                                      } else if (service_list.length > 0) {
                                        service = service_list[0];
                                      }

                                      if (service) {
                                        utils.check_zone(
                                          city_id,
                                          delivery_type,
                                          delivery_price_used_type_id,
                                          service.vehicle_id,
                                          city_detail.zone_business,
                                          store_location,
                                          destination_location,
                                          function (zone_response) {
                                            /* HERE USER PARAM */

                                            var total_distance =
                                              request_data_body.total_distance;
                                            var total_time =
                                              request_data_body.total_time;

                                            var is_user_pick_up_order = false;

                                            if (
                                              request_data_body.is_user_pick_up_order !=
                                              undefined
                                            ) {
                                              is_user_pick_up_order =
                                                request_data_body.is_user_pick_up_order;
                                            }

                                            var total_item_count =
                                              request_data_body.total_item_count;

                                            /* SERVICE DATA HERE */
                                            var base_price = 0;
                                            var base_price_distance = 0;
                                            var price_per_unit_distance = 0;
                                            var price_per_unit_time = 0;
                                            var service_tax = 0;
                                            var min_fare = 0;
                                            var is_min_fare_applied = false;

                                            if (service) {
                                              if (
                                                service.admin_profit_mode_on_delivery
                                              ) {
                                                admin_profit_mode_on_delivery =
                                                  service.admin_profit_mode_on_delivery;
                                                admin_profit_value_on_delivery =
                                                  service.admin_profit_value_on_delivery;
                                              }

                                              base_price = service.base_price;
                                              base_price_distance =
                                                service.base_price_distance;
                                              price_per_unit_distance =
                                                service.price_per_unit_distance;
                                              price_per_unit_time =
                                                service.price_per_unit_time;
                                              service_tax = service.service_tax;
                                              min_fare = service.min_fare;
                                            }
                                            var admin_profit_mode_on_store =
                                              store.admin_profit_mode_on_store;
                                            var admin_profit_value_on_store =
                                              store.admin_profit_value_on_store;
                                            // STORE DATA HERE //

                                            var item_tax = store.item_tax;
                                            // DELIVERY CALCULATION START //
                                            var distance_price = 0;
                                            var total_base_price = 0;
                                            var total_distance_price = 0;
                                            var total_time_price = 0;
                                            var total_service_price = 0;
                                            var total_admin_tax_price = 0;
                                            var total_after_tax_price = 0;
                                            var total_surge_price = 0;
                                            var total_delivery_price_after_surge = 0;
                                            var delivery_price = 0;
                                            var total_delivery_price = 0;
                                            var total_admin_profit_on_delivery = 0;
                                            var total_provider_income = 0;
                                            var promo_payment = 0;

                                            total_time = total_time / 60; // convert to mins
                                            total_time =
                                              utils.precisionRoundTwo(
                                                Number(total_time)
                                              );

                                            if (is_distance_unit_mile) {
                                              total_distance =
                                                total_distance * 0.000621371;
                                            } else {
                                              total_distance =
                                                total_distance * 0.001;
                                            }

                                            if (!is_user_pick_up_order) {
                                              if (
                                                service &&
                                                service.is_use_distance_calculation
                                              ) {
                                                var delivery_price_setting =
                                                  service.delivery_price_setting;
                                                delivery_price_setting.forEach(
                                                  function (
                                                    delivery_setting_detail
                                                  ) {
                                                    if (
                                                      delivery_setting_detail.to_distance >=
                                                      total_distance
                                                    ) {
                                                      distance_price =
                                                        distance_price +
                                                        delivery_setting_detail.delivery_fee;
                                                    }
                                                  }
                                                );
                                                total_distance_price =
                                                  distance_price;
                                                total_service_price =
                                                  distance_price;
                                                delivery_price = distance_price;
                                                total_after_tax_price =
                                                  distance_price;
                                                total_delivery_price_after_surge =
                                                  distance_price;
                                              } else {
                                                total_base_price = base_price;
                                                if (
                                                  total_distance >
                                                  base_price_distance
                                                ) {
                                                  distance_price =
                                                    (total_distance -
                                                      base_price_distance) *
                                                    price_per_unit_distance;
                                                }

                                                total_base_price =
                                                  utils.precisionRoundTwo(
                                                    total_base_price
                                                  );
                                                distance_price =
                                                  utils.precisionRoundTwo(
                                                    distance_price
                                                  );
                                                total_time_price =
                                                  price_per_unit_time *
                                                  total_time;
                                                total_time_price =
                                                  utils.precisionRoundTwo(
                                                    Number(total_time_price)
                                                  );

                                                total_distance_price =
                                                  +total_base_price +
                                                  +distance_price;
                                                total_distance_price =
                                                  utils.precisionRoundTwo(
                                                    total_distance_price
                                                  );

                                                total_service_price =
                                                  +total_distance_price +
                                                  +total_time_price;
                                                total_service_price =
                                                  utils.precisionRoundTwo(
                                                    Number(total_service_price)
                                                  );

                                                total_admin_tax_price =
                                                  service_tax *
                                                  total_service_price *
                                                  0.01;
                                                total_admin_tax_price =
                                                  utils.precisionRoundTwo(
                                                    Number(
                                                      total_admin_tax_price
                                                    )
                                                  );

                                                total_after_tax_price =
                                                  +total_service_price +
                                                  +total_admin_tax_price;
                                                total_after_tax_price =
                                                  utils.precisionRoundTwo(
                                                    Number(
                                                      total_after_tax_price
                                                    )
                                                  );

                                                total_delivery_price_after_surge =
                                                  +total_after_tax_price +
                                                  +total_surge_price;
                                                total_delivery_price_after_surge =
                                                  utils.precisionRoundTwo(
                                                    Number(
                                                      total_delivery_price_after_surge
                                                    )
                                                  );

                                                if (
                                                  total_delivery_price_after_surge <=
                                                  min_fare
                                                ) {
                                                  delivery_price = min_fare;
                                                  is_min_fare_applied = true;
                                                } else {
                                                  delivery_price =
                                                    total_delivery_price_after_surge;
                                                }
                                              }

                                              if (zone_response.success) {
                                                total_admin_tax_price = 0;
                                                total_base_price = 0;
                                                total_distance_price = 0;
                                                total_time_price = 0;
                                                total_service_price =
                                                  zone_response.zone_price;
                                                delivery_price =
                                                  zone_response.zone_price;
                                                total_after_tax_price =
                                                  total_service_price;
                                                total_delivery_price_after_surge =
                                                  total_service_price;
                                              }

                                              switch (
                                                admin_profit_mode_on_delivery
                                              ) {
                                                case ADMIN_PROFIT_ON_DELIVERY_ID.PERCENTAGE /* 1- percentage */:
                                                  total_admin_profit_on_delivery =
                                                    delivery_price *
                                                    admin_profit_value_on_delivery *
                                                    0.01;
                                                  break;
                                                case ADMIN_PROFIT_ON_DELIVERY_ID.PER_DELVIERY /* 2- absolute per delivery */:
                                                  total_admin_profit_on_delivery =
                                                    admin_profit_value_on_delivery;
                                                  break;
                                                default:
                                                  /* percentage */
                                                  total_admin_profit_on_delivery =
                                                    delivery_price *
                                                    admin_profit_value_on_delivery *
                                                    0.01;
                                                  break;
                                              }

                                              total_admin_profit_on_delivery =
                                                utils.precisionRoundTwo(
                                                  Number(
                                                    total_admin_profit_on_delivery
                                                  )
                                                );
                                              total_provider_income =
                                                delivery_price -
                                                total_admin_profit_on_delivery;
                                              total_provider_income =
                                                utils.precisionRoundTwo(
                                                  Number(total_provider_income)
                                                );
                                            } else {
                                              total_distance = 0;
                                              total_time = 0;
                                            }

                                            // DELIVERY CALCULATION END //
                                            // ORDER CALCULATION START //

                                            var order_price = 0;
                                            var total_store_tax_price = 0;
                                            var total_order_price = 0;
                                            var total_admin_profit_on_store = 0;
                                            var total_store_income = 0;
                                            var total_cart_price = 0;
                                            var is_store_pay_delivery_fees = false;

                                            total_cart_price =
                                              cart.total_cart_price;
                                            if (
                                              request_data_body.total_cart_price
                                            ) {
                                              total_cart_price =
                                                request_data_body.total_cart_price;
                                            }

                                            if (store.is_use_item_tax) {
                                              total_store_tax_price =
                                                cart.total_item_tax;
                                            } else {
                                              total_store_tax_price =
                                                total_cart_price *
                                                item_tax *
                                                0.01;
                                            }

                                            total_store_tax_price =
                                              utils.precisionRoundTwo(
                                                Number(total_store_tax_price)
                                              );
                                            cart.total_item_tax =
                                              total_store_tax_price;

                                            // total_store_tax_price = total_cart_price * item_tax * 0.01;
                                            // total_store_tax_price = utils.precisionRoundTwo(Number(total_store_tax_price));

                                            order_price =
                                              +total_cart_price +
                                              +total_store_tax_price;
                                            order_price =
                                              utils.precisionRoundTwo(
                                                Number(order_price)
                                              );

                                            switch (
                                              admin_profit_mode_on_store
                                            ) {
                                              case ADMIN_PROFIT_ON_ORDER_ID.PERCENTAGE /* percentage */:
                                                total_admin_profit_on_store =
                                                  order_price *
                                                  admin_profit_value_on_store *
                                                  0.01;
                                                break;
                                              case ADMIN_PROFIT_ON_ORDER_ID.PER_ORDER /* absolute per order */:
                                                total_admin_profit_on_store =
                                                  admin_profit_value_on_store;
                                                break;
                                              case ADMIN_PROFIT_ON_ORDER_ID.PER_ITEMS /* absolute value per items */:
                                                total_admin_profit_on_store =
                                                  admin_profit_value_on_store *
                                                  total_item_count;
                                                break;
                                              default:
                                                /* percentage */
                                                total_admin_profit_on_store =
                                                  order_price *
                                                  admin_profit_value_on_store *
                                                  0.01;
                                                break;
                                            }

                                            total_admin_profit_on_store =
                                              utils.precisionRoundTwo(
                                                Number(
                                                  total_admin_profit_on_store
                                                )
                                              );
                                            total_store_income =
                                              order_price -
                                              total_admin_profit_on_store;

                                            // if(delivery_price_used_type == ADMIN_DATA_ID.STORE){
                                            //     total_store_income = total_store_income + total_provider_income;
                                            //     total_provider_income = 0;
                                            // }
                                            total_store_income =
                                              utils.precisionRoundTwo(
                                                Number(total_store_income)
                                              );
                                            /* ORDER CALCULATION END */

                                            /* FINAL INVOICE CALCULATION START */
                                            total_delivery_price =
                                              delivery_price;
                                            total_order_price = order_price;
                                            var total =
                                              +total_delivery_price +
                                              +total_order_price;
                                            total = utils.precisionRoundTwo(
                                              Number(total)
                                            );
                                            var user_pay_payment = total;
                                            // Store Pay Delivery Fees Condition

                                            var distance_from_store =
                                              utils.getDistanceFromTwoLocation(
                                                destination_location,
                                                store_location
                                              );
                                            if (
                                              total_order_price >
                                                store.free_delivery_for_above_order_price &&
                                              distance_from_store <
                                                store.free_delivery_within_radius &&
                                              store.is_store_pay_delivery_fees ==
                                                true
                                            ) {
                                              is_store_pay_delivery_fees = true;
                                              user_pay_payment = order_price;
                                            }
                                            var user_radius_region;
                                            const getMinOrderPrice = (
                                              store
                                            ) => {
                                              if (
                                                store &&
                                                store.radius_regions &&
                                                store.radius_regions.length
                                              ) {
                                                let price = null;
                                                store.radius_regions.forEach(
                                                  (c, idx) => {
                                                    if (idx === 0) {
                                                      price = c.price;
                                                    }
                                                    if (
                                                      c &&
                                                      c.kmlzone &&
                                                      c.kmlzone.coordinates &&
                                                      c.kmlzone.coordinates[0]
                                                    ) {
                                                      const coordinates =
                                                        c.kmlzone.coordinates[0].map(
                                                          ([lat, long]) => {
                                                            return {
                                                              latitude: lat,
                                                              longitude: long,
                                                            };
                                                          }
                                                        );
                                                      if (
                                                        !request_data_body.user_lat &&
                                                        !request_data_body.user_lng
                                                      ) {
                                                        request_data_body.user_lat = 55.27467799999999;
                                                        request_data_body.user_lng = 25.1781685;
                                                      }
                                                      if (
                                                        request_data_body.user_lat &&
                                                        request_data_body.user_lng
                                                      ) {
                                                        const isInside =
                                                          geolib.isPointInPolygon(
                                                            {
                                                              latitude:
                                                                request_data_body.user_lat,
                                                              longitude:
                                                                request_data_body.user_lng,
                                                            },
                                                            coordinates
                                                          );

                                                        if (isInside) {
                                                          price = c.price;
                                                          user_radius_region =
                                                            c;
                                                        }
                                                      }
                                                    }
                                                  }
                                                );
                                                return price;
                                              } else {
                                                return store.min_order_price;
                                              }
                                            };

                                            const minOrderPrice =
                                              getMinOrderPrice(store);
                                            // ikkaf
                                            if (order_price < minOrderPrice) {
                                              response_data.json({
                                                success: false,
                                                min_order_price:
                                                  getMinOrderPrice(store),
                                                // total_order_price,
                                                // total_delivery_price,
                                                // item_tax: item_tax,
                                                // total_item_count,
                                                // total_order_price,
                                                // total_service_price,
                                                // total_cart_price,
                                                // service_tax,
                                                // user_pay_payment,
                                                // total_store_tax_price,
                                                // is_order_payment_status_set_by_store,

                                                // item_tax,
                                                error_code:
                                                  USER_ERROR_CODE.YOUR_ORDER_PRICE_LESS_THEN_STORE_MIN_ORDER_PRICE,
                                              });
                                            } else {
                                              cart.total_item_count =
                                                total_item_count;

                                              Vehicle.findOne({
                                                _id: service.vehicle_id,
                                              }).then((vehicle_data) => {
                                                if (!vehicle_data) {
                                                  vehicle_data = [];
                                                } else {
                                                  vehicle_data = [vehicle_data];
                                                }

                                                Order_payment.findOne({
                                                  _id: cart.order_payment_id,
                                                }).then(
                                                  async (order_payment) => {
                                                    if (order_payment) {
                                                      var promo_id =
                                                        order_payment.promo_id;
                                                      Promo_code.findOne({
                                                        _id: promo_id,
                                                      }).then(
                                                        async (promo_code) => {
                                                          if (promo_code) {
                                                            promo_code.used_promo_code =
                                                              promo_code.used_promo_code -
                                                              1;
                                                            promo_code.payment_apply_on =
                                                              promo_code.payment_apply_on.filter(
                                                                (id) =>
                                                                  id.toString() !=
                                                                  order_payment._id.toString()
                                                              );
                                                            console.log(
                                                              ">>>>121" +
                                                                JSON.stringify(
                                                                  order_payment._id
                                                                )
                                                            );
                                                            promo_code.save();
                                                            user.promo_count =
                                                              user.promo_count -
                                                              1;
                                                            user.save();
                                                          }
                                                        }
                                                      );

                                                      order_payment.cart_id =
                                                        cart._id;
                                                      order_payment.is_min_fare_applied =
                                                        is_min_fare_applied;
                                                      order_payment.order_id =
                                                        null;
                                                      order_payment.order_unique_id = 0;
                                                      order_payment.store_id =
                                                        store._id;
                                                      order_payment.user_id =
                                                        cart.user_id;
                                                      order_payment.country_id =
                                                        country_id;
                                                      order_payment.city_id =
                                                        city_id;
                                                      order_payment.provider_id =
                                                        null;
                                                      order_payment.promo_id =
                                                        null;
                                                      order_payment.delivery_price_used_type =
                                                        delivery_price_used_type;
                                                      order_payment.delivery_price_used_type_id =
                                                        delivery_price_used_type_id;
                                                      order_payment.currency_code =
                                                        wallet_currency_code;
                                                      order_payment.admin_currency_code =
                                                        "";
                                                      order_payment.order_currency_code =
                                                        store.wallet_currency_code;
                                                      order_payment.current_rate = 1;
                                                      order_payment.admin_profit_mode_on_delivery =
                                                        admin_profit_mode_on_delivery;
                                                      order_payment.admin_profit_value_on_delivery =
                                                        admin_profit_value_on_delivery;
                                                      order_payment.total_admin_profit_on_delivery =
                                                        total_admin_profit_on_delivery;
                                                      order_payment.total_provider_income =
                                                        total_provider_income;
                                                      order_payment.admin_profit_mode_on_store =
                                                        admin_profit_mode_on_store;
                                                      order_payment.admin_profit_value_on_store =
                                                        admin_profit_value_on_store;
                                                      order_payment.total_admin_profit_on_store =
                                                        total_admin_profit_on_store;
                                                      order_payment.total_store_income =
                                                        total_store_income;
                                                      order_payment.total_distance =
                                                        total_distance;
                                                      order_payment.total_time =
                                                        total_time;
                                                      order_payment.is_distance_unit_mile =
                                                        is_distance_unit_mile;
                                                      order_payment.total_service_price =
                                                        total_service_price;
                                                      order_payment.total_admin_tax_price =
                                                        total_admin_tax_price;
                                                      order_payment.total_after_tax_price =
                                                        total_after_tax_price;
                                                      order_payment.total_surge_price =
                                                        total_surge_price;
                                                      order_payment.total_delivery_price_after_surge =
                                                        total_delivery_price_after_surge;
                                                      order_payment.total_cart_price =
                                                        total_cart_price;
                                                      order_payment.total_delivery_price =
                                                        total_delivery_price;
                                                      order_payment.total_item_count =
                                                        total_item_count;
                                                      order_payment.service_tax =
                                                        service_tax;
                                                      order_payment.item_tax =
                                                        item_tax;
                                                      order_payment.total_store_tax_price =
                                                        total_store_tax_price;
                                                      order_payment.total_order_price =
                                                        total_order_price;
                                                      order_payment.promo_payment = 0;
                                                      if (
                                                        request_data_body.deduct_from_wallet &&
                                                        order_payment.wallet_deduction
                                                      ) {
                                                        user_pay_payment -=
                                                          order_payment.wallet_deduction;
                                                      }
                                                      order_payment.total =
                                                        total;
                                                      order_payment.wallet_payment = 0;
                                                      order_payment.total_after_wallet_payment = 0;
                                                      order_payment.cash_payment = 0;
                                                      order_payment.card_payment = 0;
                                                      order_payment.remaining_payment = 0;
                                                      order_payment.delivered_at =
                                                        null;
                                                      order_payment.is_order_payment_status_set_by_store =
                                                        is_order_payment_status_set_by_store;
                                                      order_payment.is_user_pick_up_order =
                                                        is_user_pick_up_order;
                                                      var delivery_fees =
                                                        user_radius_region &&
                                                        user_radius_region.delivery_fees
                                                          ? user_radius_region.delivery_fees
                                                          : store.delivery_fees;
                                                      //delivery
                                                      if (
                                                        user_pay_payment >
                                                        store.free_delivery_for_above_order_price
                                                      ) {
                                                        delivery_fees = 0;
                                                        is_store_pay_delivery_fees = true;
                                                      }

                                                      order_payment.user_pay_payment =
                                                        user_pay_payment +
                                                        delivery_fees;
                                                      order_payment.is_store_pay_delivery_fees =
                                                        is_store_pay_delivery_fees;
                                                      order_payment.total_delivery_price =
                                                        delivery_fees;
                                                      // var is_payment_max =
                                                      // user.is_payment_max;
                                                      // var is_pay_valid =
                                                      // user.is_pay_valid;
                                                      var is_payment_max =
                                                        user.is_payment_max;
                                                      var is_pay_valid =
                                                        user.is_pay_valid;
                                                      order_payment.is_paid_from_wallet = true;
                                                      await new Promise(
                                                        (res, rej) => {
                                                          remove_loyalty_points(
                                                            {
                                                              body: {
                                                                order_payment_id:
                                                                  order_payment._id.toString(),
                                                                user_id:
                                                                  order_payment.user_id.toString(),
                                                              },
                                                            },
                                                            {
                                                              json: (data) => {
                                                                res(data);
                                                              },
                                                            }
                                                          );
                                                        }
                                                      );
                                                      await new Promise(
                                                        (res, rej) => {
                                                          remove_promo_code(
                                                            {
                                                              body: {
                                                                order_payment_id:
                                                                  order_payment._id.toString(),
                                                              },
                                                            },
                                                            {
                                                              json: (data) => {
                                                                res(data);
                                                              },
                                                            }
                                                          );
                                                        }
                                                      );
                                                      order_payment.save().then(
                                                        () => {
                                                          order_payment.total_delivery_price =
                                                            delivery_fees;
                                                          response_data.json({
                                                            success: true,
                                                            message:
                                                              USER_MESSAGE_CODE.FARE_ESTIMATE_SUCCESSFULLY,
                                                            // delivery_fees,
                                                            // wallet: wallet,
                                                            // is_payment_max:
                                                            //   is_payment_max,
                                                            // is_pay_valid:
                                                            //   is_pay_valid,
                                                            // server_time:
                                                            //   server_time,
                                                            // timezone:
                                                            //   city_detail.timezone,
                                                            order_payment:
                                                              order_payment,
                                                            // store: {...store,user_radius_region},
                                                            // vehicles:
                                                            //   vehicle_data,
                                                          });
                                                        },
                                                        (error) => {
                                                          console.log(error);
                                                          response_data.json({
                                                            success: false,
                                                            error_code:
                                                              ERROR_CODE.SOMETHING_WENT_WRONG,
                                                          });
                                                        }
                                                      );
                                                    } else {
                                                      if (
                                                        request_data_body.deduct_from_wallet &&
                                                        order_payment.wallet_deduction
                                                      ) {
                                                        user_pay_payment -=
                                                          order_payment.wallet_deduction;
                                                      }
                                                      var delivery_fees =
                                                        user_radius_region &&
                                                        user_radius_region.delivery_fees
                                                          ? user_radius_region.delivery_fees
                                                          : store.delivery_fees;
                                                      if (
                                                        user_pay_payment >
                                                        store.free_delivery_for_above_order_price
                                                      ) {
                                                        delivery_fees = 0;
                                                        is_store_pay_delivery_fees = true;
                                                      }
                                                      user_pay_payment =
                                                        user_pay_payment +
                                                        delivery_fees;
                                                      /* ENTRY IN ORDER PAYMENT */
                                                      var order_payment =
                                                        new Order_payment({
                                                          cart_id: cart._id,
                                                          store_id: store._id,
                                                          user_id: cart.user_id,
                                                          country_id:
                                                            country_id,
                                                          city_id: city_id,
                                                          delivery_price_used_type:
                                                            delivery_price_used_type,
                                                          delivery_price_used_type_id:
                                                            delivery_price_used_type_id,
                                                          currency_code:
                                                            wallet_currency_code,
                                                          order_currency_code:
                                                            store.wallet_currency_code,
                                                          current_rate: 1, // HERE current_rate MEANS ORDER TO ADMIN CONVERT RATE
                                                          wallet_to_admin_current_rate: 1,
                                                          wallet_to_order_current_rate: 1,
                                                          total_distance:
                                                            total_distance,
                                                          total_time:
                                                            total_time,
                                                          service_tax:
                                                            service_tax,
                                                          is_min_fare_applied:
                                                            is_min_fare_applied,
                                                          item_tax: item_tax,
                                                          total_service_price:
                                                            total_service_price,
                                                          total_admin_tax_price:
                                                            total_admin_tax_price,
                                                          total_delivery_price:
                                                            total_delivery_price,
                                                          is_store_pay_delivery_fees:
                                                            is_store_pay_delivery_fees,
                                                          total_item_count:
                                                            total_item_count,
                                                          total_cart_price:
                                                            total_cart_price,
                                                          total_store_tax_price:
                                                            total_store_tax_price,
                                                          user_pay_payment:
                                                            user_pay_payment,
                                                          total_order_price:
                                                            total_order_price,
                                                          promo_payment:
                                                            promo_payment,
                                                          total: total,
                                                          admin_profit_mode_on_store:
                                                            admin_profit_mode_on_store,
                                                          admin_profit_value_on_store:
                                                            admin_profit_value_on_store,
                                                          total_admin_profit_on_store:
                                                            total_admin_profit_on_store,
                                                          total_store_income:
                                                            total_store_income,
                                                          admin_profit_mode_on_delivery:
                                                            admin_profit_mode_on_delivery,
                                                          admin_profit_value_on_delivery:
                                                            admin_profit_value_on_delivery,
                                                          total_admin_profit_on_delivery:
                                                            total_admin_profit_on_delivery,
                                                          total_provider_income:
                                                            total_provider_income,
                                                          is_user_pick_up_order:
                                                            is_user_pick_up_order,
                                                          is_order_payment_status_set_by_store:
                                                            is_order_payment_status_set_by_store,
                                                          is_distance_unit_mile:
                                                            is_distance_unit_mile,
                                                        });

                                                      order_payment.save().then(
                                                        () => {
                                                          order_payment.total_delivery_price =
                                                            delivery_fees;
                                                          var totalDeliveryPrice =
                                                            !isNaN(
                                                              Number(
                                                                delivery_fees
                                                              )
                                                            )
                                                              ? Number(
                                                                  delivery_fees
                                                                )
                                                              : delivery_fees;
                                                          cart.order_payment_id =
                                                            order_payment._id;
                                                          cart.save();

                                                          order_payment.save();
                                                          response_data.json({
                                                            success: true,
                                                            message:
                                                              USER_MESSAGE_CODE.FARE_ESTIMATE_SUCCESSFULLY,
                                                            // delivery_fees,
                                                            // wallet: wallet,
                                                            // is_payment_max:
                                                            //   is_payment_max,
                                                            // is_pay_valid:
                                                            //   is_pay_valid,
                                                            // server_time:
                                                            //   server_time,
                                                            // timezone:
                                                            //   city_detail.timezone,
                                                            order_payment:
                                                              order_payment,
                                                            // store: store,

                                                            // vehicles:
                                                            //   vehicle_data,
                                                          });
                                                        },
                                                        (error) => {
                                                          console.log(error);
                                                          response_data.json({
                                                            success: false,
                                                            error_code:
                                                              ERROR_CODE.SOMETHING_WENT_WRONG,
                                                          });
                                                        }
                                                      );
                                                    }
                                                  }
                                                );
                                              });
                                            }
                                          }
                                        );
                                      } else {
                                        response_data.json({
                                          success: false,
                                          error_code:
                                            USER_ERROR_CODE.DELIVERY_SERVICE_NOT_AVAILABLE_IN_YOUR_CITY,
                                        });
                                      }
                                    },
                                    (error) => {
                                      response_data.json({
                                        success: false,
                                        error_code:
                                          ERROR_CODE.SOMETHING_WENT_WRONG,
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
                  response_data.json({
                    success: false,
                    error_code: USER_ERROR_CODE.GET_ORDER_CART_INVOICE_FAILED,
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
exports.get_cards_and_order_cart_invoice = async function (req, res) {
  utils.check_request_params(
    req.body,
    [
      { name: "store_id", type: "string" },
      { name: "total_time" },
      { name: "total_distance" },
    ],
    async function (response) {
      if (response.success) {
        var request_data_body = req.body;
        var cart_unique_token = request_data_body.cart_unique_token;
        var cart_id = null;
        var user_id = null;
        var wallet_currency_code = "";
        var server_time = new Date(moment(new Date()).utc().valueOf());
        var order_type = Number(request_data_body.order_type);
        console.log(
          "get_cards_and_order_cart_invoice: " +
            JSON.stringify(request_data_body)
        );
        const customer_replacement_reason = [
          {
            key: "0",
            text: "Call me to confirm",
          },
          {
            key: "1",
            text: "Whatsapp me",
          },
          {
            key: "2",
            text: "In app substitute",
          },
          {
            key: "3",
            text: "I don't want substitute",
          },
        ];
        if (request_data_body.user_id == "") {
          request_data_body.user_id = null;
        }
        const user = await User.findOne({ _id: request_data_body.user_id });
        if (user) {
          cart_id = user.cart_id;
          user_id = user._id;
          cart_unique_token = null;
          wallet_currency_code = user.wallet_currency_code;
          var wallet = user.wallet;
          var is_payment_max = user.is_payment_max;
          var is_pay_valid = user.is_pay_valid;

          const card = await Card.find({ user_id });
          const setting = await Installation_setting.findOne({});
          var CKO_SECRET_KEY = setting.CKO_SECRET_KEY;
          var CKO_PUBLIC_KEY = setting.CKO_PUBLIC_KEY;

          var city = {};
          var store1 = {};
          if (user && user.city) {
            city = await City.findOne({ city_name: user.city });
          }
          if (request_data_body.store_id) {
            store1 = await Store.findOne({ _id: request_data_body.store_id });
          }
          var details = {
            loyalty_points:
              user && user.loyalty_points ? user.loyalty_points : 0,
            is_payment_max:
              user && user.is_payment_max ? user.is_payment_max : 0,
            is_use_wallet:
              user && user.is_use_wallet ? user.is_use_wallet : false,
            is_pay_valid: user && user.is_pay_valid ? user.is_pay_valid : true,
            is_cash_payment_mode:
              city && city.is_cash_payment_mode
                ? city.is_cash_payment_mode
                : false,
            currency: "AED",
            // is_cash_visible:
            //   store1 && store1.is_cash_visible ? store1.is_cash_visible : false,
            // is_card_on_delivery_visible:
            //   store1 && store1.is_card_on_delivery_visible
            //     ? store1.is_card_on_delivery_visible
            //     : false,
            // is_online_payment_visible:
            //   store1 && store1.is_online_payment_visible
            //     ? store1.is_online_payment_visible
            //     : false,
            // is_wallet_visible:
            //   store1 && store1.is_wallet_visible
            //     ? store1.is_wallet_visible
            //     : false,
          };
          var card_response;
          if (card.length != 0) {
            card_response = Object.assign(
              {
                data: card,
              },
              details
            );
          } else {
            card_response = Object.assign(
              {
                data: [],
                error_code: CART_CHECKOUT_CODE.GET_CARD_LIST_FAILED,
              },
              details
            );
          }
        }

        const cart = await Cart.findOne({
          $or: [{ _id: cart_id }, { cart_unique_token: cart_unique_token }],
        });
        if (!cart) {
          res.json({
            success: false,
            error_code: USER_ERROR_CODE.GET_ORDER_CART_INVOICE_FAILED,
          });
          return;
        }
        if (!cart.destination_addresses || !cart.destination_addresses.length) {
          res.json({
            success: false,
            error_code: USER_ERROR_CODE.GET_ORDER_CART_INVOICE_FAILED,
            message: "Destination addresses missing in the cart.",
          });
          return;
        }
        var destination_location = cart.destination_addresses[0].location;
        let store = await Store.findOne({
          _id: request_data_body.store_id,
        }).lean();
        if (!store) {
          res.json({
            success: false,
            error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND,
          });
          return;
        }
        let current_time = new Date(
          new Date().toLocaleString("en-US", {
            timeZone: "Asia/Dubai",
          })
        );
        let store_time = store.store_time;
        let storeTime = [];
        let len = 6;
        let firstSlotDayIndex = 0;
        let firstSlot = {};
        for (let i = 0; i <= len; i++) {
          const day_name = moment()
            .tz("Asia/Dubai")
            .add(i, "days")
            .format("ddd");
          const date = moment()
            .tz("Asia/Dubai")
            .add(i, "days")
            .format("DD/MM/YYYY");
          const currentStoreTime = store_time.find(
            (s) => s.day_name === day_name
          );

          let time = currentStoreTime
            ? { ...currentStoreTime, day_name, date }
            : {
                is_store_open: false,
                is_store_open_full_time: false,
                day_name,
                date,
                day_time: [],
              };
          let is_store_open = false;
          if (i === firstSlotDayIndex) {
            const dayTime = [];
            time.day_time.forEach((t) => {
              const tm = moment(t.store_open_time, "HH:mm");
              const ctm = moment(t.store_close_time, "HH:mm");
              const currTime = moment.tz("Asia/Dubai");
              const minutesOfDay = (m) => m.minutes() + m.hours() * 60;
              if (
                moment(currTime.format("HH:mm"), "HH:mm").isBetween(tm, ctm) &&
                i === 0
              ) {
                is_store_open = true;
              }
              if (minutesOfDay(currTime) < minutesOfDay(tm) || i !== 0) {
                dayTime.push(t);
              }
            });
            time.is_store_open = is_store_open;
            time.day_time = dayTime;
            if (dayTime.length === 0) {
              firstSlot = { ...time };
              firstSlotDayIndex++;
            } else {
              storeTime.push(time);
            }
          } else {
            time.is_store_open = time.day_time.length > 0 ? true : false;
            storeTime.push(time);
          }
        }
        if (firstSlotDayIndex > 0) storeTime.push(firstSlot);
        store.store_time = storeTime;

        var store_location = store.location;
        var city_id = store.city_id;
        var country_id = store.country_id;
        const country = Country.findOne({ _id: country_id });
        const city_detail = City.findOne({ _id: city_id });
        var is_distance_unit_mile = false;
        if (country) {
          is_distance_unit_mile = country.is_distance_unit_mile;
          if (!user) {
            wallet_currency_code = country.currency_code;
          }
        }
        if (wallet_currency_code == "") {
          wallet_currency_code = store.wallet_currency_code;
        }
        if (!city_detail) {
          res.json({
            success: false,
            error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
          });
          return;
        }
        var admin_profit_mode_on_delivery =
          city_detail.admin_profit_mode_on_delivery;
        var admin_profit_value_on_delivery =
          city_detail.admin_profit_value_on_delivery;

        var delivery_price_used_type = ADMIN_DATA_ID.ADMIN;
        var delivery_price_used_type_id = null;
        var is_order_payment_status_set_by_store = false;
        if (
          store.is_store_can_add_provider ||
          store.is_store_can_complete_order
        ) {
          delivery_price_used_type = ADMIN_DATA_ID.STORE;
          delivery_price_used_type_id = store._id;
          is_order_payment_status_set_by_store = true;
        }

        var delivery_type = DELIVERY_TYPE.STORE;

        var query = {};
        if (request_data_body.vehicle_id) {
          var vehicle_id = request_data_body.vehicle_id;
          query = {
            city_id: city_id,
            delivery_type: delivery_type,
            vehicle_id: vehicle_id,
            type_id: delivery_price_used_type_id,
          };
        } else {
          query = {
            city_id: city_id,
            delivery_type: delivery_type,
            type_id: delivery_price_used_type_id,
          };
        }
        const service_list = await Service.find(query);
        var service = null;
        var default_service_index = service_list.findIndex(
          (service) => service.is_default == true
        );
        if (default_service_index !== -1 && !vehicle_id) {
          service = service_list[default_service_index];
        } else if (service_list.length > 0) {
          service = service_list[0];
        }
        if (!service) {
          res.json({
            success: false,
            error_code:
              USER_ERROR_CODE.DELIVERY_SERVICE_NOT_AVAILABLE_IN_YOUR_CITY,
          });
          return;
        }
        utils.check_zone(
          city_id,
          delivery_type,
          delivery_price_used_type_id,
          service.vehicle_id,
          city_detail.zone_business,
          store_location,
          destination_location,
          async function (zone_response) {
            /* HERE USER PARAM */

            var total_distance = request_data_body.total_distance;
            var total_time = request_data_body.total_time;

            var is_user_pick_up_order = false;

            if (request_data_body.is_user_pick_up_order != undefined) {
              is_user_pick_up_order = request_data_body.is_user_pick_up_order;
            }

            var total_item_count = request_data_body.total_item_count;

            /* SERVICE DATA HERE */
            var base_price = 0;
            var base_price_distance = 0;
            var price_per_unit_distance = 0;
            var price_per_unit_time = 0;
            var service_tax = 0;
            var min_fare = 0;
            var is_min_fare_applied = false;

            if (service) {
              if (service.admin_profit_mode_on_delivery) {
                admin_profit_mode_on_delivery =
                  service.admin_profit_mode_on_delivery;
                admin_profit_value_on_delivery =
                  service.admin_profit_value_on_delivery;
              }

              base_price = service.base_price;
              base_price_distance = service.base_price_distance;
              price_per_unit_distance = service.price_per_unit_distance;
              price_per_unit_time = service.price_per_unit_time;
              service_tax = service.service_tax;
              min_fare = service.min_fare;
            }
            var admin_profit_mode_on_store = store.admin_profit_mode_on_store;
            var admin_profit_value_on_store = store.admin_profit_value_on_store;
            // STORE DATA HERE //

            var item_tax = store.item_tax;
            // DELIVERY CALCULATION START //
            var distance_price = 0;
            var total_base_price = 0;
            var total_distance_price = 0;
            var total_time_price = 0;
            var total_service_price = 0;
            var total_admin_tax_price = 0;
            var total_after_tax_price = 0;
            var total_surge_price = 0;
            var total_delivery_price_after_surge = 0;
            var delivery_price = 0;
            var total_delivery_price = 0;
            var total_admin_profit_on_delivery = 0;
            var total_provider_income = 0;

            total_time = total_time / 60; // convert to mins
            total_time = utils.precisionRoundTwo(Number(total_time));

            if (is_distance_unit_mile) {
              total_distance = total_distance * 0.000621371;
            } else {
              total_distance = total_distance * 0.001;
            }

            if (!is_user_pick_up_order) {
              if (service && service.is_use_distance_calculation) {
                var delivery_price_setting = service.delivery_price_setting;
                delivery_price_setting.forEach(function (
                  delivery_setting_detail
                ) {
                  if (delivery_setting_detail.to_distance >= total_distance) {
                    distance_price =
                      distance_price + delivery_setting_detail.delivery_fee;
                  }
                });
                total_distance_price = distance_price;
                total_service_price = distance_price;
                delivery_price = distance_price;
                total_after_tax_price = distance_price;
                total_delivery_price_after_surge = distance_price;
              } else {
                total_base_price = base_price;
                if (total_distance > base_price_distance) {
                  distance_price =
                    (total_distance - base_price_distance) *
                    price_per_unit_distance;
                }

                total_base_price = utils.precisionRoundTwo(total_base_price);
                distance_price = utils.precisionRoundTwo(distance_price);
                total_time_price = price_per_unit_time * total_time;
                total_time_price = utils.precisionRoundTwo(
                  Number(total_time_price)
                );

                total_distance_price = +total_base_price + +distance_price;
                total_distance_price =
                  utils.precisionRoundTwo(total_distance_price);

                total_service_price = +total_distance_price + +total_time_price;
                total_service_price = utils.precisionRoundTwo(
                  Number(total_service_price)
                );

                total_admin_tax_price =
                  service_tax * total_service_price * 0.01;
                total_admin_tax_price = utils.precisionRoundTwo(
                  Number(total_admin_tax_price)
                );

                total_after_tax_price =
                  +total_service_price + +total_admin_tax_price;
                total_after_tax_price = utils.precisionRoundTwo(
                  Number(total_after_tax_price)
                );

                total_delivery_price_after_surge =
                  +total_after_tax_price + +total_surge_price;
                total_delivery_price_after_surge = utils.precisionRoundTwo(
                  Number(total_delivery_price_after_surge)
                );

                if (total_delivery_price_after_surge <= min_fare) {
                  delivery_price = min_fare;
                  is_min_fare_applied = true;
                } else {
                  delivery_price = total_delivery_price_after_surge;
                }
              }

              if (zone_response.success) {
                total_admin_tax_price = 0;
                total_base_price = 0;
                total_distance_price = 0;
                total_time_price = 0;
                total_service_price = zone_response.zone_price;
                delivery_price = zone_response.zone_price;
                total_after_tax_price = total_service_price;
                total_delivery_price_after_surge = total_service_price;
              }

              switch (admin_profit_mode_on_delivery) {
                case ADMIN_PROFIT_ON_DELIVERY_ID.PERCENTAGE /* 1- percentage */:
                  total_admin_profit_on_delivery =
                    delivery_price * admin_profit_value_on_delivery * 0.01;
                  break;
                case ADMIN_PROFIT_ON_DELIVERY_ID.PER_DELVIERY /* 2- absolute per delivery */:
                  total_admin_profit_on_delivery =
                    admin_profit_value_on_delivery;
                  break;
                default:
                  /* percentage */
                  total_admin_profit_on_delivery =
                    delivery_price * admin_profit_value_on_delivery * 0.01;
                  break;
              }

              total_admin_profit_on_delivery = utils.precisionRoundTwo(
                Number(total_admin_profit_on_delivery)
              );
              total_provider_income =
                delivery_price - total_admin_profit_on_delivery;
              total_provider_income = utils.precisionRoundTwo(
                Number(total_provider_income)
              );
            } else {
              total_distance = 0;
              total_time = 0;
            }

            // DELIVERY CALCULATION END //
            // ORDER CALCULATION START //

            var order_price = 0;
            var total_store_tax_price = 0;
            var total_order_price = 0;
            var total_admin_profit_on_store = 0;
            var total_store_income = 0;
            var total_cart_price = 0;
            var is_store_pay_delivery_fees = false;

            total_cart_price = cart.total_cart_price;
            if (request_data_body.total_cart_price) {
              total_cart_price = request_data_body.total_cart_price;
            }

            if (store.is_use_item_tax) {
              total_store_tax_price = cart.total_item_tax;
            } else {
              total_store_tax_price = total_cart_price * item_tax * 0.01;
            }

            total_store_tax_price = utils.precisionRoundTwo(
              Number(total_store_tax_price)
            );
            cart.total_item_tax = total_store_tax_price;

            // total_store_tax_price = total_cart_price * item_tax * 0.01;
            // total_store_tax_price = utils.precisionRoundTwo(Number(total_store_tax_price));

            order_price = +total_cart_price + +total_store_tax_price;
            order_price = utils.precisionRoundTwo(Number(order_price));

            switch (admin_profit_mode_on_store) {
              case ADMIN_PROFIT_ON_ORDER_ID.PERCENTAGE /* percentage */:
                total_admin_profit_on_store =
                  order_price * admin_profit_value_on_store * 0.01;
                break;
              case ADMIN_PROFIT_ON_ORDER_ID.PER_ORDER /* absolute per order */:
                total_admin_profit_on_store = admin_profit_value_on_store;
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
            total_store_income = order_price - total_admin_profit_on_store;

            // if(delivery_price_used_type == ADMIN_DATA_ID.STORE){
            //     total_store_income = total_store_income + total_provider_income;
            //     total_provider_income = 0;
            // }
            total_store_income = utils.precisionRoundTwo(
              Number(total_store_income)
            );
            /* ORDER CALCULATION END */

            /* FINAL INVOICE CALCULATION START */
            total_delivery_price = delivery_price;
            total_order_price = order_price;
            var total = +total_delivery_price + +total_order_price;
            total = utils.precisionRoundTwo(Number(total));
            var user_pay_payment = total;
            // Store Pay Delivery Fees Condition

            var distance_from_store = utils.getDistanceFromTwoLocation(
              destination_location,
              store_location
            );
            if (
              total_order_price > store.free_delivery_for_above_order_price &&
              distance_from_store < store.free_delivery_within_radius &&
              store.is_store_pay_delivery_fees == true
            ) {
              is_store_pay_delivery_fees = true;
              user_pay_payment = order_price;
            }
            let latitude = request_data_body.user_lat;
            let longitude = request_data_body.user_lng;
            if (!request_data_body.user_lat && !request_data_body.user_lng) {
              latitude = 55.27467799999999;
              longitude = 25.1781685;
            }
            const minOrderPrice = await setUseRadiusZone(
              store,
              latitude,
              longitude,
              cart_id
            );
            const store_resp = {
              _id: store._id,
              name: store.name,
              user_radius_zone: store.user_radius_zone,
              image_url: store.image_url,
              price_rating: store.price_rating,
              is_store_busy: store.is_store_busy,
              is_business: store.is_business,
              is_approved: store.is_approved,
              is_taking_schedule_order: store.is_taking_schedule_order,
              inform_schedule_order_before_min:
                store.inform_schedule_order_before_min,
              schedule_order_create_after_minute:
                store.schedule_order_create_after_minute,
              is_provide_pickup_delivery: store.is_provide_pickup_delivery,
              is_card_on_delivery_visible: store.is_card_on_delivery_visible,
              is_cash_visible: store.is_cash_visible,
              is_online_payment_visible: store.is_online_payment_visible,
              is_show_cash: store.is_show_cash,
              is_wallet_visible: store.is_wallet_visible,
              min_price_for_card_on_delivery:
                store.min_price_for_card_on_delivery,
              min_price_for_cash: store.min_price_for_cash,
              min_price_for_online_payment: store.min_price_for_online_payment,
              min_price_for_wallet: store.min_price_for_wallet,
              is_payment_max: user.is_payment_max,
              is_use_wallet: user.is_use_wallet,
              is_pay_valid: user.is_pay_valid,
              user_rate: store.user_rate,
              user_rate_count: store.user_rate_count,
              is_visible: store.is_visible,
              store_time: store.store_time,
              slogan: store.slogan,
              famous_products_tags: store.famous_products_tags,
              server_token: store.server_token,
              store_type: store.store_type,
              admin_type: store.admin_type,
              store_type_id: store.store_type_id,
              location: store.location,
              created_at: store.created_at,
              updated_at: store.updated_at,
              unique_id: store.unique_id,
              auto_complete_order: store.auto_complete_order,
              store_sequence: store.store_sequence,
              is_show_card_on_delivery: store.is_show_card_on_delivery,
              is_show_online_payment: store.is_show_online_payment,
              name_type: store.name_type,
              image_url_2: store.image_url_2,
              images: store.images,
              info: store.info,
              tags: store.tags,
              under_item_price: store.under_item_price,
              min_order_for_loyalty: store.min_order_for_loyalty,
              is_loyalty_payment_visible: store.is_loyalty_payment_visible,
            };
            if (order_price < minOrderPrice) {
              res.json({
                success: false,
                min_order_price: minOrderPrice,
                // total_order_price,
                // total_delivery_price,
                // item_tax: item_tax,
                // total_item_count,
                // total_order_price,
                // total_service_price,
                // total_cart_price,
                // service_tax,
                // user_pay_payment,
                // total_store_tax_price,
                // is_order_payment_status_set_by_store,

                // item_tax,
                error_code:
                  USER_ERROR_CODE.YOUR_ORDER_PRICE_LESS_THEN_STORE_MIN_ORDER_PRICE,
              });
            } else {
              cart.total_item_count = total_item_count;

              Vehicle.findOne({
                _id: service.vehicle_id,
              }).then((vehicle_data) => {
                if (!vehicle_data) {
                  vehicle_data = [];
                } else {
                  vehicle_data = [vehicle_data];
                }

                Order_payment.findOne({
                  _id: cart.order_payment_id,
                }).then(async (order_payment) => {
                  if (order_payment) {
                    var promo_id = order_payment.promo_id;
                    Promo_code.findOne({
                      _id: promo_id,
                    }).then(async (promo_code) => {
                      if (promo_code) {
                        promo_code.used_promo_code =
                          promo_code.used_promo_code - 1;
                        promo_code.payment_apply_on =
                          promo_code.payment_apply_on.filter(
                            (id) =>
                              id.toString() != order_payment._id.toString()
                          );
                        console.log(
                          ">>>>121" + JSON.stringify(order_payment._id)
                        );
                        promo_code.save();
                        user.promo_count = user.promo_count - 1;
                        user.save();
                      }
                    });

                    order_payment.cart_id = cart._id;
                    order_payment.is_min_fare_applied = is_min_fare_applied;
                    order_payment.order_id = null;
                    order_payment.order_unique_id = 0;
                    order_payment.store_id = store._id;
                    order_payment.user_id = cart.user_id;
                    order_payment.country_id = country_id;
                    order_payment.city_id = city_id;
                    order_payment.provider_id = null;
                    order_payment.delivery_price_used_type =
                      delivery_price_used_type;
                    order_payment.delivery_price_used_type_id =
                      delivery_price_used_type_id;
                    order_payment.currency_code = wallet_currency_code;
                    order_payment.admin_currency_code = "";
                    order_payment.order_currency_code =
                      store.wallet_currency_code;
                    order_payment.current_rate = 1;
                    order_payment.admin_profit_mode_on_delivery =
                      admin_profit_mode_on_delivery;
                    order_payment.admin_profit_value_on_delivery =
                      admin_profit_value_on_delivery;
                    order_payment.total_admin_profit_on_delivery =
                      total_admin_profit_on_delivery;
                    order_payment.total_provider_income = total_provider_income;
                    order_payment.admin_profit_mode_on_store =
                      admin_profit_mode_on_store;
                    order_payment.admin_profit_value_on_store =
                      admin_profit_value_on_store;
                    order_payment.total_admin_profit_on_store =
                      total_admin_profit_on_store;
                    order_payment.total_store_income = total_store_income;
                    order_payment.total_distance = total_distance;
                    order_payment.total_time = total_time;
                    order_payment.is_distance_unit_mile = is_distance_unit_mile;
                    order_payment.total_service_price = total_service_price;
                    order_payment.total_admin_tax_price = total_admin_tax_price;
                    order_payment.total_after_tax_price = total_after_tax_price;
                    order_payment.total_surge_price = total_surge_price;
                    order_payment.total_delivery_price_after_surge =
                      total_delivery_price_after_surge;
                    order_payment.total_cart_price = total_cart_price;
                    order_payment.total_delivery_price = total_delivery_price;
                    order_payment.total_item_count = total_item_count;
                    order_payment.service_tax = service_tax;
                    order_payment.item_tax = item_tax;
                    order_payment.total_store_tax_price = total_store_tax_price;
                    order_payment.total_order_price = total_order_price;
                    if (
                      request_data_body.deduct_from_wallet &&
                      order_payment.wallet_deduction
                    ) {
                      user_pay_payment -= order_payment.wallet_deduction;
                    }
                    order_payment.total = total;
                    order_payment.wallet_payment = 0;
                    order_payment.total_after_wallet_payment = 0;
                    order_payment.cash_payment = 0;
                    order_payment.card_payment = 0;
                    order_payment.remaining_payment = 0;
                    order_payment.delivered_at = null;
                    order_payment.is_order_payment_status_set_by_store =
                      is_order_payment_status_set_by_store;
                    order_payment.is_user_pick_up_order = is_user_pick_up_order;
                    var delivery_fees = store.user_radius_zone.delivery_fees
                      ? store.user_radius_zone.delivery_fees
                      : store.delivery_fees;
                    if (
                      user_pay_payment >
                      store.free_delivery_for_above_order_price
                    ) {
                      delivery_fees = 0;
                      is_store_pay_delivery_fees = true;
                    }

                    let other_promo = order_payment.loyalty_payment
                      ? order_payment.loyalty_payment
                      : order_payment.promo_payment;

                    if (!other_promo) other_promo = 0;
                    try {
                      const userId = user._id || order_payment.user_id;
                      const userSetting = await UserSetting.findOne({
                        userId,
                      }).lean();
                      if (
                        userSetting &&
                        userSetting.free_delivery &&
                        user_pay_payment > userSetting.free_delivery_amount
                      ) {
                        delivery_fees = 0;
                      }
                    } catch (error) {
                      console.log(
                        "error: unable to find user setting for applying free delivery",
                        error
                      );
                    }

                    order_payment.user_pay_payment =
                      user_pay_payment + delivery_fees - other_promo;
                    order_payment.is_store_pay_delivery_fees =
                      is_store_pay_delivery_fees;
                    order_payment.total_delivery_price = delivery_fees;
                    // var is_payment_max =
                    // user.is_payment_max;
                    // var is_pay_valid =
                    // user.is_pay_valid;
                    // var is_payment_max = user.is_payment_max;
                    // var is_pay_valid = user.is_pay_valid;
                    order_payment.save().then(
                      async () => {
                        order_payment.total_delivery_price = delivery_fees;
                        delete store.radius_regions;
                        const setting = await Setting.findOne({});
                        let promo_code_name = "";
                        if (order_payment && order_payment.promo_id) {
                          const code = await Promo_code.findById(
                            order_payment.promo_id
                          ).lean();
                          if (code) {
                            promo_code_name = code.promo_code_name;
                          }
                        }
                        res.json({
                          success: true,
                          message: USER_MESSAGE_CODE.FARE_ESTIMATE_SUCCESSFULLY,
                          delivery_fees,
                          wallet: wallet,
                          // is_payment_max:
                          //   is_payment_max,
                          // is_pay_valid:
                          //   is_pay_valid,
                          server_time: server_time,
                          timezone: city_detail.timezone,
                          order_payment: {
                            ...order_payment.toJSON(),
                            promo_code_name,
                          },
                          store: store_resp,
                          customer_replacement_reason,
                          max_loyalty_per_order_to_redeem:
                            setting.max_loyalty_per_order_to_redeem,
                          is_amount_per_loyalty_to_redeem:
                            setting.is_amount_per_loyalty_to_redeem,
                          is_amount_per_loyalty_to_add_for_order:
                            setting.is_amount_per_loyalty_to_add_for_order,
                          // vehicles: vehicle_data,
                          ...card_response,
                        });
                      },
                      (error) => {
                        res.json({
                          success: false,
                          error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                        });
                      }
                    );
                  } else {
                    // var is_use_loyalty = request_data_body.is_use_loyalty;
                    // var loyalty_payment = 0;
                    // if (is_use_loyalty) {
                    //   const setting = await Setting.findOne({});
                    //   const min_redeem_point =
                    //     setting.is_point_per_loyalty_to_redeem;
                    //   const min_order_value =
                    //     setting.is_amount_per_loyalty_to_redeem;
                    //   //
                    //   //
                    //   //
                    //   if (cart.total_cart_price > min_order_value) {
                    //     // user.loyalty_points = user.loyalty_points - min_redeem_point
                    //     loyalty_payment = user.loyalty_points;
                    //     if (user_pay_payment < loyalty_payment) {
                    //       user.loyalty_points = Math.floor(
                    //         loyalty_payment - user_pay_payment
                    //       );
                    //       loyalty_payment = user_pay_payment;
                    //       user_pay_payment = 0;
                    //     } else {
                    //       user_pay_payment =
                    //         user_pay_payment - loyalty_payment;
                    //       user.loyalty_points = 0;
                    //     }
                    //     user.save();
                    //
                    //   }
                    // }
                    if (
                      request_data_body.deduct_from_wallet &&
                      order_payment.wallet_deduction
                    ) {
                      user_pay_payment -= order_payment.wallet_deduction;
                    }
                    var delivery_fees = store.user_radius_zone.delivery_fees
                      ? store.user_radius_zone.delivery_fees
                      : store.delivery_fees;
                    if (
                      user_pay_payment >
                      store.free_delivery_for_above_order_price
                    ) {
                      delivery_fees = 0;
                      is_store_pay_delivery_fees = true;
                    }
                    try {
                      const userId = user._id || order_payment.user_id;
                      const userSetting = await UserSetting.findOne({
                        userId,
                      }).lean();
                      if (
                        userSetting &&
                        userSetting.free_delivery &&
                        user_pay_payment > userSetting.free_delivery_amount
                      ) {
                        delivery_fees = 0;
                      }
                    } catch (error) {
                      console.log(
                        "error: unable to find user setting for applying free delivery",
                        error
                      );
                    }

                    user_pay_payment = user_pay_payment + delivery_fees;
                    /* ENTRY IN ORDER PAYMENT */
                    var order_payment = new Order_payment({
                      cart_id: cart._id,
                      store_id: store._id,
                      user_id: cart.user_id,
                      country_id: country_id,
                      city_id: city_id,
                      // loyalty_payment: loyalty_payment,
                      delivery_price_used_type: delivery_price_used_type,
                      delivery_price_used_type_id: delivery_price_used_type_id,
                      currency_code: wallet_currency_code,
                      order_currency_code: store.wallet_currency_code,
                      current_rate: 1, // HERE current_rate MEANS ORDER TO ADMIN CONVERT RATE
                      wallet_to_admin_current_rate: 1,
                      wallet_to_order_current_rate: 1,
                      total_distance: total_distance,
                      total_time: total_time,
                      service_tax: service_tax,
                      is_min_fare_applied: is_min_fare_applied,
                      item_tax: item_tax,
                      total_service_price: total_service_price,
                      total_admin_tax_price: total_admin_tax_price,
                      total_delivery_price: total_delivery_price,
                      is_store_pay_delivery_fees: is_store_pay_delivery_fees,
                      total_item_count: total_item_count,
                      total_cart_price: total_cart_price,
                      total_store_tax_price: total_store_tax_price,
                      user_pay_payment: user_pay_payment,
                      total_order_price: total_order_price,
                      promo_payment: 0,
                      total: total,
                      admin_profit_mode_on_store: admin_profit_mode_on_store,
                      admin_profit_value_on_store: admin_profit_value_on_store,
                      total_admin_profit_on_store: total_admin_profit_on_store,
                      total_store_income: total_store_income,
                      admin_profit_mode_on_delivery:
                        admin_profit_mode_on_delivery,
                      admin_profit_value_on_delivery:
                        admin_profit_value_on_delivery,
                      total_admin_profit_on_delivery:
                        total_admin_profit_on_delivery,
                      total_provider_income: total_provider_income,
                      is_user_pick_up_order: is_user_pick_up_order,
                      is_order_payment_status_set_by_store:
                        is_order_payment_status_set_by_store,
                      is_distance_unit_mile: is_distance_unit_mile,
                    });

                    order_payment.save().then(
                      async () => {
                        order_payment.total_delivery_price = delivery_fees;
                        var totalDeliveryPrice = !isNaN(Number(delivery_fees))
                          ? Number(delivery_fees)
                          : delivery_fees;
                        cart.order_payment_id = order_payment._id;
                        cart.save();

                        order_payment.save();
                        delete store.radius_regions;
                        const setting = await Setting.findOne({});

                        res.json({
                          success: true,
                          message: USER_MESSAGE_CODE.FARE_ESTIMATE_SUCCESSFULLY,
                          delivery_fees,
                          wallet: wallet,
                          is_payment_max: is_payment_max,
                          is_pay_valid: is_pay_valid,
                          server_time: server_time,
                          timezone: city_detail.timezone,
                          order_payment: order_payment,
                          store: store_resp,
                          customer_replacement_reason,
                          max_loyalty_per_order_to_redeem:
                            setting.max_loyalty_per_order_to_redeem,
                          is_amount_per_loyalty_to_redeem:
                            setting.is_amount_per_loyalty_to_redeem,
                          is_amount_per_loyalty_to_add_for_order:
                            setting.is_amount_per_loyalty_to_add_for_order,
                          // vehicles: vehicle_data,
                          ...card_response,
                        });
                      },
                      (error) => {
                        res.json({
                          success: false,
                          error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                        });
                      }
                    );
                  }
                });
              });
            }
          }
        );
      } else {
        res.json(response);
      }
    }
  );
};
exports.get_courier_order_invoice = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "total_time" }, { name: "total_distance" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var cart_unique_token = request_data_body.cart_unique_token;
        var server_time = new Date(moment(new Date()).utc().valueOf());

        if (request_data_body.user_id == "") {
          request_data_body.user_id = null;
        }

        User.findOne({ _id: request_data_body.user_id }).then(
          (user) => {
            // if(user){

            if (user) {
              cart_id = user.cart_id;
              user_id = user._id;
              cart_unique_token = null;
              is_payment_max = user.is_payment_max;
              is_pay_valid = user.is_pay_valid;

              wallet_currency_code = user.wallet_currency_code;
            }
            Cart.findOne({
              $or: [{ _id: cart_id }, { cart_unique_token: cart_unique_token }],
            }).then(
              (cart) => {
                if (cart) {
                  var destination_location =
                    cart.destination_addresses[0].location;
                  var pickup_location = cart.pickup_addresses[0].location;
                  var city_id = request_data_body.city_id;
                  var country_id = request_data_body.country_id;
                  var delivery_type = DELIVERY_TYPE.COURIER;

                  Country.findOne({ _id: country_id }).then(
                    (country) => {
                      var is_distance_unit_mile = false;
                      if (country) {
                        var is_distance_unit_mile =
                          country.is_distance_unit_mile;
                        if (!user) {
                          wallet_currency_code = country.currency_code;
                        }
                      }

                      City.findOne({ _id: city_id }).then(
                        (city_detail) => {
                          if (city_detail) {
                            var admin_profit_mode_on_delivery =
                              city_detail.admin_profit_mode_on_delivery;
                            var admin_profit_value_on_delivery =
                              city_detail.admin_profit_value_on_delivery;

                            var delivery_price_used_type = ADMIN_DATA_ID.ADMIN;
                            var delivery_price_used_type_id = null;
                            var is_order_payment_status_set_by_store = false;

                            var query = {};
                            if (request_data_body.vehicle_id) {
                              var vehicle_id = request_data_body.vehicle_id;
                              query = {
                                city_id: city_id,
                                delivery_type: delivery_type,
                                vehicle_id: vehicle_id,
                                type_id: delivery_price_used_type_id,
                              };
                            } else {
                              query = {
                                city_id: city_id,
                                delivery_type: delivery_type,
                                type_id: delivery_price_used_type_id,
                              };
                            }

                            Service.find(query).then(
                              (service_list) => {
                                var service = null;
                                var default_service_index =
                                  service_list.findIndex(
                                    (service) => service.is_default == true
                                  );
                                if (
                                  default_service_index !== -1 &&
                                  !vehicle_id
                                ) {
                                  service = service_list[default_service_index];
                                } else if (service_list.length > 0) {
                                  service = service_list[0];
                                }

                                if (service) {
                                  utils.check_zone(
                                    city_id,
                                    delivery_type,
                                    delivery_price_used_type_id,
                                    service.vehicle_id,
                                    city_detail.zone_business,
                                    pickup_location,
                                    destination_location,
                                    function (zone_response) {
                                      /* HERE USER PARAM */

                                      var total_distance =
                                        request_data_body.total_distance;
                                      var total_time =
                                        request_data_body.total_time;

                                      var is_user_pick_up_order = false;

                                      var total_item_count = 1;

                                      /* SERVICE DATA HERE */
                                      var base_price = 0;
                                      var base_price_distance = 0;
                                      var price_per_unit_distance = 0;
                                      var price_per_unit_time = 0;
                                      var service_tax = 0;
                                      var min_fare = 0;
                                      var is_min_fare_applied = false;

                                      if (service) {
                                        if (
                                          service.admin_profit_mode_on_delivery
                                        ) {
                                          admin_profit_mode_on_delivery =
                                            service.admin_profit_mode_on_delivery;
                                          admin_profit_value_on_delivery =
                                            service.admin_profit_value_on_delivery;
                                        }

                                        base_price = service.base_price;
                                        base_price_distance =
                                          service.base_price_distance;
                                        price_per_unit_distance =
                                          service.price_per_unit_distance;
                                        price_per_unit_time =
                                          service.price_per_unit_time;
                                        service_tax = service.service_tax;
                                        min_fare = service.min_fare;
                                      }
                                      var admin_profit_mode_on_store = 0;
                                      var admin_profit_value_on_store = 0;
                                      // STORE DATA HERE //

                                      var item_tax = 0;
                                      // DELIVERY CALCULATION START //
                                      var distance_price = 0;
                                      var total_base_price = 0;
                                      var total_distance_price = 0;
                                      var total_time_price = 0;
                                      var total_service_price = 0;
                                      var total_admin_tax_price = 0;
                                      var total_after_tax_price = 0;
                                      var total_surge_price = 0;
                                      var total_delivery_price_after_surge = 0;
                                      var delivery_price = 0;
                                      var total_delivery_price = 0;
                                      var total_admin_profit_on_delivery = 0;
                                      var total_provider_income = 0;
                                      var promo_payment = 0;

                                      total_time = total_time / 60; // convert to mins
                                      total_time = utils.precisionRoundTwo(
                                        Number(total_time)
                                      );

                                      if (is_distance_unit_mile) {
                                        total_distance =
                                          total_distance * 0.000621371;
                                      } else {
                                        total_distance = total_distance * 0.001;
                                      }

                                      if (!is_user_pick_up_order) {
                                        if (
                                          service &&
                                          service.is_use_distance_calculation
                                        ) {
                                          var delivery_price_setting =
                                            service.delivery_price_setting;
                                          delivery_price_setting.forEach(
                                            function (delivery_setting_detail) {
                                              if (
                                                delivery_setting_detail.to_distance >=
                                                total_distance
                                              ) {
                                                distance_price =
                                                  distance_price +
                                                  delivery_setting_detail.delivery_fee;
                                              }
                                            }
                                          );
                                          total_distance_price = distance_price;
                                          total_service_price = distance_price;
                                          delivery_price = distance_price;
                                          total_after_tax_price =
                                            distance_price;
                                          total_delivery_price_after_surge =
                                            distance_price;
                                        } else {
                                          total_base_price = base_price;
                                          if (
                                            total_distance > base_price_distance
                                          ) {
                                            distance_price =
                                              (total_distance -
                                                base_price_distance) *
                                              price_per_unit_distance;
                                          }

                                          total_base_price =
                                            utils.precisionRoundTwo(
                                              total_base_price
                                            );
                                          distance_price =
                                            utils.precisionRoundTwo(
                                              distance_price
                                            );
                                          total_time_price =
                                            price_per_unit_time * total_time;
                                          total_time_price =
                                            utils.precisionRoundTwo(
                                              Number(total_time_price)
                                            );

                                          total_distance_price =
                                            +total_base_price + +distance_price;
                                          total_distance_price =
                                            utils.precisionRoundTwo(
                                              total_distance_price
                                            );

                                          total_service_price =
                                            +total_distance_price +
                                            +total_time_price;
                                          total_service_price =
                                            utils.precisionRoundTwo(
                                              Number(total_service_price)
                                            );

                                          total_admin_tax_price =
                                            service_tax *
                                            total_service_price *
                                            0.01;
                                          total_admin_tax_price =
                                            utils.precisionRoundTwo(
                                              Number(total_admin_tax_price)
                                            );

                                          total_after_tax_price =
                                            +total_service_price +
                                            +total_admin_tax_price;
                                          total_after_tax_price =
                                            utils.precisionRoundTwo(
                                              Number(total_after_tax_price)
                                            );

                                          total_delivery_price_after_surge =
                                            +total_after_tax_price +
                                            +total_surge_price;
                                          total_delivery_price_after_surge =
                                            utils.precisionRoundTwo(
                                              Number(
                                                total_delivery_price_after_surge
                                              )
                                            );

                                          if (
                                            total_delivery_price_after_surge <=
                                            min_fare
                                          ) {
                                            delivery_price = min_fare;
                                            is_min_fare_applied = true;
                                          } else {
                                            delivery_price =
                                              total_delivery_price_after_surge;
                                          }
                                        }

                                        if (zone_response.success) {
                                          total_admin_tax_price = 0;
                                          total_base_price = 0;
                                          total_distance_price = 0;
                                          total_time_price = 0;
                                          total_service_price =
                                            zone_response.zone_price;
                                          delivery_price =
                                            zone_response.zone_price;
                                          total_after_tax_price =
                                            total_service_price;
                                          total_delivery_price_after_surge =
                                            total_service_price;
                                        }

                                        switch (admin_profit_mode_on_delivery) {
                                          case ADMIN_PROFIT_ON_DELIVERY_ID.PERCENTAGE /* 1- percentage */:
                                            total_admin_profit_on_delivery =
                                              delivery_price *
                                              admin_profit_value_on_delivery *
                                              0.01;
                                            break;
                                          case ADMIN_PROFIT_ON_DELIVERY_ID.PER_DELVIERY /* 2- absolute per delivery */:
                                            total_admin_profit_on_delivery =
                                              admin_profit_value_on_delivery;
                                            break;
                                          default:
                                            /* percentage */
                                            total_admin_profit_on_delivery =
                                              delivery_price *
                                              admin_profit_value_on_delivery *
                                              0.01;
                                            break;
                                        }

                                        total_admin_profit_on_delivery =
                                          utils.precisionRoundTwo(
                                            Number(
                                              total_admin_profit_on_delivery
                                            )
                                          );
                                        total_provider_income =
                                          delivery_price -
                                          total_admin_profit_on_delivery;
                                        total_provider_income =
                                          utils.precisionRoundTwo(
                                            Number(total_provider_income)
                                          );
                                      } else {
                                        total_distance = 0;
                                        total_time = 0;
                                      }

                                      // DELIVERY CALCULATION END //
                                      // ORDER CALCULATION START //

                                      var order_price = 0;
                                      var total_store_tax_price = 0;
                                      var total_order_price = 0;
                                      var total_admin_profit_on_store = 0;
                                      var total_store_income = 0;
                                      var total_cart_price = 0;
                                      var is_store_pay_delivery_fees = false;

                                      total_cart_price = 0;

                                      cart.total_item_tax =
                                        total_store_tax_price;

                                      order_price =
                                        +total_cart_price +
                                        +total_store_tax_price;
                                      order_price = utils.precisionRoundTwo(
                                        Number(order_price)
                                      );

                                      /* FINAL INVOICE CALCULATION START */
                                      total_delivery_price = delivery_price;
                                      total_order_price = order_price;
                                      var total =
                                        +total_delivery_price +
                                        +total_order_price;
                                      total = utils.precisionRoundTwo(
                                        Number(total)
                                      );
                                      var user_pay_payment = total;

                                      cart.total_item_count = total_item_count;

                                      Vehicle.findOne({
                                        _id: service.vehicle_id,
                                      }).then((vehicle_data) => {
                                        if (!vehicle_data) {
                                          vehicle_data = [];
                                        } else {
                                          vehicle_data = [vehicle_data];
                                        }

                                        Order_payment.findOne({
                                          _id: cart.order_payment_id,
                                        }).then((order_payment) => {
                                          if (order_payment) {
                                            var promo_id =
                                              order_payment.promo_id;
                                            Promo_code.findOne({
                                              _id: promo_id,
                                            }).then((promo_code) => {
                                              if (promo_code) {
                                                promo_code.used_promo_code =
                                                  promo_code.used_promo_code -
                                                  1;
                                                promo_code.save();
                                                user.promo_count =
                                                  user.promo_count - 1;
                                                user.save();
                                              }
                                            });

                                            order_payment.cart_id = cart._id;
                                            order_payment.is_min_fare_applied =
                                              is_min_fare_applied;
                                            order_payment.order_id = null;
                                            order_payment.order_unique_id = 0;
                                            order_payment.store_id = null;
                                            order_payment.user_id =
                                              cart.user_id;
                                            order_payment.country_id =
                                              country_id;
                                            order_payment.city_id = city_id;
                                            order_payment.provider_id = null;
                                            order_payment.promo_id = null;
                                            order_payment.delivery_price_used_type =
                                              delivery_price_used_type;
                                            order_payment.delivery_price_used_type_id =
                                              delivery_price_used_type_id;
                                            order_payment.currency_code =
                                              wallet_currency_code;
                                            order_payment.admin_currency_code =
                                              "";
                                            order_payment.order_currency_code =
                                              user.wallet_currency_code;
                                            order_payment.current_rate = 1;
                                            order_payment.admin_profit_mode_on_delivery =
                                              admin_profit_mode_on_delivery;
                                            order_payment.admin_profit_value_on_delivery =
                                              admin_profit_value_on_delivery;
                                            order_payment.total_admin_profit_on_delivery =
                                              total_admin_profit_on_delivery;
                                            order_payment.total_provider_income =
                                              total_provider_income;
                                            order_payment.admin_profit_mode_on_store =
                                              admin_profit_mode_on_store;
                                            order_payment.admin_profit_value_on_store =
                                              admin_profit_value_on_store;
                                            order_payment.total_admin_profit_on_store =
                                              total_admin_profit_on_store;
                                            order_payment.total_store_income =
                                              total_store_income;
                                            order_payment.total_distance =
                                              total_distance;
                                            order_payment.total_time =
                                              total_time;
                                            order_payment.is_distance_unit_mile =
                                              is_distance_unit_mile;
                                            order_payment.is_store_pay_delivery_fees =
                                              is_store_pay_delivery_fees;
                                            order_payment.total_service_price =
                                              total_service_price;
                                            order_payment.total_admin_tax_price =
                                              total_admin_tax_price;
                                            order_payment.total_after_tax_price =
                                              total_after_tax_price;
                                            order_payment.total_surge_price =
                                              total_surge_price;
                                            order_payment.total_delivery_price_after_surge =
                                              total_delivery_price_after_surge;
                                            order_payment.total_cart_price =
                                              total_cart_price;
                                            order_payment.total_delivery_price =
                                              total_delivery_price;
                                            order_payment.total_item_count =
                                              total_item_count;
                                            order_payment.service_tax =
                                              service_tax;
                                            order_payment.item_tax = item_tax;
                                            order_payment.total_store_tax_price =
                                              total_store_tax_price;
                                            order_payment.total_order_price =
                                              total_order_price;
                                            order_payment.promo_payment = 0;
                                            order_payment.user_pay_payment =
                                              user_pay_payment;
                                            order_payment.total = total;
                                            order_payment.wallet_payment = 0;
                                            order_payment.total_after_wallet_payment = 0;
                                            order_payment.cash_payment = 0;
                                            order_payment.card_payment = 0;
                                            order_payment.remaining_payment = 0;
                                            order_payment.delivered_at = null;
                                            order_payment.is_order_payment_status_set_by_store =
                                              is_order_payment_status_set_by_store;
                                            order_payment.is_user_pick_up_order =
                                              is_user_pick_up_order;
                                            order_payment.save().then(
                                              () => {
                                                response_data.json({
                                                  success: true,
                                                  message:
                                                    USER_MESSAGE_CODE.FARE_ESTIMATE_SUCCESSFULLY,
                                                  server_time: server_time,
                                                  timezone:
                                                    city_detail.timezone,
                                                  order_payment: order_payment,
                                                  vehicles: vehicle_data,
                                                });
                                              },
                                              (error) => {
                                                response_data.json({
                                                  success: false,
                                                  error_code:
                                                    ERROR_CODE.SOMETHING_WENT_WRONG,
                                                });
                                              }
                                            );
                                          } else {
                                            /* ENTRY IN ORDER PAYMENT */
                                            var order_payment =
                                              new Order_payment({
                                                cart_id: cart._id,
                                                store_id: null,
                                                user_id: cart.user_id,
                                                country_id: country_id,
                                                is_min_fare_applied:
                                                  is_min_fare_applied,
                                                city_id: city_id,
                                                delivery_price_used_type:
                                                  delivery_price_used_type,
                                                delivery_price_used_type_id:
                                                  delivery_price_used_type_id,
                                                currency_code:
                                                  wallet_currency_code,
                                                order_currency_code:
                                                  user.wallet_currency_code,
                                                current_rate: 1, // HERE current_rate MEANS ORDER TO ADMIN CONVERT RATE
                                                wallet_to_admin_current_rate: 1,
                                                wallet_to_order_current_rate: 1,
                                                total_distance: total_distance,
                                                total_time: total_time,
                                                service_tax: service_tax,
                                                item_tax: item_tax,
                                                total_service_price:
                                                  total_service_price,
                                                total_admin_tax_price:
                                                  total_admin_tax_price,
                                                total_delivery_price:
                                                  total_delivery_price,
                                                is_store_pay_delivery_fees:
                                                  is_store_pay_delivery_fees,
                                                total_item_count:
                                                  total_item_count,
                                                total_cart_price:
                                                  total_cart_price,
                                                total_store_tax_price:
                                                  total_store_tax_price,
                                                user_pay_payment:
                                                  user_pay_payment,
                                                total_order_price:
                                                  total_order_price,
                                                promo_payment: promo_payment,
                                                total: total,
                                                admin_profit_mode_on_store:
                                                  admin_profit_mode_on_store,
                                                admin_profit_value_on_store:
                                                  admin_profit_value_on_store,
                                                total_admin_profit_on_store:
                                                  total_admin_profit_on_store,
                                                total_store_income:
                                                  total_store_income,
                                                admin_profit_mode_on_delivery:
                                                  admin_profit_mode_on_delivery,
                                                admin_profit_value_on_delivery:
                                                  admin_profit_value_on_delivery,
                                                total_admin_profit_on_delivery:
                                                  total_admin_profit_on_delivery,
                                                total_provider_income:
                                                  total_provider_income,
                                                is_user_pick_up_order:
                                                  is_user_pick_up_order,
                                                is_order_payment_status_set_by_store:
                                                  is_order_payment_status_set_by_store,
                                                is_distance_unit_mile:
                                                  is_distance_unit_mile,
                                              });

                                            order_payment.save().then(
                                              () => {
                                                cart.order_payment_id =
                                                  order_payment._id;
                                                cart.save();
                                                response_data.json({
                                                  success: true,
                                                  message:
                                                    USER_MESSAGE_CODE.FARE_ESTIMATE_SUCCESSFULLY,
                                                  server_time: server_time,
                                                  timezone:
                                                    city_detail.timezone,
                                                  order_payment: order_payment,
                                                  vehicles: vehicle_data,
                                                });
                                              },
                                              (error) => {
                                                response_data.json({
                                                  success: false,
                                                  error_code:
                                                    ERROR_CODE.SOMETHING_WENT_WRONG,
                                                });
                                              }
                                            );
                                          }
                                        });
                                      });
                                    }
                                  );
                                } else {
                                  response_data.json({
                                    success: false,
                                    error_code:
                                      USER_ERROR_CODE.DELIVERY_SERVICE_NOT_AVAILABLE_IN_YOUR_CITY,
                                  });
                                }
                              },
                              (error) => {
                                response_data.json({
                                  success: false,
                                  error_code:
                                    USER_ERROR_CODE.DELIVERY_SERVICE_NOT_AVAILABLE_IN_YOUR_CITY,
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
                    },
                    (error) => {
                      response_data.json({
                        success: false,
                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                      });
                    }
                  );
                  //     } else {
                  //         response_data.json({success: false, error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND});
                  //     }

                  // }, (error) => {
                  //
                  //     response_data.json({
                  //         success: false,
                  //         error_code: ERROR_CODE.SOMETHING_WENT_WRONG
                  //     });
                  // });
                } else {
                  response_data.json({
                    success: false,
                    error_code: USER_ERROR_CODE.GET_ORDER_CART_INVOICE_FAILED,
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

            // } else {
            //     response_data.json({
            //         success: false,
            //         error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND
            //     });
            // }
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

// PAY ORDER PAYMENT
exports.pay_order_payment = function (request_data, response_data) {
  console.log("pay_order_payment: " + JSON.stringify(request_data.body));
  utils.check_request_params(
    request_data.body,
    [
      { name: "order_payment_id", type: "string" },
      { name: "is_payment_mode_cash" },
      { name: "card_id" },
    ],
    async function (response) {
      if (response.success) {
        var request_data_body = request_data.body;

        var is_payment_mode_cash = request_data_body.is_payment_mode_cash;
        var is_payment_mode_google_pay =
          request_data_body.is_payment_mode_google_pay;
        var is_payment_mode_online_payment =
          request_data_body.is_payment_mode_online_payment;
        var is_payment_mode_card_on_delivery =
          request_data_body.is_payment_mode_card_on_delivery;
        var order_type = Number(request_data_body.order_type);
        const user = await User.findOne({ _id: request_data_body.user_id });
        if (!user) {
          response_data.json({
            success: false,
            error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
          });
          return;
        }

        if (user.wallet < 0) {
          response_data.json({
            success: false,
            error_code: USER_ERROR_CODE.YOUR_WALLET_AMOUNT_NEGATIVE,
          });
          return;
        }
        const order_payment = await Order_payment.findOne({
          _id: request_data_body.order_payment_id,
        });
        if (!order_payment) {
          response_data.json({
            success: false,
            error_code: USER_ERROR_CODE.CHECK_PAYMENT_FAILED,
          });
          return;
        }
        const store = await Store.findOne({ _id: order_payment.store_id });
        // if(store && store.is_active && store.is_business){
        var query = {};
        if (store) {
          query = { _id: store.store_delivery_id };
        } else {
          query = {
            _id: request_data_body.store_delivery_id,
          };
        }

        const delivery_type = await Delivery.findOne(query);
        if (!delivery_type && !delivery_type.is_business) {
          response_data.json({
            success: false,
            error_code:
              USER_ERROR_CODE.DELIVERY_SERVICE_NOT_AVAILABLE_IN_YOUR_CITY,
          });
          return;
        }
        const country = await Country.findOne({
          _id: order_payment.country_id,
        });

        if (!country && !country.is_business) {
          response_data.json({
            success: false,
            error_code: COUNTRY_ERROR_CODE.BUSINESS_NOT_IN_YOUR_COUNTRY,
          });
          return;
        }
        // ORDER CREATED COUNTRY // ORDER CHARGE IN THIS COUNTRY CURRENCY
        var country_current_rate = country.currency_rate;

        var wallet_currency_code = user.wallet_currency_code;
        var admin_currency_code = "";
        var order_currency_code = order_payment.order_currency_code;

        var wallet_to_admin_current_rate = 1;
        var wallet_to_order_current_rate = 1;
        var current_rate = 1;
        const setting_detail = await Setting.findOne({});

        if (setting_detail) {
          admin_currency_code = setting_detail.admin_currency_code;
        } else {
          admin_currency_code = wallet_currency_code;
        }

        utils.getCurrencyConvertRate(
          1,
          wallet_currency_code,
          order_currency_code,
          async function (response) {
            if (response.success) {
              wallet_to_order_current_rate = response.current_rate;
            } else {
              wallet_to_order_current_rate = country_current_rate;
            }

            order_payment.wallet_to_order_current_rate =
              wallet_to_order_current_rate;

            utils.getCurrencyConvertRate(
              1,
              order_currency_code,
              admin_currency_code,
              async function (response) {
                if (response.success) {
                  current_rate = response.current_rate;
                } else {
                  current_rate = country_current_rate;
                }

                order_payment.current_rate = current_rate;

                if (wallet_currency_code == admin_currency_code) {
                  wallet_to_admin_current_rate = 1;
                } else {
                  wallet_to_admin_current_rate =
                    order_payment.wallet_to_order_current_rate *
                    order_payment.current_rate;
                }

                order_payment.wallet_to_admin_current_rate =
                  wallet_to_admin_current_rate;

                order_payment.admin_currency_code = admin_currency_code;
                order_payment.is_payment_mode_cash = is_payment_mode_cash;
                order_payment.is_payment_mode_card_on_delivery =
                  is_payment_mode_card_on_delivery;

                order_payment.total_saving = request_data_body.total_saving;
                user.total_saving =
                  user.total_saving + request_data_body.total_saving;
                if (is_payment_mode_cash) {
                  order_payment.yeep_earning = utils.precisionRoundTwo(
                    store.yeep_earninig_percent_for_cash *
                      order_payment.total *
                      0.01
                  );
                }
                if (is_payment_mode_card_on_delivery) {
                  order_payment.yeep_earning = utils.precisionRoundTwo(
                    store.yeep_earninig_percent_for_card *
                      order_payment.total *
                      0.01
                  );
                }
                if (is_payment_mode_online_payment) {
                  order_payment.yeep_earning = utils.precisionRoundTwo(
                    store.yeep_earninig_percent_for_online *
                      order_payment.total *
                      0.01
                  );
                }
                await order_payment.save();
                await user.save();
                var payment_id = request_data_body.payment_id;
                var user_id = request_data_body.user_id;
                var wallet_payment = 0;
                var total_after_wallet_payment = 0;
                var remaining_payment = 0;
                var user_wallet_amount = user.wallet;
                var total = order_payment.total;
                var is_store_pay_delivery_fees =
                  order_payment.is_store_pay_delivery_fees;
                var user_pay_payment = order_payment.user_pay_payment;
                // if (is_store_pay_delivery_fees) {
                //     user_pay_payment = user_pay_payment - order_payment.total_delivery_price;
                // }
                var is_payment_max = user.is_payment_max;
                if (
                  ["2", "4", "5", "6", 2, 4, 5, 6].includes(payment_id) &&
                  user.is_use_wallet &&
                  user_wallet_amount > 0
                ) {
                  user_wallet_amount =
                    user_wallet_amount * wallet_to_order_current_rate;
                  if (user_wallet_amount >= is_payment_max) {
                    wallet_payment = is_payment_max;
                    order_payment.is_paid_from_wallet = true;
                  } else {
                    wallet_payment = user_wallet_amount;
                  }
                  order_payment.wallet_payment = wallet_payment;
                  user_wallet_amount = user_wallet_amount - wallet_payment;
                } else {
                  order_payment.wallet_payment = 0;
                }

                total_after_wallet_payment = user_pay_payment - wallet_payment;
                total_after_wallet_payment = utils.precisionRoundTwo(
                  total_after_wallet_payment
                );
                order_payment.total_after_wallet_payment =
                  total_after_wallet_payment;

                remaining_payment = total_after_wallet_payment;
                order_payment.remaining_payment = remaining_payment;

                if (
                  !is_payment_mode_cash &&
                  !is_payment_mode_card_on_delivery
                ) {
                  order_payment.payment_id = payment_id;
                  if (is_payment_mode_online_payment) {
                    try {
                      var card = await Card.findOne({
                        _id: request_data_body.card_id,
                      });
                      if (card.is_card_verified && card.instrument_id) {
                        var is_card_verified = true;
                        order_payment.instrument_id = card.instrument_id;
                        await order_payment.save();
                        card.is_default = true;
                        await card.save();
                        console.log(
                          "verified card >>>>>" + JSON.stringify(card)
                        );
                      } else {
                        response_data.json({
                          success: false,
                          error: "invalid card details",
                        });
                      }
                    } catch (error) {
                      response_data.json({
                        success: false,
                        error_message: error.message,
                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                      });
                    }
                  }
                  if (is_payment_mode_google_pay) {
                    try {
                      var gpay_instrument = await new Promise((res, rej) => {
                        google_pay(
                          {
                            body: {
                              token_data: request_data_body.token_data,
                            },
                          },
                          {
                            json: function (data) {
                              res(data);
                            },
                          }
                        );
                      });
                      if (gpay_instrument.success) {
                        console.log(
                          "gpay_instrument.instrument.id :>> " +
                            gpay_instrument.instrument.id
                        );
                        order_payment.instrument_id =
                          gpay_instrument.instrument.id;
                        order_payment.is_payment_paid = true;
                        // order_payment.save();
                      } else {
                        response_data.json({
                          success: false,
                          error: gpay_instrument.error,
                        });
                        return;
                      }
                    } catch (error) {
                      response_data.json({
                        success: false,
                        error_message: error.message,
                        error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                      });

                      return;
                    }
                  }
                  if (order_payment.remaining_payment > 0) {
                    utils.pay_payment_for_selected_payment_gateway(
                      0,
                      user_id,
                      payment_id,
                      remaining_payment,
                      order_currency_code,
                      async function (payment_paid) {
                        if (payment_paid) {
                          order_payment.is_payment_paid = true;
                          order_payment.cash_payment = 0;
                          order_payment.card_payment =
                            order_payment.total_after_wallet_payment;
                          order_payment.remaining_payment = 0;
                        } else {
                          order_payment.is_payment_paid = false;
                          order_payment.cash_payment = 0;
                          order_payment.card_payment =
                            order_payment.total_after_wallet_payment;
                        }

                        if (
                          is_payment_mode_online_payment &&
                          is_card_verified
                        ) {
                          order_payment.is_payment_paid = true;
                          order_payment.is_payment_mode_online_payment =
                            is_payment_mode_online_payment;
                          await order_payment.save();
                        }
                        if (
                          is_payment_mode_google_pay &&
                          order_payment.instrument_id
                        ) {
                          order_payment.is_payment_paid = true;
                          order_payment.is_payment_mode_google_pay = true;
                        }
                        await order_payment.save();
                        if (
                          !order_payment.is_payment_paid &&
                          !is_payment_mode_online_payment
                        ) {
                          response_data.json({
                            success: false,
                            error_code:
                              USER_ERROR_CODE.YOUR_ORDER_PAYMENT_PENDING,
                          });
                          return;
                        }
                        if (wallet_payment > 0) {
                          var wallet_information = {
                            order_payment_id: order_payment._id,
                          };
                          var total_wallet_amount =
                            wallet_history.add_wallet_history(
                              ADMIN_DATA_ID.USER,
                              user.unique_id,
                              user._id,
                              user.country_id,
                              wallet_currency_code,
                              order_currency_code,
                              wallet_to_order_current_rate,
                              wallet_payment,
                              user.wallet,
                              WALLET_STATUS_ID.REMOVE_WALLET_AMOUNT,
                              WALLET_COMMENT_ID.ORDER_CHARGED,
                              "Order Charged",
                              wallet_information
                            );
                          user.wallet = total_wallet_amount;
                        }
                        user.save();
                        // 4 - partial wallet + cash
                        // 5 partial wallet + card on delivery
                        // 6 partial wallet + online payment

                        // CASH = "0";
                        // CARD_ON_DELIVERY = "1";
                        // WALLET = "2";
                        // ONLINE_PAYMENT = "3";

                        // CASH_WALLET = "4";
                        // CARD_WALLET = "5";
                        // ONLINE_WALLET = "6";
                        if (
                          ["4", "5", "6", 4, 5, 6].includes(
                            request_data_body.payment_id
                          )
                        ) {
                          order_payment.user_pay_payment =
                            request_data_body.amount;
                          order_payment.save();
                        }
                        response_data.json({
                          success: true,
                          message: USER_MESSAGE_CODE.ORDER_PAYMENT_SUCCESSFULLY,
                          is_payment_paid: order_payment.is_payment_paid,
                          payment_info: card,
                        });

                        if (setting_detail.is_mail_notification) {
                          emails.sendUserOrderPaymentPaidEmail(
                            request_data,
                            user,
                            order_currency_code + remaining_payment
                          );
                        }
                      }
                    );
                  } else {
                    order_payment.is_payment_paid = true;
                    order_payment.card_payment = 0;
                    await order_payment.save();
                    if (wallet_payment > 0) {
                      var wallet_information = {
                        order_payment_id: order_payment._id,
                      };
                      var total_wallet_amount =
                        wallet_history.add_wallet_history(
                          ADMIN_DATA_ID.USER,
                          user.unique_id,
                          user._id,
                          user.country_id,
                          wallet_currency_code,
                          order_currency_code,
                          wallet_to_order_current_rate,
                          wallet_payment,
                          user.wallet,
                          WALLET_STATUS_ID.REMOVE_WALLET_AMOUNT,
                          WALLET_COMMENT_ID.ORDER_CHARGED,
                          "Order Charged",
                          wallet_information
                        );

                      user.wallet = total_wallet_amount;
                    }
                    user.save();
                    if (setting_detail.is_mail_notification) {
                      emails.sendUserOrderPaymentPaidEmail(
                        request_data,
                        user,
                        order_currency_code + order_payment.total
                      );
                    }
                    // 4 - partial wallet + cash
                    // 5 partial wallet + card on delivery
                    // 6 partial wallet + online payment
                    if (
                      ["4", "5", "6", 4, 5, 6].includes(
                        request_data_body.payment_id
                      )
                    ) {
                      order_payment.user_pay_payment = request_data_body.amount;
                      order_payment.save();
                    }
                    response_data.json({
                      success: true,
                      message: USER_MESSAGE_CODE.ORDER_PAYMENT_SUCCESSFULLY,
                      is_payment_paid: order_payment.is_payment_paid,
                    });
                  }
                } else {
                  order_payment.is_payment_paid = true;
                  order_payment.remaining_payment = 0;
                  order_payment.card_payment = 0;
                  order_payment.cash_payment =
                    order_payment.total_after_wallet_payment;

                  await order_payment.save();
                  if (wallet_payment > 0) {
                    var wallet_information = {
                      order_payment_id: order_payment._id,
                    };
                    var total_wallet_amount = wallet_history.add_wallet_history(
                      ADMIN_DATA_ID.USER,
                      user.unique_id,
                      user._id,
                      user.country_id,
                      wallet_currency_code,
                      order_currency_code,
                      wallet_to_order_current_rate,
                      wallet_payment,
                      user.wallet,
                      WALLET_STATUS_ID.REMOVE_WALLET_AMOUNT,
                      WALLET_COMMENT_ID.ORDER_CHARGED,
                      "Order Charged",
                      wallet_information
                    );

                    user.wallet = total_wallet_amount;
                  }
                  user.save();
                  if (order_type == ADMIN_DATA_ID.USER) {
                    if (setting_detail.is_mail_notification) {
                      emails.sendUserOrderPaymentPaidEmail(
                        request_data,
                        user,
                        order_currency_code +
                          order_payment.total_after_wallet_payment
                      );
                    }
                  }
                  // 4 - partial wallet + cash
                  // 5 partial wallet + card on delivery
                  // 6 partial wallet + online payment
                  if (
                    ["4", "5", "6", 4, 5, 6].includes(
                      request_data_body.payment_id
                    )
                  ) {
                    order_payment.user_pay_payment = request_data_body.amount;
                    order_payment.save();
                  }
                  response_data.json({
                    success: true,
                    message: USER_MESSAGE_CODE.ORDER_PAYMENT_SUCCESSFULLY,
                    is_payment_paid: order_payment.is_payment_paid,
                  });
                }
              }
            );
          }
        );
      } else {
        response_data.json(response);
      }
    }
  );
};

// USER HISTORY DETAILS
exports.order_history_detail = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "order_id", type: "string" }],
    function (response) {
      if (response.success) {
        console.log(
          "order history detail api body >>>" +
            JSON.stringify(request_data.body)
        );
        var request_data_body = request_data.body;
        User.findOne({ _id: request_data_body.user_id }).then(
          (user_detail) => {
            if (user_detail) {
              Order.findOne({ _id: request_data_body.order_id }).then(
                (order_detail) => {
                  if (order_detail) {
                    var country_id = order_detail.country_id;

                    Store.findOne({ _id: order_detail.store_id }).then(
                      (store_data) => {
                        Country.findOne({ _id: country_id }).then(
                          (country) => {
                            var currency = "";
                            if (country) {
                              currency = country.currency_sign;
                            }
                            var current_provider = null;
                            Request.findOne({
                              _id: order_detail.request_id,
                            }).then(
                              (request_data) => {
                                if (request_data) {
                                  current_provider =
                                    request_data.current_provider;
                                }
                                Provider.findOne({
                                  _id: current_provider,
                                }).then(
                                  (provider_data) => {
                                    Order_payment.findOne({
                                      _id: order_detail.order_payment_id,
                                    }).then(
                                      (order_payment) => {
                                        var provider_detail = {};
                                        var store_detail = {};
                                        var payment_gateway_name = "Cash";
                                        let mode = "Cash";
                                        if (
                                          order_payment.is_payment_mode_cash ==
                                          false
                                        ) {
                                          switch (true) {
                                            case order_detail.is_payment_mode_card_on_delivery:
                                              mode = "Card on Delivery";
                                              break;
                                            case order_detail.is_paid_from_wallet:
                                              mode = "Wallet";
                                              break;
                                          }
                                          payment_gateway_name = mode;
                                        }
                                        switch (order_payment.payment_id) {
                                          case "1":
                                            payment_gateway_name =
                                              "card on delivery";
                                          case "2":
                                            payment_gateway_name =
                                              "wallet payment";
                                          case "3":
                                            payment_gateway_name =
                                              "online payment";
                                          case "4":
                                            payment_gateway_name =
                                              "cash & wallet payment";
                                          case "5":
                                            payment_gateway_name =
                                              "card & wallet payment";
                                          case "6":
                                            payment_gateway_name =
                                              "online & wallet payment";
                                        }
                                        if (
                                          order_payment.is_payment_mode_card_on_delivery
                                        ) {
                                          payment_gateway_name =
                                            "Card on Delivery";
                                        }
                                        if (
                                          order_payment.is_payment_mode_online_payment
                                        ) {
                                          payment_gateway_name = "Online";
                                        }
                                        if (store_data) {
                                          store_detail = {
                                            name: store_data.name,
                                            image_url: store_data.image_url,
                                            min_order_price:
                                              store_data.min_order_price,
                                            store_delivery_id:
                                              store_data.store_delivery_id,
                                          };
                                        }

                                        if (provider_data) {
                                          provider_detail = {
                                            first_name:
                                              provider_data.first_name,
                                            last_name: provider_data.last_name,
                                            image_url: provider_data.image_url,
                                          };
                                        }

                                        var order_payment_query = {
                                          $lookup: {
                                            from: "order_payments",
                                            localField: "order_payment_id",
                                            foreignField: "_id",
                                            as: "order_payment_detail",
                                          },
                                        };
                                        var array_to_json_order_payment = {
                                          $unwind: "$order_payment_detail",
                                        };

                                        var cart_query = {
                                          $lookup: {
                                            from: "carts",
                                            localField: "cart_id",
                                            foreignField: "_id",
                                            as: "cart_detail",
                                          },
                                        };

                                        var array_to_json_cart_query = {
                                          $unwind: "$cart_detail",
                                        };

                                        var user_condition = {
                                          $match: {
                                            user_id: {
                                              $eq: mongoose.Types.ObjectId(
                                                request_data_body.user_id
                                              ),
                                            },
                                          },
                                        };
                                        var order_condition = {
                                          $match: {
                                            _id: {
                                              $eq: mongoose.Types.ObjectId(
                                                request_data_body.order_id
                                              ),
                                            },
                                          },
                                        };

                                        var order_status_condition = {
                                          $match: {
                                            $or: [
                                              {
                                                order_status: {
                                                  $eq: ORDER_STATE.STORE_REJECTED,
                                                },
                                              },
                                              {
                                                order_status: {
                                                  $eq: ORDER_STATE.CANCELED_BY_USER,
                                                },
                                              },
                                              {
                                                order_status: {
                                                  $eq: ORDER_STATE.STORE_CANCELLED,
                                                },
                                              },
                                              {
                                                order_status: {
                                                  $eq: ORDER_STATE.ORDER_COMPLETED,
                                                },
                                              },
                                            ],
                                          },
                                        };

                                        var order_status_id_condition = {
                                          $match: {
                                            $or: [
                                              {
                                                order_status_id: {
                                                  $eq: ORDER_STATUS_ID.CANCELLED,
                                                },
                                              },
                                              {
                                                order_status_id: {
                                                  $eq: ORDER_STATUS_ID.REJECTED,
                                                },
                                              },
                                              {
                                                order_status_id: {
                                                  $eq: ORDER_STATUS_ID.COMPLETED,
                                                },
                                              },
                                            ],
                                          },
                                        };

                                        Order.aggregate([
                                          order_condition,
                                          user_condition,
                                          order_status_condition,
                                          order_status_id_condition,
                                          order_payment_query,
                                          cart_query,
                                          array_to_json_order_payment,
                                          array_to_json_cart_query,
                                        ]).then(
                                          (orders) => {
                                            orders &&
                                              console.log(
                                                "====orders--length" +
                                                  orders.length
                                              );
                                            if (orders.length == 0) {
                                              response_data.json({
                                                success: false,
                                                error_code:
                                                  USER_ERROR_CODE.ORDER_DETAIL_NOT_FOUND,
                                              });
                                            } else {
                                              response_data.json({
                                                success: true,
                                                message:
                                                  USER_MESSAGE_CODE.GET_USER_ORDER_DETAIL_SUCCESSFULLY,
                                                currency: currency,
                                                checkout_amount:
                                                  order_payment.checkout_amount,
                                                store_detail: store_detail,
                                                provider_detail:
                                                  provider_detail,
                                                payment_gateway_name:
                                                  payment_gateway_name,
                                                order_list: orders[0],
                                              });
                                            }
                                          },
                                          (error) => {
                                            response_data.json({
                                              success: false,
                                              error_code:
                                                ERROR_CODE.SOMETHING_WENT_WRONG,
                                            });
                                          }
                                        );
                                      },
                                      (error) => {
                                        response_data.json({
                                          success: false,
                                          error_code:
                                            ERROR_CODE.SOMETHING_WENT_WRONG,
                                        });
                                      }
                                    );
                                  },
                                  (error) => {
                                    response_data.json({
                                      success: false,
                                      error_code:
                                        ERROR_CODE.SOMETHING_WENT_WRONG,
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
                  } else {
                    response_data.json({
                      success: false,
                      error_code: STORE_ERROR_CODE.ORDER_DETAIL_NOT_FOUND,
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
                error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
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
// USER HISTORY LIST
exports.order_history = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [
      { name: "start_date", type: "string" },
      { name: "end_date", type: "string" },
    ],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        User.findOne({ _id: request_data_body.user_id }).then(
          (user_detail) => {
            if (user_detail) {
              var start_date = null,
                end_date = null;

              if (request_data_body.start_date == "") {
                start_date = new Date(0);
              } else {
                start_date = request_data_body.start_date;
              }

              if (request_data_body.end_date == "") {
                end_date = new Date();
              } else {
                end_date = request_data_body.end_date;
              }

              start_date = new Date(start_date);
              start_date = start_date.setHours(0, 0, 0, 0);
              start_date = new Date(start_date);

              end_date = new Date(end_date);
              end_date = end_date.setHours(23, 59, 59, 999);
              end_date = new Date(end_date);

              var user_condition = {
                $match: {
                  user_id: {
                    $eq: mongoose.Types.ObjectId(request_data_body.user_id),
                  },
                },
              };
              var order_status_condition = {
                $match: {
                  $or: [
                    {
                      order_status: ORDER_STATE.ORDER_COMPLETED,
                      is_user_show_invoice: true,
                    },
                    { order_status: ORDER_STATE.STORE_CANCELLED },
                    { order_status: ORDER_STATE.CANCELED_BY_USER },
                    { order_status: ORDER_STATE.STORE_REJECTED },
                  ],
                },
              };

              var filter = {
                $match: {
                  completed_date_in_city_timezone: {
                    $gte: start_date,
                    $lt: end_date,
                  },
                },
              };

              Order.aggregate([
                user_condition,
                order_status_condition,
                // filter,
                {
                  $lookup: {
                    from: "stores",
                    localField: "store_id",
                    foreignField: "_id",
                    as: "store_detail",
                  },
                },
                {
                  $unwind: {
                    path: "$store_detail",
                    preserveNullAndEmptyArrays: true,
                  },
                },

                {
                  $lookup: {
                    from: "cities",
                    localField: "city_id",
                    foreignField: "_id",
                    as: "city_detail",
                  },
                },
                { $unwind: "$city_detail" },

                {
                  $lookup: {
                    from: "countries",
                    localField: "city_detail.country_id",
                    foreignField: "_id",
                    as: "country_detail",
                  },
                },
                { $unwind: "$country_detail" },
                {
                  $lookup: {
                    from: "requests",
                    localField: "request_id",
                    foreignField: "_id",
                    as: "request_detail",
                  },
                },
                {
                  $unwind: {
                    path: "$request_detail",
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $lookup: {
                    from: "order_payments",
                    localField: "order_payment_id",
                    foreignField: "_id",
                    as: "order_payment_detail",
                  },
                },
                { $unwind: "$order_payment_detail" },
                {
                  $project: {
                    created_at: "$created_at",
                    order_status: "$order_status",
                    order_status_id: "$order_status_id",
                    completed_at: "$completed_at",
                    is_ramadan_order: "$is_ramadan_order",
                    unique_id: "$unique_id",
                    total: "$order_payment_detail.total",
                    refund_amount: "$order_payment_detail.refund_amount",
                    total_service_price:
                      "$order_payment_detail.total_service_price",
                    total_order_price:
                      "$order_payment_detail.total_order_price",
                    currency: "$country_detail.currency_sign",
                    user_pay_payment: "$order_payment_detail.user_pay_payment",
                    checkout_amount: "$order_payment_detail.checkout_amount",
                    delivery_type: "$delivery_type",
                    image_url: "$image_url",
                    request_detail: {
                      created_at: "$request_detail.created_at",
                      request_unique_id: "$request_detail.unique_id",
                      delivery_status: "$request_detail.delivery_status",
                      delivery_status_manage_id:
                        "$request_detail.delivery_status_manage_id",
                    },
                    store_detail: {
                      _id: "$store_detail._id",
                      name: {
                        $cond: ["$store_detail", "$store_detail.name", ""],
                      },
                      min_order_price: {
                        $cond: [
                          "$store_detail",
                          "$store_detail.min_order_price",
                          "",
                        ],
                      },
                      image_url: {
                        $cond: ["$store_detail", "$store_detail.image_url", ""],
                      },
                    },
                  },
                },
              ]).then(
                (orders) => {
                  if (orders.length == 0) {
                    response_data.json({
                      success: false,
                      error_code: USER_ERROR_CODE.ORDER_HISTORY_NOT_FOUND,
                    });
                  } else {
                    response_data.json({
                      success: true,
                      message: USER_MESSAGE_CODE.ORDER_HISTORY_SUCCESSFULLY,
                      order_list: orders,
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
                error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
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

exports.bill_payment_history = async (req, res) => {
  const { user_id, server_token } = req.body;
  if (!server_token || !user_id) {
    res.json({
      success: false,
      error_message: "No Records Found",
    });
    return;
  }
  const user_detail = await User.findOne({ _id: user_id });

  if (!user_detail) {
    res.json({
      success: false,
      error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
    });
    return;
  }

  const user_condition = {
    $match: {
      store_id: {
        $eq: mongoose.Types.ObjectId("61ade5310cee435b6af6106b"),
      },
      user_id: {
        $eq: mongoose.Types.ObjectId(user_id),
      },
    },
  };
  const order_status_condition = {
    $match: {
      $or: [
        {
          order_status: ORDER_STATE.ORDER_COMPLETED,
        },
        { order_status: ORDER_STATE.STORE_CANCELLED },
        { order_status: ORDER_STATE.CANCELED_BY_USER },
        { order_status: ORDER_STATE.STORE_REJECTED },
      ],
    },
  };

  const pipelines = [
    user_condition,
    order_status_condition,
    // filter,
    {
      $lookup: {
        from: "stores",
        localField: "store_id",
        foreignField: "_id",
        as: "store_detail",
      },
    },
    {
      $unwind: {
        path: "$store_detail",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: "cities",
        localField: "city_id",
        foreignField: "_id",
        as: "city_detail",
      },
    },
    { $unwind: "$city_detail" },

    {
      $lookup: {
        from: "countries",
        localField: "city_detail.country_id",
        foreignField: "_id",
        as: "country_detail",
      },
    },
    { $unwind: "$country_detail" },
    {
      $lookup: {
        from: "requests",
        localField: "request_id",
        foreignField: "_id",
        as: "request_detail",
      },
    },
    {
      $unwind: {
        path: "$request_detail",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "order_payments",
        localField: "order_payment_id",
        foreignField: "_id",
        as: "order_payment_detail",
      },
    },
    {
      $lookup: {
        from: "carts",
        localField: "cart_id",
        foreignField: "_id",
        as: "cart_detail",
      },
    },
    { $unwind: "$cart_detail" },
    { $unwind: "$order_payment_detail" },
    {
      $project: {
        created_at: "$created_at",
        order_status: "$order_status",
        order_status_id: "$order_status_id",
        completed_at: "$completed_at",
        is_ramadan_order: "$is_ramadan_order",
        unique_id: "$unique_id",
        total: "$order_payment_detail.total",
        refund_amount: "$order_payment_detail.refund_amount",
        total_service_price: "$order_payment_detail.total_service_price",
        total_order_price: "$order_payment_detail.total_order_price",
        currency: "$country_detail.currency_sign",
        user_pay_payment: "$order_payment_detail.user_pay_payment",
        checkout_amount: "$order_payment_detail.checkout_amount",
        delivery_type: "$delivery_type",
        image_url: "$image_url",
        request_detail: {
          created_at: "$request_detail.created_at",
          request_unique_id: "$request_detail.unique_id",
          delivery_status: "$request_detail.delivery_status",
          delivery_status_manage_id:
            "$request_detail.delivery_status_manage_id",
        },
        store_detail: {
          _id: "$store_detail._id",
          name: {
            $cond: ["$store_detail", "$store_detail.name", ""],
          },
          min_order_price: {
            $cond: ["$store_detail", "$store_detail.min_order_price", ""],
          },
          image_url: {
            $cond: ["$store_detail", "$store_detail.image_url", ""],
          },
        },
        cart_detail: {
          SkuCode: {
            $first: {
              $first: "$cart_detail.order_details.items.SkuCode",
            },
          },
          SendValue: {
            $first: {
              $first: "$cart_detail.order_details.items.SendValue",
            },
          },
          AccountNumber: {
            $first: {
              $first: "$cart_detail.order_details.items.AccountNumber",
            },
          },
          SendCurrencyIso: {
            $first: {
              $first: "$cart_detail.order_details.items.SendCurrencyIso",
            },
          },
          image_url: {
            $first: {
              $first: "$cart_detail.order_details.items.image_url",
            },
          },
          details: {
            $first: {
              $first: "$cart_detail.order_details.items.details",
            },
          },
        },
      },
    },
  ];

  const orders = await Order.aggregate(pipelines);
  if (orders.length == 0) {
    res.json({
      success: false,
      error_code: USER_ERROR_CODE.ORDER_HISTORY_NOT_FOUND,
    });
  } else {
    res.json({
      success: true,
      message: USER_MESSAGE_CODE.ORDER_HISTORY_SUCCESSFULLY,
      order_list: orders,
    });
  }
};

//USER RATE TO PROVIDER
exports.user_rating_to_provider = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [
      { name: "order_id", type: "string" },
      { name: "user_rating_to_provider" },
      { name: "user_review_to_provider" },
    ],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        User.findOne({ _id: request_data_body.user_id }).then(
          (user_detail) => {
            if (user_detail) {
              Order.findOne({ _id: request_data_body.order_id }).then(
                (order) => {
                  if (order) {
                    Review.findOne({ order_id: order._id }).then(
                      (review) => {
                        if (review) {
                          var order_status = order.order_status;
                          if (order_status == ORDER_STATE.ORDER_COMPLETED) {
                            Request.findOne({ _id: order.request_id }).then(
                              (request) => {
                                Provider.findOne({
                                  _id: request.provider_id,
                                }).then(
                                  (provider) => {
                                    if (provider) {
                                      var user_rating_to_provider =
                                        request_data_body.user_rating_to_provider;
                                      review.user_rating_to_provider =
                                        user_rating_to_provider;
                                      review.user_review_to_provider =
                                        request_data_body.user_review_to_provider;

                                      var old_rate = provider.user_rate;
                                      var old_rate_count =
                                        provider.user_rate_count;
                                      var new_rate_counter = old_rate_count + 1;
                                      var new_rate =
                                        (old_rate * old_rate_count +
                                          user_rating_to_provider) /
                                        new_rate_counter;
                                      new_rate = utils.precisionRoundTwo(
                                        Number(new_rate)
                                      );
                                      provider.user_rate = new_rate;
                                      provider.user_rate_count =
                                        provider.user_rate_count + 1;
                                      order.is_user_rated_to_provider = true;
                                      order.save().then(
                                        () => {
                                          provider.save();
                                          review.save();
                                          response_data.json({
                                            success: true,
                                            message:
                                              USER_MESSAGE_CODE.GIVE_RATING_TO_PROVIDER_SUCCESSFULLY,
                                          });
                                        },
                                        (error) => {
                                          response_data.json({
                                            success: false,
                                            error_code:
                                              ERROR_CODE.SOMETHING_WENT_WRONG,
                                          });
                                        }
                                      );
                                    }
                                  },
                                  (error) => {
                                    response_data.json({
                                      success: false,
                                      error_code:
                                        ERROR_CODE.SOMETHING_WENT_WRONG,
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
                          } else {
                            response_data.json({
                              success: false,
                              error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                            });
                          }
                        } else {
                          response_data.json({
                            success: false,
                            error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
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
                error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
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

// USER RATE TO STORE
exports.user_rating_to_store = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [
      { name: "order_id", type: "string" },
      { name: "user_rating_to_store" },
      { name: "user_review_to_store" },
      { name: "user_delivery_experience_rating_to_store" },
      { name: "user_product_quality_rating_to_store" },
    ],

    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        console.log(
          "--user_rating_to_store--" + JSON.stringify(request_data_body)
        );
        User.findOne({ _id: request_data_body.user_id }).then(
          (user_detail) => {
            if (user_detail) {
              Order.findOne({ _id: request_data_body.order_id }).then(
                async (order) => {
                  if (order) {
                    let review = await Review.findOne({
                      order_id: order._id,
                    });
                    if (!review) {
                      review = await Review.create({
                        order_id: order._id,
                      });
                    }

                    if (review) {
                      var order_status = order.order_status;
                      if (order_status == ORDER_STATE.ORDER_COMPLETED) {
                        Store.findOne({ _id: order.store_id }).then(
                          (store) => {
                            if (store) {
                              var user_rating_to_store =
                                request_data_body.user_rating_to_store;
                              review.user_rating_to_store =
                                user_rating_to_store;
                              review.user_review_to_store =
                                request_data_body.user_review_to_store;
                              var user_delivery_experience_rating_to_store =
                                request_data_body.user_delivery_experience_rating_to_store;

                              console.log(
                                user_delivery_experience_rating_to_store
                              );
                              review.user_delivery_experience_rating_to_store =
                                user_delivery_experience_rating_to_store;
                              var user_product_quality_rating_to_store =
                                request_data_body.user_product_quality_rating_to_store;
                              review.user_product_quality_rating_to_store =
                                user_product_quality_rating_to_store;
                              var old_rate = store.user_rate;
                              var old_rate_count = store.user_rate_count;
                              var new_rate_counter = old_rate_count + 1;
                              var new_rate =
                                (old_rate * old_rate_count +
                                  user_rating_to_store) /
                                new_rate_counter;
                              new_rate = utils.precisionRoundTwo(
                                Number(new_rate)
                              );
                              store.user_rate = new_rate;
                              store.user_rate_count = store.user_rate_count + 1;
                              order.is_user_rated_to_store = true;
                              order.save().then(
                                () => {
                                  store.save();
                                  review.save();
                                  response_data.json({
                                    success: true,
                                    message:
                                      USER_MESSAGE_CODE.GIVE_RATING_TO_STORE_SUCCESSFULLY,
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
                          error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                        });
                      }
                    } else {
                      response_data.json({
                        success: false,
                        error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                      });
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
            } else {
              response_data.json({
                success: false,
                error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
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

// GET INVOICE
exports.get_invoice = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "order_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        User.findOne({ _id: request_data_body.user_id }).then(
          (user) => {
            if (user) {
              Order.findOne({ _id: request_data_body.order_id }).then(
                (order_detail) => {
                  if (order_detail) {
                    Country.findOne({ _id: order_detail.country_id }).then(
                      (country) => {
                        var currency = "";
                        if (country) {
                          currency = country.currency_sign;
                        }

                        Order_payment.findOne({
                          _id: order_detail.order_payment_id,
                        }).then(
                          (order_payment_detail) => {
                            if (order_payment_detail) {
                              var current_provider = null;
                              Request.findOne({
                                _id: order_detail.request_id,
                              }).then(
                                (request) => {
                                  if (request) {
                                    current_provider = request.current_provider;
                                  }
                                  Provider.findOne({
                                    _id: current_provider,
                                  }).then((provider_data) => {
                                    var provider_detail = {};
                                    if (provider_data) {
                                      provider_detail = provider_data;
                                    }

                                    Payment_gateway.findOne({
                                      _id: order_payment_detail.payment_id,
                                    }).then(
                                      (payment_gateway) => {
                                        var payment_gateway_name = "Cash";
                                        if (
                                          !order_payment_detail.is_payment_mode_cash
                                        ) {
                                          payment_gateway_name =
                                            payment_gateway.name;
                                        }

                                        response_data.json({
                                          success: true,
                                          message:
                                            USER_MESSAGE_CODE.GET_INVOICE_SUCCESSFULLY,
                                          payment_gateway_name:
                                            payment_gateway_name,
                                          currency: currency,
                                          provider_detail: provider_detail,
                                          order_detail: order_detail,
                                          order_payment: order_payment_detail,
                                        });
                                      },
                                      (error) => {
                                        response_data.json({
                                          success: false,
                                          error_code:
                                            ERROR_CODE.SOMETHING_WENT_WRONG,
                                        });
                                      }
                                    );
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
                                error_code: USER_ERROR_CODE.INVOICE_NOT_FOUND,
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
                      error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
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

// Add_favourite_store
exports.add_favourite_store = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "store_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var store_id = request_data_body.store_id;
        User.findOne({ _id: request_data_body.user_id }).then(
          (user_detail) => {
            if (user_detail) {
              var favourite_stores = user_detail.favourite_stores;
              var index = favourite_stores.indexOf(store_id);
              if (index >= 0) {
                favourite_stores.splice(index, 1);
                user_detail.favourite_stores = favourite_stores;
              }

              favourite_stores.push(store_id);
              user_detail.favourite_stores = favourite_stores;
              user_detail.save().then(
                () => {
                  response_data.json({
                    success: true,
                    message: USER_MESSAGE_CODE.ADD_FAVOURITE_STORE_SUCCESSFULLY,
                    favourite_stores: user_detail.favourite_stores,
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
        response_data.json(response);
      }
    }
  );
};

// Remove_favourite_store
exports.remove_favourite_store = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "store_id" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        User.findOne({ _id: request_data_body.user_id }).then(
          (user_detail) => {
            if (user_detail) {
              var fav_store = request_data_body.store_id;
              var fav_store_list_size = 0;
              fav_store_list_size = fav_store.length;
              var fav_store_array = [];
              for (i = 0; i < fav_store_list_size; i++) {
                fav_store_array = user_detail.favourite_stores;
                fav_store_array.splice(
                  fav_store_array.indexOf(fav_store[i]),
                  1
                );
                user_detail.favourite_stores = fav_store_array;
              }

              user_detail.save().then(
                () => {
                  response_data.json({
                    success: true,
                    message:
                      USER_MESSAGE_CODE.DELETE_FAVOURITE_STORE_SUCCESSFULLY,
                    favourite_stores: user_detail.favourite_stores,
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
        response_data.json(response);
      }
    }
  );
};

// user get_order_detail

exports.get_order_detail = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "order_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        User.findOne({ _id: request_data_body.user_id }).then(
          (user_detail) => {
            if (user_detail) {
              var order_condition = {
                $match: {
                  _id: {
                    $eq: mongoose.Types.ObjectId(request_data_body.order_id),
                  },
                },
              };

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

              var country_query = {
                $lookup: {
                  from: "countries",
                  localField: "order_payment_detail.country_id",
                  foreignField: "_id",
                  as: "country_detail",
                },
              };

              var array_to_json_country_query = {
                $unwind: "$country_detail",
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
              var cart_query = {
                $lookup: {
                  from: "carts",
                  localField: "cart_id",
                  foreignField: "_id",
                  as: "cart_detail",
                },
              };

              var array_to_json_cart_query = { $unwind: "$cart_detail" };

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
                  localField: "request_detail.provider_id",
                  foreignField: "_id",
                  as: "provider_detail",
                },
              };

              Order.aggregate([
                order_condition,
                order_payment_query,
                cart_query,
                request_query,
                store_query,
                array_to_json_store_detail,
                array_to_json_request_query,
                provider_query,
                array_to_json_cart_query,
                array_to_json_order_payment_query,
                country_query,
                array_to_json_country_query,
                payment_gateway_query,
              ]).then(
                (order) => {
                  if (order.length === 0) {
                    response_data.json({
                      success: false,
                      error_code: ORDER_ERROR_CODE.ORDER_NOT_FOUND,
                      pages: 0,
                    });
                  } else {
                    response_data.json({
                      success: true,
                      message: ORDER_MESSAGE_CODE.GET_ORDER_DATA_SUCCESSFULLY,
                      is_confirmation_code_required_at_complete_delivery:
                        setting_detail.is_confirmation_code_required_at_complete_delivery,
                      order: order[0],
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
                error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
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

////get_favourite_store_list
exports.get_favourite_store_list = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      console.log(
        "get_favourite_store_list: " + JSON.stringify(request_data_body)
      );
      User.findOne({ _id: request_data_body.user_id }).then(
        (user_detail) => {
          if (user_detail) {
            var store_id_condition = {
              $match: { _id: { $in: user_detail.favourite_stores } },
            };
            var store_approve_condition = {
              $match: { is_approved: { $eq: true } },
            };
            var city_lookup = {
              $lookup: {
                from: "cities",
                localField: "city_id",
                foreignField: "_id",
                as: "city_detail",
              },
            };
            var array_to_json_city_detail = { $unwind: "$city_detail" };

            var country_lookup = {
              $lookup: {
                from: "countries",
                localField: "country_id",
                foreignField: "_id",
                as: "country_detail",
              },
            };
            var array_to_json_country_detail = { $unwind: "$country_detail" };
            var server_time = new Date(moment(new Date()).utc().valueOf());
            Store.aggregate([
              store_id_condition,
              store_approve_condition,
              city_lookup,
              array_to_json_city_detail,
              country_lookup,
              array_to_json_country_detail,
            ]).then(
              (stores) => {
                if (stores.length == 0) {
                  response_data.json({
                    success: false,
                    error_code: USER_ERROR_CODE.FAVOURITE_STORE_LIST_NOT_FOUND,
                  });
                } else {
                  response_data.json({
                    success: true,
                    message:
                      USER_MESSAGE_CODE.GET_FAVOURITE_STORE_LIST_SUCCESSFULLY,
                    server_time: server_time,
                    favourite_stores: stores,
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
              error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
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

//user_get_store_review_list
exports.user_get_store_review_list = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "store_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        Store.findOne({ _id: request_data_body.store_id }).then(
          (store) => {
            if (store) {
              var store_review_list = [];
              var remaining_review_list = [];

              var store_condition = {
                $match: {
                  store_id: {
                    $eq: mongoose.Types.ObjectId(request_data_body.store_id),
                  },
                },
              };
              var review_condition = {
                $match: { user_rating_to_store: { $gt: 0 } },
              };
              Review.aggregate([
                store_condition,
                review_condition,
                {
                  $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user_detail",
                  },
                },
                { $unwind: "$user_detail" },

                {
                  $project: {
                    id_of_users_like_store_comment:
                      "$id_of_users_like_store_comment",
                    id_of_users_dislike_store_comment:
                      "$id_of_users_dislike_store_comment",
                    user_rating_to_store: "$user_rating_to_store",
                    user_review_to_store: "$user_review_to_store",
                    created_at: "$created_at",
                    order_unique_id: "$order_unique_id",
                    user_detail: {
                      first_name: "$user_detail.first_name",
                      last_name: "$user_detail.last_name",
                      image_url: "$user_detail.image_url",
                    },
                  },
                },
              ]).then(
                (store_review) => {
                  if (store_review.length > 0) {
                    store_review_list = store_review;
                  }

                  Review.find(
                    {
                      user_id: request_data_body.user_id,
                      store_id: request_data_body.store_id,
                      user_rating_to_store: 0,
                    },
                    { order_unique_id: 1, order_id: 1 }
                  ).then(
                    (remaining_store_review) => {
                      if (remaining_store_review.length > 0) {
                        remaining_review_list = remaining_store_review;
                      }
                      response_data.json({
                        success: true,
                        message:
                          USER_MESSAGE_CODE.GET_STORE_REVIEW_LIST_SUCCESSFULLY,
                        store_avg_review: store.user_rate,
                        store_review_list: store_review_list,
                        remaining_review_list: remaining_review_list,
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
      } else {
        response_data.json(response);
      }
    }
  );
};

// user_like_dislike_store_review
exports.user_like_dislike_store_review = function (
  request_data,
  response_data
) {
  utils.check_request_params(
    request_data.body,
    [{ name: "review_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        User.findOne({ _id: request_data_body.user_id }).then(
          (user_detail) => {
            if (user_detail) {
              Review.findOne({ _id: request_data_body.review_id }).then(
                (review_detail) => {
                  if (review_detail) {
                    var is_user_clicked_like_store_review = Boolean(
                      request_data_body.is_user_clicked_like_store_review
                    );
                    var is_user_clicked_dislike_store_review = Boolean(
                      request_data_body.is_user_clicked_dislike_store_review
                    );
                    var id_of_users_like_store_comment =
                      review_detail.id_of_users_like_store_comment;
                    var id_of_users_dislike_store_comment =
                      review_detail.id_of_users_dislike_store_comment;

                    if (is_user_clicked_like_store_review == true) {
                      var index = id_of_users_like_store_comment.indexOf(
                        request_data_body.user_id
                      );
                      if (index < 0) {
                        id_of_users_like_store_comment.push(
                          request_data_body.user_id
                        );
                        review_detail.id_of_users_like_store_comment =
                          id_of_users_like_store_comment;
                      }
                    } else {
                      var index = id_of_users_like_store_comment.indexOf(
                        request_data_body.user_id
                      );
                      if (index >= 0) {
                        id_of_users_like_store_comment.splice(index, 1);
                        review_detail.id_of_users_like_store_comment =
                          id_of_users_like_store_comment;
                      }
                    }
                    if (is_user_clicked_dislike_store_review == true) {
                      var index = id_of_users_dislike_store_comment.indexOf(
                        request_data_body.user_id
                      );
                      if (index < 0) {
                        id_of_users_dislike_store_comment.push(
                          request_data_body.user_id
                        );
                        review_detail.id_of_users_dislike_store_comment =
                          id_of_users_dislike_store_comment;
                      }
                    } else {
                      var index = id_of_users_dislike_store_comment.indexOf(
                        request_data_body.user_id
                      );
                      if (index >= 0) {
                        id_of_users_dislike_store_comment.splice(index, 1);
                        review_detail.id_of_users_dislike_store_comment =
                          id_of_users_dislike_store_comment;
                      }
                    }

                    review_detail.save().then(
                      () => {
                        response_data.json({
                          success: true,
                          message:
                            USER_MESSAGE_CODE.REVIEW_COMMENT_SUCCESSFULLY,
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
                      error_code: USER_ERROR_CODE.STORE_REVIEW_DATA_NOT_FOUND,
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
                error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
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

exports.add_favourite_address = function (request_data, response_data) {
  var request_data_body = request_data.body;

  User.findOne({ _id: request_data_body.user_id }).then(
    async (user_detail) => {
      if (user_detail) {
        await User_favourite_address.updateMany(
          { user_id: user_detail._id },
          { $set: { is_default_address: false } }
        );
        var user_favourite_address = new User_favourite_address({
          user_id: user_detail._id,
          title: request_data_body.title,
          appartmentno: request_data_body.appartmentno,
          landmark: request_data_body.landmark,
          country: request_data_body.country,
          city1: request_data_body.city1,
          location: [request_data_body.latitude, request_data_body.longitude],
          city_code: request_data_body.city_code,
          address: request_data_body.address,
          country_code_2: request_data_body.country_code_2,
          city2: request_data_body.city2,
          country_code: request_data_body.country_code,
          city3: request_data_body.city3,
          building_no: request_data_body.building_no,
          is_default_address: true,
        });

        user_favourite_address.save().then(() => {
          User_favourite_address.find({
            user_id: request_data_body.user_id,
          }).then((user_favourite_address) => {
            if (user_favourite_address && user_favourite_address.length > 0) {
              response_data.json({
                success: true,
                message: USER_MESSAGE_CODE.FAVOURITE_ADDRESS_ADDED_SUCCESSFULLY,
                user_favourite_address: user_favourite_address,
              });
            } else {
              response_data.json({
                success: false,
                error_code: USER_ERROR_CODE.FAVOURITE_ADDRESS_NOT_FOUND,
              });
            }
          });
        });
      } else {
        response_data.json({
          success: false,
          error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
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

exports.update_favourite_address = function (request_data, response_data) {
  var request_data_body = request_data.body;
  var user_fav_address_id = request_data_body.user_favourite_address_id;
  User.findOne({ _id: request_data_body.user_id }).then(
    (user_detail) => {
      if (user_detail) {
        request_data_body.location = [];
        request_data_body.location[0] = request_data_body.latitude;
        request_data_body.location[1] = request_data_body.longitude;
        User_favourite_address.findOneAndUpdate(
          { _id: user_fav_address_id },
          request_data_body,
          { new: true }
        ).then((user_favourite_address) => {
          User_favourite_address.find({
            user_id: request_data_body.user_id,
          }).then((user_favourite_address) => {
            if (user_favourite_address && user_favourite_address.length != 0) {
              response_data.json({
                success: true,
                message:
                  USER_MESSAGE_CODE.FAVOURITE_ADDRESS_UPDATED_SUCCESSFULLY,
                user_favourite_address: user_favourite_address,
              });
            } else {
              response_data.json({
                success: false,
                error_code: USER_ERROR_CODE.FAVOURITE_ADDRESS_NOT_FOUND,
              });
            }
          });
        });
      } else {
        response_data.json({
          success: false,
          error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
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

exports.get_favourite_address = function (request_data, response_data) {
  var request_data_body = request_data.body;
  var is_default_address = request_data.body.is_default_address;
  var default_address_id = request_data.body.default_address_id;
  User.findOne({ _id: request_data_body.user_id }).then(
    async (user_detail) => {
      const settings = await Setting.findOne({});
      if (user_detail) {
        if (is_default_address && default_address_id) {
          await User_favourite_address.updateMany(
            { user_id: request_data_body.user_id },
            { $set: { is_default_address: false } }
          );
          const default_address = await User_favourite_address.findOne({
            _id: request_data.body.default_address_id,
          });
          default_address.is_default_address = true;
          default_address.save();
        }
        User_favourite_address.find({
          user_id: request_data_body.user_id,
        }).then((user_favourite_address) => {
          if (user_favourite_address && user_favourite_address.length != 0) {
            user_favourite_address.forEach((address) => {
              if (!address.title) {
                address.icon =
                  settings.aws_bucket_url + "images/icons_home.png";
              } else if (
                address.title &&
                address.title.toLowerCase() == "home"
              ) {
                address.icon =
                  settings.aws_bucket_url + "images/icons_home.png";
              } else if (
                ["office", "work"].includes(
                  address.title ? address.title.toLowerCase() : ""
                )
              ) {
                address.icon = settings.aws_bucket_url + "images/works.png";
              } else {
                address.icon = settings.aws_bucket_url + "images/others.png";
              }
            });

            response_data.json({
              success: true,
              message: USER_MESSAGE_CODE.FAVOURITE_ADDRESS_ADDED_SUCCESSFULLY,
              user_favourite_address: user_favourite_address,
            });
          } else {
            response_data.json({
              success: false,
              error_code: USER_ERROR_CODE.FAVOURITE_ADDRESS_NOT_FOUND,
            });
          }
        });
      } else {
        response_data.json({
          success: false,
          error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
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

var Category = require("mongoose").model("category");

// exports.get_category_list = function (request_data, response_data) {
//   utils.check_request_params(request_data.body, [], function (response) {
//     if (response.success) {
//       var request_data_body = request_data.body;
//       Store.findOne({ _id: request_data_body.store_id }).then(
//         (store_detail) => {
//           Category.find(
//             {
//               store_id: mongoose.Types.ObjectId(request_data_body.store_id),
//               is_visible_in_store: true,
//             },
//             function (err, category) {
//               if (category.length == 0) {
//                 response_data.json({
//                   success: false,
//                   error_code: CATEGORY_ERROR_CODE.CATEGORY_DATA_NOT_FOUND,
//                 });
//               } else {
//                 response_data.json({
//                   success: true,
//                   store_detail: store_detail,
//                   message: CATEGORY_MESSAGE_CODE.CATEGORY_LIST_SUCCESSFULLY,
//                   category: category,
//                 });
//               }
//             },
//             (error) => {
//               response_data.json({
//                 success: false,
//                 error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
//               });
//             }
//           );
//         }
//       );
//     } else {
//       response_data.json(response);
//     }
//   });
// };

exports.get_ramadan_category_list = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      var store_id = "606ae5f792577f71bde13caf";
      // User.findOne({_id: request_data_body.user_id}).then((user_detail) => {
      //     if (user_detail) {
      //         if (request_data_body.type != ADMIN_DATA_ID.ADMIN && request_data_body.server_token !== null && user_detail.server_token !== request_data_body.server_token) {
      //             response_data.json({success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN});
      //         } else {
      Store.findOne({ _id: store_id }).then((store_detail) => {
        Category.find(
          {
            store_id: mongoose.Types.ObjectId(store_id),
            is_visible_in_store: true,
          },
          function (err, category) {
            if (category.length == 0) {
              response_data.json({
                success: false,
                error_code: CATEGORY_ERROR_CODE.CATEGORY_DATA_NOT_FOUND,
              });
            } else {
              response_data.json({
                success: true,
                store_detail: store_detail,
                message: CATEGORY_MESSAGE_CODE.CATEGORY_LIST_SUCCESSFULLY,
                category: category,
                server_time: new Date(moment(new Date()).utc().valueOf()),
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
      });

      //     }
      // } else {
      //     response_data.json({success: false, error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND});
      // }
      // }, (error) => {

      //     response_data.json({
      //         success: false,
      //         error_code: ERROR_CODE.SOMETHING_WENT_WRONG
      //     });
      // });
    } else {
      response_data.json(response);
    }
  });
};

exports.ramadan_product_item_list = async (req, res) => {
  var category_id = req.body.category_id;
  if (!category_id) {
    res.json({
      status: false,
      error_message: "Pass correct category_id",
    });
    return;
  }
  var product = await Product.findOne({ category_id });
  if (product && product._id) {
    var items = await Item.find({ product_id: product._id });
    res.json({ status: true, items });
  } else {
    res.json({
      status: false,
      error_message: "Category/Product are not correctly setup",
    });
  }
};

exports.delete_favourite_address = function (request_data, response_data) {
  var request_data_body = request_data.body;
  var user_fav_address_id = request_data_body.user_favourite_address_id;
  User.findOne({ _id: request_data_body.user_id }).then(
    (user_detail) => {
      if (user_detail) {
        User_favourite_address.findOneAndRemove({
          _id: user_fav_address_id,
        }).then((user_favourite_address) => {
          User_favourite_address.find({
            user_id: request_data_body.user_id,
          }).then((user_favourite_address) => {
            if (user_favourite_address && user_favourite_address.length != 0) {
              response_data.json({
                success: true,
                message:
                  USER_MESSAGE_CODE.FAVOURITE_ADDRESS_UPDATED_SUCCESSFULLY,
                user_favourite_address: user_favourite_address,
              });
            } else {
              response_data.json({
                success: false,
                error_code: USER_ERROR_CODE.FAVOURITE_ADDRESS_NOT_FOUND,
              });
            }
          });
        });
      } else {
        response_data.json({
          success: false,
          error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
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

exports.remove_item_from_cart = async function (request_data, response_data) {
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
        try {
          var store_detail = await User.findOne({ _id: cart.store_id });
          if (store_detail && store_detail.device_token) {
            utils.sendPushNotification(
              ADMIN_DATA_ID.STORE,
              device_type,
              store_detail.device_token,
              STORE_PUSH_CODE.USER_CONFIRMED_ORDER,
              PUSH_NOTIFICATION_SOUND_FILE.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS
            );
          }
        } catch (error) {}
      }
      cart.total_cart_price = totalCartPrice;
      cart.total_item_count = totalItemCount;
      await Order_payment.findByIdAndUpdate(cart.order_payment_id, {
        total_order_price: totalCartPrice,
      });
      await update_cart_detail(
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
    } catch (error) {}
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

exports.user_get_price_sort = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [
      { name: "store_id", type: "string" },
      { name: "product_id", type: "string" },
    ],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var store_id = request_data_body.store_id;
        var category_id = request_data_body.category_id;
        var product_id = request_data_body.product_id;
        var search_value = request_data_body.search_value;
        var searchCondition = { $match: {} };
        var direction =
          request_data_body.direction && request_data_body.direction === "rev"
            ? -1
            : 1;
        var sort_by =
          request_data_body.sort_by && request_data_body.sort_by === "price"
            ? "items.price"
            : "items.name";
        if (search_value !== undefined) {
          search_value = search_value.replace(/^\s+|\s+$/g, "");
          search_value = search_value.replace(/ +(?= )/g, "");
          searchCondition = {
            $match: {
              "items.name": {
                $regex: new RegExp("\\b" + search_value + ".*", "i"),
              },
            },
          };
        }

        var server_time = new Date(moment(new Date()).utc().valueOf());
        var match_store_id = {
          $match: { store_id: { $eq: mongoose.Types.ObjectId(store_id) } },
        };

        var category_condition = { $match: {} };
        if (category_id !== undefined) {
          category_condition = {
            $match: {
              category_id: { $eq: mongoose.Types.ObjectId(category_id) },
            },
          };
        }

        // var condition1 = { $match: { is_visible_in_store: { $eq: true } } };

        Product.aggregate([
          match_store_id,
          category_condition,
          // condition1,
          {
            $match: {
              _id: { $eq: mongoose.Types.ObjectId(product_id) },
            },
          },
          {
            $lookup: {
              from: "items",
              localField: "_id",
              foreignField: "product_id",
              as: "items",
            },
          },
          { $unwind: "$items" },
          searchCondition,
          { $sort: { "items.sequence_number": 1 } },
          { $sort: { [sort_by]: direction } },
          // [{ $sort : {price: 1}}],{allowDiskUse: true},
          {
            $match: {
              "items.is_visible_in_store": true,
              "items.is_item_in_stock": true,
            },
          },
          // {$match: {$and: [{"items.is_visible_in_store": true}, {"items.is_item_in_stock": true}]}},
          {
            $group: {
              _id: {
                _id: "$_id",
                unique_id: "$unique_id",
                name: "$name",
                details: "$details",
                $details_1: "$details_1",
                image_url: "$image_url",
                is_visible_in_store: "$is_visible_in_store",
                created_at: "$created_at",
                sequence_number: "$sequence_number",
                updated_at: "$updated_at",
              },
              items: { $push: "$items" },
            },
          },
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
                server_time: server_time,
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
      } else {
        response_data.json(response);
      }
    }
  );
};

exports.user_welcome = async function (request_data, response_data) {
  const user = await User.findOne({
    server_token: request_data.body.server_token,
  });

  const installation_setting = await Installation_setting.findOne({});
  const setting = await Setting.findOne({});
  if (installation_setting.is_recieved_welcome_message) {
    if (user && request_data.body.server_token) {
      if (!user.is_recieved_welcome_message) {
        const welcome_msg =
          setting.welcome_description_for_logged_in_user.replace(
            "%amount",
            setting.welcome_wallet
          );
        // user.wallet = user.wallet + setting.welcome_wallet;
        user.is_recieved_welcome_message = true;
        await user.save();
        response_data.json({
          success: true,
          welcome_image_url: setting.welcome_image_url_for_logged_in_user,
          welcome_description: welcome_msg,
        });
      } else {
        response_data.json({});
      }
    } else {
      response_data.json({
        success: true,
        welcome_image_url: setting.welcome_image_url_for_logged_out_user,
        welcome_description: setting.welcome_description_for_logged_out_user,
      });
    }
  } else {
    response_data.json({});
  }
};

exports.last_order_review_status = async function (req, res) {
  var request_data_body = req.body;
  if (!request_data_body.user_id) {
    res.json({
      success: false,
      order_id: "",
      store_name: "",
      store_id: "",
      inprogress_order: null,
    });
    return;
  }
  const order = await Order.find({
    user_id: request_data_body.user_id,
    order_status: ORDER_STATE.ORDER_COMPLETED,
  })
    .sort({ _id: -1 })
    .limit(1);

  const user_condition = {
    $match: {
      user_id: {
        $eq: mongoose.Types.ObjectId(request_data_body.user_id),
      },
    },
  };

  const order_status_condition = {
    $match: {
      $or: [
        { order_status: ORDER_STATE.WAITING_FOR_ACCEPT_STORE },
        { order_status: ORDER_STATE.STORE_ACCEPTED },
        { order_status: ORDER_STATE.STORE_PREPARING_ORDER },
        { order_status: ORDER_STATE.ORDER_READY },
      ],
    },
  };

  let inprogress_order = await Order.aggregate([
    user_condition,
    order_status_condition,
    {
      $lookup: {
        from: "stores",
        localField: "store_id",
        foreignField: "_id",
        as: "store_detail",
      },
    },
    {
      $unwind: {
        path: "$store_detail",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "cities",
        localField: "city_id",
        foreignField: "_id",
        as: "city_detail",
      },
    },
    { $unwind: "$city_detail" },
    {
      $lookup: {
        from: "countries",
        localField: "city_detail.country_id",
        foreignField: "_id",
        as: "country_detail",
      },
    },
    { $unwind: "$country_detail" },
    {
      $lookup: {
        from: "order_payments",
        localField: "order_payment_id",
        foreignField: "_id",
        as: "order_payment_detail",
      },
    },
    {
      $unwind: "$order_payment_detail",
    },
    {
      $lookup: {
        from: "requests",
        localField: "request_id",
        foreignField: "_id",
        as: "request_detail",
      },
    },
    {
      $unwind: {
        path: "$request_detail",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "carts",
        localField: "cart_id",
        foreignField: "_id",
        as: "cart_detail",
      },
    },
    {
      $unwind: "$cart_detail",
    },
    {
      $project: {
        _id: "$_id",
        unique_id: "$unique_id",
        currency: "$country_detail.currency_sign",
        request_unique_id: "$request_detail.unique_id",
        request_id: "$request_detail._id",
        delivery_status: "$request_detail.delivery_status",
        estimated_time_for_delivery_in_min:
          "$request_detail.estimated_time_for_delivery_in_min",
        total_time: "$order_payment_detail.total_time",
        total_order_price: "$order_payment_detail.total_order_price",
        confirmation_code_for_complete_delivery:
          "$confirmation_code_for_complete_delivery",
        created_at: "$created_at",
        image_url: "$image_url",
        order_status: "$order_status",
        is_user_show_invoice: "$is_user_show_invoice",
        order_status_id: "$order_status_id",
        user_pay_payment: "$order_payment_detail.user_pay_payment",
        checkout_amount: "$order_payment_detail.checkout_amount",
        is_payment_mode_online_payment:
          "$order_payment_detail.is_payment_mode_online_payment",
        cart_id: "$cart_detail._id",
        pickup_addresses: "$cart_detail.pickup_addresses",
        destination_addresses: "$cart_detail.destination_addresses",
        store_id: "$store_detail._id",
        store_name: "$store_detail.name",
        store_delivery_id: "$store_detail.store_delivery_id",
        store_image: "$store_detail.image_url",
        store_country_phone_code: "$store_detail.country_phone_code",
        store_phone: "$store_detail.phone",
        delivery_type: "$delivery_type",
        delivery_time_max: "$store_detail.delivery_time_max",
        order_details: "$cart_detail.order_details",
        deliver_in: "$deliver_in",
        order_status_details: "$date_time",
        payment_gateway_name: {
          $switch: {
            branches: [
              {
                case: "$order_payment_detail.is_payment_mode_online_payment",
                then: "Online",
              },
              {
                case: "$order_payment_detail.is_payment_mode_card_on_delivery",
                then: "Card on Delivery",
              },
            ],
            default: "Cash",
          },
        },
      },
    },
    { $sort: { _id: -1 } },
    { $limit: 1 },
  ]);
  inprogress_order = inprogress_order.length > 0 ? inprogress_order[0] : null;

  if (order.length == 0) {
    res.json({
      success: false,
      order_id: "",
      store_name: "",
      store_id: "",
      inprogress_order,
    });
    return;
  }
  if (order[0].review_check == true) {
    res.json({
      success: false,
      order_id: "",
      store_name: "",
      store_id: "",
      inprogress_order,
    });
    return;
  }
  const store = await Store.findOne({ _id: order[0].store_id });
  const reviews = await Review.findOne({ order_id: order[0]._id });
  if (!reviews) {
    res.json({
      success: false,
      order_id: "",
      store_name: "",
      store_id: "",
      inprogress_order,
    });
    return;
  }
  await Order.findOneAndUpdate({ _id: order[0]._id }, { review_check: true });
  res.json({
    success: true,
    order_id: order[0]._id,
    store_name: store.name,
    store_id: store._id,
    inprogress_order,
  });
};

exports.updateImgUrl = async function (req, res) {
  const type = req.body.type;
  const setting = await Setting.findOne({});
  // const awsUrl = "https://yeep.s3.me-south-1.amazonaws.com/"
  const awsUrl = setting.aws_bucket_url;
  if (type == "items") {
    const items = await Item.find(
      { image_url: { $ne: [] }, store_id: req.body.store_id },
      { image_url: 1 }
    );

    const newitem = [];
    for (let i = 0; i < items.length; i++) {
      let url = "";
      //
      if (items[i].image_url) {
        items[i].image_url.forEach(async (url, index) => {
          if (!url.includes(awsUrl)) {
            items[i].image_url[index] = awsUrl + url;
          }
        });
        await Item.findOneAndUpdate(
          { _id: items[i]._id },
          { image_url: items[i].image_url }
        );
      }
    }
    res.json({
      success: true,
      length: items.length,
      newitem: items.slice(0, 20),
      // newitem : newitem
      // items : items[1000]
    });
  }
  if (type == "categories") {
    const categories = await Category.find({ image_url: { $ne: "" } });

    for (let i = 0; i < categories.length; i++) {
      if (!categories[i].image_url.includes(awsUrl)) {
        let url = awsUrl + categories[i].image_url;
        await Category.findOneAndUpdate(
          { _id: categories[i]._id },
          { image_url: url }
        );
      }
    }
    res.json({
      success: true,
      length: categories.length,
      categories: categories.slice(0, 20),
    });
  }
  if (type == "stores") {
    const stores = await Store.find({ image_url: { $ne: "" } });

    for (let i = 0; i < stores.length; i++) {
      if (!stores[i].image_url.includes(awsUrl)) {
        let url = awsUrl + stores[i].image_url;
        await Store.findOneAndUpdate(
          { _id: stores[i]._id },
          { image_url: url }
        );
      }
    }
    res.json({
      success: true,
      length: stores.length,
      stores: stores,
      storesId: stores.map((str) => str._id),
    });
  }
  if (type == "users") {
    const users = await User.find({ image_url: { $ne: "" } });

    for (let i = 0; i < users.length; i++) {
      if (!users[i].image_url.includes(awsUrl)) {
        let url = awsUrl + users[i].image_url;
        await User.findOneAndUpdate({ _id: users[i]._id }, { image_url: url });
      }
    }
    res.json({
      success: true,
      length: users.length,
      // users : users,
    });
  }
  if (type == "advertise") {
    const advertise = await Advertise.find({
      image_for_banner: { $ne: "" },
      image_for_mobile: { $ne: "" },
      image_url: { $ne: "" },
    });

    for (let i = 0; i < advertise.length; i++) {
      let url = "";

      if (!advertise[i].image_for_banner.includes(awsUrl)) {
        url = awsUrl + advertise[i].image_for_banner;
        await Advertise.findOneAndUpdate(
          { _id: advertise[i]._id },
          { image_for_banner: url }
        );
      }
      if (!advertise[i].image_for_mobile.includes(awsUrl)) {
        url = awsUrl + advertise[i].image_for_mobile;
        await Advertise.findOneAndUpdate(
          { _id: advertise[i]._id },
          { image_for_mobile: url }
        );
      }
      if (!advertise[i].image_url.includes(awsUrl)) {
        url = awsUrl + advertise[i].image_url;
        await Advertise.findOneAndUpdate(
          { _id: advertise[i]._id },
          { image_url: url }
        );
      }
    }
    res.json({
      success: true,
      length: advertise.length,
      advertise: advertise,
    });
  }
  if (type == "delivery") {
    const deliveries = await Delivery.find({});

    for (let i = 0; i < deliveries.length; i++) {
      let url = "";

      if (deliveries[i].image_url != "") {
        if (!deliveries[i].image_url.includes(awsUrl)) {
          url = awsUrl + deliveries[i].image_url;
          await Delivery.findOneAndUpdate(
            { _id: deliveries[i]._id },
            { image_url: url }
          );
        }
      }
      if (deliveries[i].icon_url != "") {
        if (!deliveries[i].icon_url.includes(awsUrl)) {
          url = awsUrl + deliveries[i].icon_url;
          await Delivery.findOneAndUpdate(
            { _id: deliveries[i]._id },
            { icon_url: url }
          );
        }
      }
      if (deliveries[i].map_pin_url != "") {
        if (!deliveries[i].map_pin_url.includes(awsUrl)) {
          url = awsUrl + deliveries[i].map_pin_url;
          await Delivery.findOneAndUpdate(
            { _id: deliveries[i]._id },
            { map_pin_url: url }
          );
        }
      }
    }
    res.json({
      success: true,
      length: deliveries.length,
      deliveries: deliveries,
    });
  }
  if (type == "update_cat_sequence") {
    const seq = [
      "Exclusive Offers",
      "Beverage",
      "Fruits & Vegetables",
      "Dairy",
      "Fresh Butchery",
      "Chocolates, Cookies & More",
      "Chips & Munches",
      "Bakery",
      "Healthy Breakfast",
      "Coffee & Tea",
      "Cigarette & Tobacco",
      "Frozen",
      "Cooking",
      "Canned Food",
      "Spreads, Jam & More",
      "Personal Care & Hygiene",
      "Cleaning & Laundry Products",
      "Baby Care",
      "Pet Care",
      "General Items",
      "Ready to Eat",
    ];
    const categories = await Category.find({});
    for (let i = 0; i < categories.length; i++) {
      if (seq.includes(categories[i].name)) {
        console.log(
          "seq.indexOf(categories[i].name) :>> " +
            seq.indexOf(categories[i].name)
        );
        await Category.findOneAndUpdate(
          { _id: categories[i]._id },
          { sequence_number: seq.indexOf(categories[i].name) }
        );
      } else {
        //
      }
    }
    res.json({
      success: true,
      length: categories.length,
    });
  }
  if (type == "orders") {
    const carts = await Cart.find({}, { order_details: 1 }).lean();

    carts.forEach(async (cart) => {
      if (cart.order_details) {
        cart.order_details.forEach((product) => {
          if (product.items) {
            product.items.forEach((item) => {
              item.image_url.forEach(async (url, index) => {
                if (!url.includes(awsUrl)) {
                  item.image_url[index] = awsUrl + url;
                }
              });
            });
          }
        });
        await Cart.findOneAndUpdate({ _id: cart._id }, cart);
      }
      // 5f58939836bcfb6157ba566a
    });
    res.json({
      success: true,
      lenght: carts.length,
    });
  }
  if (type == "set_recomended_prod") {
    const barcode = req.body.barcode;
    if (!barcode) {
      res.json({
        success: false,
        message: "barcode parameter is missing",
      });
      return;
    }
    const items = await Item.find({ unique_id_for_store_data: barcode }).lean();
    for (let i = 0; i < items.length; i++) {
      await Item.findOneAndUpdate(
        { _id: items[i]._id },
        { is_recommend_in_store: true }
      );
    }
    res.json({
      success: true,
      itemsCount: items.length,
    });
  }
};
var Admin = require("mongoose").model("admin");
exports.send_push_notification = async function (req, res) {
  const admins = await Admin.find({});
  io.emit("newOrder", { text: "new order" });
  admins.forEach(async (admin) => {
    if (admin.subscription) {
      await utils.sendWebPushNotification({
        subscription: admin.subscription,
        admin: admin,
      });
    }
  });
  res.json({
    admins: admins,
  });
};
