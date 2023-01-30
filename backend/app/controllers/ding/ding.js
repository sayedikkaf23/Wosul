var utils = require("../../utils/utils");
var moment = require("moment");
const axios = require("axios");
var Installation_setting = require("mongoose").model("installation_setting");
var Cart = require("mongoose").model("cart");
var Card = require("mongoose").model("card");
var User = require("mongoose").model("user");
var Order_payment = require("mongoose").model("order_payment");
var Order = require("mongoose").model("order");
const { deduct_amount } = require("../user/cart");
const { create_order } = require("../user/order");
const dingResponse = require("../../models/user/dingResponse");
const API_URL = "https://api.dingconnect.com/api/V1";
// const api_key = "EASuC8aYfrC6JmnYwLYeaU";
// const api_key = "6VJzpSp2qzt6VGv67sb5FJ";
// console.log("global.env: ", global.env.NODE_ENV);

const getInstallationSettings = async () => {
  const setting = await (await Installation_setting.findOne({})).toJSON();
  return setting;
};

exports.get_currencies = async function (req, res) {
  const installation_setting = await getInstallationSettings();
  const api_key = installation_setting.DING_API_KEY;
  try {
    const resp = await axios.get(`${API_URL}/GetCurrencies`, {
      headers: {
        ...{
          // "Content-Type":"application/x-www-form-urlencoded"
          Accept: "application/json, text/plain, */*",
          api_key: api_key,
        },
      },
    });
    console.log("resp :>> ", resp);
    const res_data = resp.data.Items.filter((itm) =>
      ["INR", "AED"].includes(itm.CurrencyIso)
    );
    res.json({
      success: true,
      data: res_data,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
exports.get_regions = async function (req, res) {
  const { CountryIso } = req.body;
  const installation_setting = await getInstallationSettings();
  const api_key = installation_setting.DING_API_KEY;
  try {
    const resp = await axios.get(
      `${API_URL}/GetRegions?CountryIso=${CountryIso}`,
      {
        headers: {
          ...{
            // "Content-Type":"application/x-www-form-urlencoded"
            Accept: "application/json, text/plain, */*",
            api_key: api_key,
          },
        },
      }
    );
    //   console.log('resp :>> ', resp);
    const regions = resp.data.Items.filter((itm) =>
      ["IN", "AE"].includes(itm.CountryIso)
    );
    // const countries = resp.data.Items.filter((itm)=> ["IN" , "AE"].includes(itm.RegionCode))
    res.json({
      success: true,
      regions: regions,
      // countries : countries
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
exports.get_countries = async function (req, res) {
  const installation_setting = await getInstallationSettings();
  const api_key = installation_setting.DING_API_KEY;
  try {
    const resp = await axios.get(`${API_URL}/GetCountries`, {
      headers: {
        ...{
          // "Content-Type":"application/x-www-form-urlencoded"
          Accept: "application/json, text/plain, */*",
          api_key: api_key,
        },
      },
    });
    res.json({
      success: true,
      countries: resp.data.Items,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
exports.get_providers = async function (req, res) {
  const { CountryIso = "AE", accountNumber, regionCodes = "AE" } = req.body;
  const installation_setting = await getInstallationSettings();
  const api_key = installation_setting.DING_API_KEY;
  console.log(
    "get_providers: api_key: " + api_key + "------" + JSON.stringify(req.body)
  );
  try {
    let account_number = accountNumber;
    if (accountNumber.includes("9710")) {
      account_number = accountNumber.replace("9710", "971");
    }
    const resp = await axios.get(
      `${API_URL}/GetProviders?CountryIso=${CountryIso}&accountNumber=${account_number}`,
      {
        headers: {
          ...{
            // "Content-Type":"application/x-www-form-urlencoded"
            Accept: "application/json",
            api_key: api_key,
          },
        },
      }
    );
    console.log("resp.data.Items: " + JSON.stringify(resp.data.Items));
    res.json({
      success: true,
      providers: resp.data.Items,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
exports.get_products = async function (req, res) {
  console.log("get_products:>>>> " + JSON.stringify(req.body));
  const {
    CountryIso = "AE",
    accountNumber,
    regionCodes = "AE",
    providerCodes,
  } = req.body;
  const installation_setting = await getInstallationSettings();
  const api_key = installation_setting.DING_API_KEY;
  let url = `${API_URL}/GetProducts?CountryIso=${CountryIso}&regionCodes=${regionCodes}`;
  if (providerCodes) {
    url += `&providerCodes=${providerCodes}`;
  }
  try {
    const resp = await axios.get(url, {
      headers: {
        ...{
          // "Content-Type":"application/x-www-form-urlencoded"
          Accept: "application/json, text/plain, */*",
          api_key: api_key,
        },
      },
    });
    res.json({
      success: true,
      products: resp.data.Items,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
exports.get_product_description = async function (req, res) {
  console.log("get_product_description:>>>> " + JSON.stringify(req.body));
  const { skuCodes, languageCodes } = req.body;
  const installation_setting = await getInstallationSettings();
  const api_key = installation_setting.DING_API_KEY;
  try {
    const resp = await axios.get(
      `${API_URL}/GetProductDescriptions?languageCodes=${languageCodes}&skuCodes=${skuCodes}`,
      {
        headers: {
          ...{
            // "Content-Type":"application/x-www-form-urlencoded"
            Accept: "application/json, text/plain, */*",
            api_key: api_key,
          },
        },
      }
    );
    res.json({
      success: true,
      product_description: resp.data.Items,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
exports.estimate_price = async function (req, res) {
  console.log("req.body :>> ", req.body);
  const data = req.body;
  const installation_setting = await getInstallationSettings();
  const api_key = installation_setting.DING_API_KEY;

  const sd = JSON.stringify(data);
  try {
    const transfer = await axios.post(`${API_URL}/EstimatePrices`, sd, {
      headers: {
        ...{
          "Content-Type": "application/json",
          api_key: api_key,
        },
      },
    });
    // console.log('transfer :>> ', transfer);
    res.json({
      success: true,
      data: transfer.data.Items,
    });
  } catch (error) {
    res.json({
      success: true,
      message: error.message,
    });
  }
};
exports.sendTransfer = async function (data) {
  const installation_setting = await getInstallationSettings();
  const api_key = installation_setting.DING_API_KEY;
  const sd = JSON.stringify(data);
  try {
    const transfer = await axios.post(`${API_URL}/SendTransfer`, sd, {
      headers: {
        "Content-Type": "application/json",
        api_key: api_key,
      },
    });
    // console.log('transfer :>> ', transfer);
    return transfer.data;
  } catch (error) {
    return error.response.data;
  }
};
exports.ding_order_payment = async function (req, res) {
  const {
    order_payment_id,
    card_id,
    user_id,
    order_type,

    payment_by = "card",
  } = req.body;
  console.log("ding_order_payment: >> " + JSON.stringify(req.body));

  const user = await User.findOne({ _id: user_id });
  if (!user) {
    res.json({
      success: false,
      error_code: USER_ERROR_CODE.USER_DATA_NOT_FOUND,
    });
    return;
  }

  const order_payment = await Order_payment.findOne({ _id: order_payment_id });
  if (!order_payment) {
    res.json({
      success: false,
      error_code: USER_ERROR_CODE.CHECK_PAYMENT_FAILED,
    });
    return;
  }
  const cart = await Cart.findOne({ _id: order_payment.cart_id });
  if (!cart) {
    res.json({
      success: false,
      error_code: CART_ERROR_CODE.CART_NOT_FOUND,
    });
    return;
  }
  const items = cart.order_details[0].items[0];
  const { SkuCode, SendValue, SendCurrencyIso, AccountNumber } = items;
  const dingResp = await exports.sendTransfer({
    SkuCode: SkuCode,
    SendValue: SendValue,
    SendCurrencyIso: SendCurrencyIso,
    AccountNumber,
    DistributorRef: order_payment.unique_id,
    ValidateOnly: true,
    BillRef: order_payment.unique_id,
  });
  let dingStatus = "Failded";
  let dingErrorCode = "";
  console.log("dingResp: >>>>" + JSON.stringify(dingResp));
  try {
    dingResponse.create({
      dingResponse: dingResp,
      cartId: order_payment.cart_id,
      orderId: order_payment.order_id,
      paymentId: order_payment._id,
      ValidateOnly: true,
    });
  } catch (error) {
    console.log("error can be ignore as for analytic purpose only: ", error);
  }
  if (
    !(
      dingResp &&
      dingResp.TransferRecord &&
      dingResp.TransferRecord.ProcessingState === "Complete"
    )
  ) {
    const error =
      dingResp.ErrorCodes && dingResp.ErrorCodes.length > 0
        ? dingResp.ErrorCodes[0].Code
        : "Failed";
    res.json({
      status: false,
      message: "Unable to process recharge.",
      error,
    });
    return;
  } else if (
    dingResp &&
    dingResp.TransferRecord &&
    dingResp.TransferRecord.ProcessingState
  ) {
    const error =
      dingResp.ErrorCodes && dingResp.ErrorCodes.length > 0
        ? dingResp.ErrorCodes[0].Code
        : dingErrorCode;
    dingStatus = dingResp.TransferRecord.ProcessingState;
    dingErrorCode = error;
  }
  if (payment_by === "wallet") {
    var wallet_to_order_current_rate = 1;
    var wallet_payment = 0;
    var user_pay_payment = order_payment.user_pay_payment;
    var user_wallet_amount = user.wallet;
    var is_payment_max = user.is_payment_max;
    if (user.is_use_wallet && user_wallet_amount > 0) {
      user_wallet_amount = user_wallet_amount * wallet_to_order_current_rate;
      if (user_wallet_amount >= is_payment_max) {
        wallet_payment = is_payment_max;
        order_payment.is_paid_from_wallet = true;
        console.log("wallet payment" + wallet_payment);
      } else {
        wallet_payment = user_wallet_amount;
        console.log("wallet payment" + wallet_payment);
      }
      if (user_pay_payment < wallet_payment) {
        wallet_payment = user_pay_payment;
      }
      order_payment.wallet_payment = wallet_payment;
      user_wallet_amount = user_wallet_amount - wallet_payment;
      console.log("user_wallet_amount:" + user_wallet_amount);
    } else {
      order_payment.wallet_payment = 0;
    }

    total_after_wallet_payment = user_pay_payment - wallet_payment;
    user.wallet = user_wallet_amount;
    await user.save();
    total_after_wallet_payment = utils.precisionRoundTwo(
      total_after_wallet_payment
    );
    order_payment.total_after_wallet_payment = total_after_wallet_payment;

    remaining_payment = total_after_wallet_payment;
    order_payment.remaining_payment = remaining_payment;
  }
  let card;
  await order_payment.save();
  var payment_info = { payment: { approved: false } };
  if (payment_by === "wallet" && order_payment.remaining_payment <= 0) {
    payment_info.payment.approved = true;
  } else {
    if (card_id) card = await Card.findOne({ _id: card_id });
    console.log("card :>> " + JSON.stringify(card) + " card_id :>> " + card_id);
    if (!card || !card.is_card_verified) {
      res.json({
        success: false,
        error: "invalid card details",
      });
      return;
    }
    order_payment.instrument_id = card.instrument_id;
    await order_payment.save();
  }
  if (
    payment_by !== "wallet" ||
    (payment_by === "wallet" && order_payment.remaining_payment > 0)
  ) {
    payment_info = await new Promise((res, rej) => {
      deduct_amount(
        {
          body: {
            order_payment_id,
            checkout_amount:
              payment_by === "wallet"
                ? order_payment.remaining_payment
                : SendValue,
          },
        },
        {
          json: function (data) {
            res(data);
          },
        }
      );
    });
    console.log("payment_info :>> " + JSON.stringify(payment_info));
  }
  if (
    payment_info.payment.approved == false ||
    payment_info.payment.status == "Declined"
  ) {
    res.json({
      success: false,
      error: "Payment Declined By provider",
    });
    return;
  }
  order_payment.is_payment_paid = true;
  await order_payment.save();
  const sendData = {
    SkuCode: SkuCode,
    SendValue: SendValue,
    SendCurrencyIso: SendCurrencyIso,
    AccountNumber,
    DistributorRef: order_payment.unique_id,
    ValidateOnly: global.env.NODE_ENV === "production" ? false : true,
    BillRef: order_payment.unique_id,
  };
  console.log("sendData: " + JSON.stringify(sendData));
  const trf = await exports.sendTransfer(sendData);
  var ordr = await new Promise((res, rej) => {
    create_order(
      {
        body: {
          cart_id: order_payment.cart_id.toString(),
          note: "",
          user_id,
          delivery_type: "1",
          
        },
      },
      {
        json: function (data) {
          res(data);
        },
      }
    );
  });
  console.log("ordr: " + JSON.stringify(ordr));
  const order = await Order.findOne({ _id: ordr.order_id });
  order.order_status_id = ORDER_STATUS_ID.COMPLETED;
  order.order_status_by = order_payment.store_id;
  order.order_status = ORDER_STATE.ORDER_COMPLETED;
  order.completed_at = new Date();
  var today_start_date_time = utils.get_date_now_at_city(
    new Date(),
    "Asia/Dubai"
  );
  order.completed_date_tag = moment(today_start_date_time).format(
    DATE_FORMATE.DDMMYYYY
  );
  order.completed_date_in_city_timezone = today_start_date_time;
  if (!order.date_time) order.date_time = [];
  order.date_time.push({
    status: ORDER_STATE.ORDER_COMPLETED,
    date: new Date(),
  });
  await order.save();
  order_payment.order_id = order._id;
  order_payment.is_payment_mode_cash = false;
  order_payment.is_payment_mode_card_on_delivery = false;
  order_payment.is_payment_mode_online_payment = true;
  await order_payment.save();

  console.log("ding_transfer:>>>>>> ", JSON.stringify(trf));
  try {
    dingResponse.create({
      dingResponse: trf,
      cartId: cart._id,
      orderId: order._id,
      paymentId: order_payment._id,
      ValidateOnly: false,
    });
  } catch (error) {
    console.log("error can be ignore as for analytic purpose only: ", error);
  }

  res.json({
    success: true,
    dingStatus,
    dingErrorCode,
    payment: payment_info.payment,
    message: "Recharge successfully!",
  });
};

exports.get_number = async function (req, res) {
  const { accountNumber } = req.body;
  const installation_setting = await getInstallationSettings();
  const api_key = installation_setting.DING_API_KEY;

  try {
    const lookup = await axios.get(
      `${API_URL}/GetAccountLookup?accountNumber=${accountNumber}`,
      {
        headers: {
          ...{
            "Content-Type": "application/json, text/plain, */*",
            api_key,
          },
        },
      }
    );
    // console.log('transfer :>> ', transfer);
    res.json({
      success: true,
      data: lookup.data,
    });
  } catch (error) {
    res.json({
      success: true,
      message: error.message,
    });
  }
};
