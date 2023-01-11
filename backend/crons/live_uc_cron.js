const cron = require("node-cron");
const FormData = require("form-data");
const axios = require("axios");
const Item = require("mongoose").model("item");
const util = require("util");

const log = (obj) => {
  console.log(
    util.inspect(obj, { showHidden: false, depth: null, colors: true })
  );
};

const update_price = async function () {
  //devlopment api
  // const API_URL = "https://uat.unioncoop.ae/onlinepartners/api/getAllProductPrice";
  //Live api
  const API_URL =
    "https://www.unioncoop.ae/onlinepartners/api/getAllProductPrice";
  console.log("cron called");

  const CRLF = "r\n";

  const form = new FormData();
  const options = {
    headers:
      CRLF +
      "--" +
      form.getBoundary() +
      CRLF +
      "username: ucs_yeepeey , password:HVqA3djFSCIT9BGe1PIE" +
      CRLF +
      CRLF,
    knownLength: 2,
  };

  form.append("branch_code", "17");
  form.append("last_updated_date", "2020-05-20 10:00:00");
  form.append("limit", "100");
  form.append("page", "1");

  const res = axios
    .post(API_URL, form, {
      headers: {
        ...{
          username: "ucs_yeepeey",
          password: "HVqA3djFSCIT9BGe1PIE",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        ...form.getHeaders(),
      },
    })
    .then((res) => {
      log(res.data);
      if (res["data"]["status"] == "success") {
        for (const prdct of res["data"]["price_data"]) {
          Item.updateMany(
            {
              unique_id_for_store_data: prdct.barcode,
              store_id: "5fa2c370071d9d33b9917ef4",
            },
            {
              $set: {
                price: prdct.price,
                offer_message_or_percentage: prdct.is_promotion_item,
              },
            }
          ).then((item_update_response) => {
            if (item_update_response) {
              console.log("item updated successfully");
            } else {
              console.log("item not updating: ", item_update_response);
            }
          });
        }
      }
    })
    .catch(function (error) {
      console.log(error);
    });

  // const { inventory_data } = response;

  // const products = inventory_data;
  // for (let i = 0; i < products.length; i++) {
  //   const prod = products[i];
  //   await updateBarcode(prod);
  // }
};

// product_inventory
const product_inventory = async function () {
  //devlopment api
  // const API_URL = "https://uat.unioncoop.ae/onlinepartners/api/getAllProductPrice";
  //Live api
  const API_URL =
    "https://www.unioncoop.ae/onlinepartners/api/getAllProductInventory";
  // console.log("cron called");

  const CRLF = "r\n";

  const form = new FormData();
  const options = {
    headers:
      CRLF +
      "--" +
      form.getBoundary() +
      CRLF +
      "username: ucs_yeepeey , password:HVqA3djFSCIT9BGe1PIE" +
      CRLF +
      CRLF,
    knownLength: 2,
  };

  form.append("branch_code", "17");
  form.append("last_updated_dWate", "2019-05-20 10:00:00");
  form.append("limit", "100");
  form.append("page", "1");

  const res = axios
    .post(API_URL, form, {
      headers: {
        ...{
          username: "ucs_yeepeey",
          password: "HVqA3djFSCIT9BGe1PIE",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        ...form.getHeaders(),
      },
    })
    .then((res) => {
      log(res.data);
      if (res["data"]["status"] == "success") {
        for (const prdct of res["data"]["inventory_data"]) {
          let in_stock = Number(prdct.qty) ? true : false;
          Item.updateMany(
            {
              unique_id_for_store_data: prdct.barcode,
              store_id: "5fa2c370071d9d33b9917ef4",
            },
            {
              $set: { is_item_in_stock: in_stock },
            }
          ).then((item_update_response) => {
            if (item_update_response) {
              console.log("item updated successfully");
            } else {
              console.log("item not updating: ", item_update_response);
            }
          });
        }
      }
    })
    .catch(function (error) {
      console.log(error);
    });

  // const { inventory_data } = response;

  // const products = inventory_data;
  // for (let i = 0; i < products.length; i++) {
  //   const prod = products[i];
  //   await updateBarcode(prod);
  // }
};

module.exports = (function () {
  /**
     *  # ┌────────────── second (optional)
        # │ ┌──────────── minute
        # │ │ ┌────────── hour
        # │ │ │ ┌──────── day of month
        # │ │ │ │ ┌────── month
        # │ │ │ │ │ ┌──── day of week
        # │ │ │ │ │ │
        # │ │ │ │ │ │
        # * * * * * *
     */

  const cronString = "*/30 * * * *";
  // const cronString = "*/1 * * * * *";
  const isValid = cron.validate(cronString);
  // console.log("isValid: ", isValid);

  cron.schedule(cronString, update_price, {
    scheduled: true,
  });

  cron.schedule(cronString, product_inventory, {
    scheduled: true,
  });

  update_price();
  product_inventory();
  console.log("6. Live UC cron started...");
  console.log("************************************");

  return this;
})();
