require("../../utils/message_code");
require("../../utils/error_code");
require("../../utils/constants");
var User = require("mongoose").model("user");
var Store = require("mongoose").model("store");
var Provider = require("mongoose").model("provider");
var Card = require("mongoose").model("card");
var Payment_gateway = require("mongoose").model("payment_gateway");
var City = require("mongoose").model("city");
var utils = require("../../utils/utils");
var console = require("../../utils/console");
const { Checkout } = require("checkout-sdk-node");
var Installation_setting = require("mongoose").model("installation_setting");

exports.add_card = function (request_data, response_data) {
  console.log("add_card: " + JSON.stringify(request_data.body));
  utils.check_request_params(
    request_data.body,
    [
      { name: "card_number", type: "string" },
      { name: "user_id", type: "string" },
      { name: "last_four", type: "string" },
      { name: "card_holder_name", type: "string" },
      { name: "expiry_month", type: "string" },
      { name: "expiry_year", type: "string" },
      { name: "cvv", type: "string" },
    ],
    async function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        const setting = await Installation_setting.findOne({});
        const cko = new Checkout(setting.CKO_SECRET_KEY, {
          pk: setting.CKO_PUBLIC_KEY,
          timeout: 7000,
        });
        console.log(JSON.stringify(request_data.body));
        var body = {};
        try {
          const auth_token = await cko.tokens.request({
            // type:"card" is inferred
            number: request_data_body.card_number,
            expiry_month: request_data_body.expiry_month,
            expiry_year: request_data_body.expiry_year,
            cvv: request_data_body.cvv,
          });
          console.log("token: " + JSON.stringify(auth_token));

          const auth_payment = await cko.payments.request({
            source: {
              type: "token",
              token: auth_token.token,
            },
            currency: "AED",
          });

          console.log("auth Payment: " + JSON.stringify(auth_payment));
          if (
            ["Card Verified", "Authorized"].includes(auth_payment.status) &&
            auth_payment.approved == true
          ) {
            const token = await cko.tokens.request({
              // type:"card" is inferred
              number: request_data_body.card_number,
              expiry_month: request_data_body.expiry_month,
              expiry_year: request_data_body.expiry_year,
              cvv: request_data_body.cvv,
            });
            const instrument = await cko.instruments.create({
              token: token.token,
            });

            const card = await Card.findOne({
              card_number: request_data_body.card_number,
              user_id: request_data_body.user_id,
            });

            if (card) {
              card.is_card_verified = true;
              await card.save();
              response_data.json({
                success: false,
                error_code: CART_CHECKOUT_CODE.ADD_CARD_FAILED,
              });
            } else {
              let newCard = await Card.create(
                Object.assign(request_data_body, {
                  card_type: token.card_type,
                  instrument_id: instrument.id,
                  is_card_verified: true,
                })
              );
              body.request_id =
                auth_payment && auth_payment.id ? auth_payment.id : Date.now();
              response_data.json({
                success: true,
                is_card_verified: true,
                auth_payment: auth_payment,
                data: newCard,
                body,
              });
            }
          } else {
            body.request_id =
              auth_payment && auth_payment.id ? auth_payment.id : Date.now();
            body.error_type = auth_payment.response_summury
              ? auth_payment.response_summury
              : "request_invalid";
            response_data.json({
              success: false,
              is_card_verified: false,
              body,
            });
          }
        } catch (err) {
          body.request_id =
            err.body && err.body.request_id ? err.body.request_id : Date.now();
          body.error_type =
            err.body && err.body.error_type
              ? err.body.error_type
              : "request_invalid";
          console.log(err);
          let res = {
            success: false,
          };
          res.body = body;
          // res.payment_gateway_info = err;
          response_data.json(res);
        }
      } else {
        response_data.json(Object.assign(response, { success: false }));
      }
    }
  );
};

exports.get_card_list = function (request_data, response_data) {
  console.log("get_card_list: " + JSON.stringify(request_data.body));
  utils.check_request_params(
    request_data.body,
    [{ name: "user_id", type: "string" }],
    async function (response) {
      var user_id = request_data.body.user_id;
      var card = await Card.find({ user_id });
      const setting = await Installation_setting.findOne({});
      var CKO_SECRET_KEY = setting.CKO_SECRET_KEY;

      var CKO_PUBLIC_KEY = setting.CKO_PUBLIC_KEY;
      console.log(CKO_PUBLIC_KEY, CKO_SECRET_KEY);
      var user = await User.findOne({ _id: user_id });
      var loyalty_points = user.loyalty_points;
      console.log(loyalty_points);
      var city = {};
      var store = {};
      if (user && user.city) {
        city = await City.findOne({ city_name: user.city });
      }
      if (request_data.body.store_id) {
        store = await Store.findOne({ _id: request_data.body.store_id });
      }
      var details = {
        wallet: user && user.wallet ? user.wallet : 0,
        is_payment_max: user && user.is_payment_max ? user.is_payment_max : 0,
        is_use_wallet: user && user.is_use_wallet ? user.is_use_wallet : false,
        is_pay_valid: user && user.is_pay_valid ? user.is_pay_valid : true,
        is_cash_payment_mode:
          city && city.is_cash_payment_mode ? city.is_cash_payment_mode : false,
        currency: "AED",
        is_cash_visible:
          store && store.is_cash_visible ? store.is_cash_visible : false,
        is_card_on_delivery_visible:
          store && store.is_card_on_delivery_visible
            ? store.is_card_on_delivery_visible
            : false,
        is_online_payment_visible:
          store && store.is_online_payment_visible
            ? store.is_online_payment_visible
            : false,
        is_wallet_visible:
          store && store.is_wallet_visible ? store.is_wallet_visible : false,
      };

      if (card.length != 0) {
        response_data.json(
          Object.assign(
            {
              data: card,
              success: true,
              CKO_SECRET_KEY: CKO_SECRET_KEY,
              loyalty_points: loyalty_points,
              CKO_PUBLIC_KEY: CKO_PUBLIC_KEY,
            },
            details
          )
        );
      } else {
        response_data.json(
          Object.assign(
            {
              success: true,
              data: [],
              CKO_SECRET_KEY: CKO_SECRET_KEY,
              CKO_PUBLIC_KEY: CKO_PUBLIC_KEY,
              loyalty_points: loyalty_points,
              error_code: CART_CHECKOUT_CODE.GET_CARD_LIST_FAILED,
            },
            details
          )
        );
      }
    }
  );
};

exports.delete_card = function (request_data, response_data) {
  console.log("delete_card: " + JSON.stringify(request_data.body));
  utils.check_request_params(
    request_data.body,
    [{ name: "card_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;

        if (
          false &&
          request_data_body.server_token !== null &&
          detail.server_token !== request_data_body.server_token
        ) {
          response_data.json({
            success: false,
            error_code: ERROR_CODE.INVALID_SERVER_TOKEN,
          });
        } else {
          Card.deleteOne({
            _id: request_data_body.card_id,
          }).then(
            () => {
              response_data.json({
                success: true,
                message: CARD_MESSAGE_CODE.CARD_DELETE_SUCCESSFULLY,
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
exports.set_card_default = async function (request_data, response_data) {
  console.log("set_card_default: " + JSON.stringify(request_data.body));

  var card_id = request_data.body.card_id;
  if (card_id) {
    card = await Card.findOne({ _id: card_id });
    try {
      const card_list = await Card.find({
        user_id: card.user_id,
      });
      card_list.forEach(async (card) => {
        card.is_default = false;
        await card.save();
      });
      card.is_default = true;
      response_data.json({
        success: true,
        data: await card.save(),
      });
    } catch (err) {
      response_data.json({
        error: err.message,
        success: true,
      });
    }
  }
};

exports.select_card = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "card_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var type = Number(request_data_body.type); // 7 = User , 8 = Provider , 2 = Store
        var Table;
        switch (type) {
          case ADMIN_DATA_ID.USER:
            type = ADMIN_DATA_ID.USER;
            Table = User;
            break;
          case ADMIN_DATA_ID.PROVIDER:
            type = ADMIN_DATA_ID.PROVIDER;
            Table = Provider;
            break;
          case ADMIN_DATA_ID.STORE:
            type = ADMIN_DATA_ID.STORE;
            Table = Store;
            break;
          default:
            type = ADMIN_DATA_ID.USER;
            Table = User;
            break;
        }

        Table.findOne({ _id: request_data_body.user_id }).then(
          (detail) => {
            if (detail) {
              Card.findOneAndUpdate(
                {
                  _id: { $nin: request_data_body.card_id },
                  user_id: request_data_body.user_id,
                  user_type: type,
                  is_default: true,
                },
                { is_default: false }
              ).then((card) => {});
              Card.findOne({
                _id: request_data_body.card_id,
                user_id: request_data_body.user_id,
                user_type: type,
              }).then(
                (card) => {
                  if (card) {
                    card.is_default = true;
                    card.save().then(
                      () => {
                        response_data.json({
                          success: true,
                          message: CARD_MESSAGE_CODE.CARD_SELECTED_SUCCESSFULLY,
                          card: card,
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
                    response_data.json({
                      success: false,
                      error_code: CARD_ERROR_CODE.CARD_DATA_NOT_FOUND,
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
                error_code: ERROR_CODE.DETAIL_NOT_FOUND,
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

exports.google_pay = async function (req, res) {
  const { token_data } = req.body;
  const setting = await Installation_setting.findOne({});
  const cko = new Checkout(setting.CKO_SECRET_KEY, {
    pk: setting.CKO_PUBLIC_KEY,
    timeout: 7000,
  });

  try {
    const token = await cko.tokens.request({
      type: "googlepay",
      token_data: token_data,
    });
    const instrument = await cko.instruments.create({
      token: token.token,
    });
    // payment_type: "Regular",
    // const payment = await cko.payments.request({
    //   source: {
    //     type: "id",
    //     token: token.token,
    //     id: instrument.id,
    //     // cvv: req.body.cvv ? req.body.cvv : "",
    //   },
    //   amount : 1000,
    //   currency: "USD",
    // });
    res.json({
      success: true,
      token: token,
      instrument: instrument,
      // payment : payment
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

exports.apple_pay = async function (req, res) {
  const { token_data } = req.body;
  const setting = await Installation_setting.findOne({});
  const cko = new Checkout(setting.CKO_SECRET_KEY, {
    pk: setting.CKO_PUBLIC_KEY,
    timeout: 7000,
  });

  try {
    const token = await cko.tokens.request({
      type: "applepay",
      token_data: token_data,
    });
    const payment = await cko.payments.request({
      source: {
        type: "token",
        token: token.token,
      },
      amount: 1000,
      currency: "USD",
    });
    res.json({
      success: true,
      token: token,
      payment: payment,
    });
  } catch (error) {
    res.json({
      message: error.message,
      error: error,
    });
  }
};
