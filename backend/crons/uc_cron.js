const cron = require("node-cron");
const FormData = require("form-data");
const axios = require("axios");
const Item = require("mongoose").model("item");
const async = require("async");

const BASE_URL = process.env.UNION_COOP_URL;
const PASSWORD = process.env.UCS_PASSWORD;
const ITEMS_PER_PAGE = 1000;

console.log("NODE_ENV: " + process.env.NODE_ENV);
console.log("BASE_URL: " + BASE_URL);

const syncWait = (ms) => {
  const end = Date.now() + ms;
  while (Date.now() < end) continue;
};

const updateProductPricesInDB = async (data) => {
  await async.eachSeries(data, (prdct, callback) => {
    try {
      syncWait(1000);

      console.log(`barcode: price - ${prdct.barcode} : ${prdct.price}`);

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
      ).then((item) => {
        if (item && item.modifiedCount) {
          console.log("Price updated! price: " + prdct.price);
        }
        callback();
      });
    } catch (error) {
      console.log(
        "updateProductPricesInDB: item update failed." + error.message
      );
    }
  });
};

/**
 * Main function to update product price in DB
 * @param {number} page
 */
const update_price = async function (page, reachedLastPage) {
  // const API_URL = `${BASE_URL}/onlinepartners/api/getAllProductPrice`;
  const API_URL = `${BASE_URL}/rest/V1/onlinepartners/api/getAllProductPrice`;

  console.log("update_price called for page ->  " + page);

  const form = new FormData();

  form.append("branch_code", "17");
  form.append("last_updated_date", "2020-05-20 10:00:00");
  form.append("limit", ITEMS_PER_PAGE);
  form.append("page", page);

  const options = {
    headers: {
      ...{
        username: "ucs_yeepeey",
        password: PASSWORD,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      ...form.getHeaders(),
    },
  };

  try {
    const res = await axios.post(API_URL, form, options);
    if (res && res.data && res.data.status === "success") {
      await updateProductPricesInDB(res.data.price_data);

      if (res.data.price_data.length < ITEMS_PER_PAGE) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.log("error:product_inventory ", error);
  }
};

/**
 * Product In Stock update methods below ----------------------------------------------------
 */

const updateStocksInDB = async (data) => {
  await async.eachSeries(data, (prdct, callback) => {
    try {
      let in_stock = Number(prdct.qty) ? true : false;

      syncWait(1000);

      console.log(`barcode: qty - ${prdct.barcode} : ${prdct.qty}`);

      Item.updateMany(
        {
          unique_id_for_store_data: prdct.barcode,
          store_id: "5fa2c370071d9d33b9917ef4",
        },
        { $set: { is_item_in_stock: in_stock } }
      ).then((item) => {
        if (item && item.modifiedCount) {
          console.log("updateStocks: item updated. in_stock: " + in_stock);
        }
        callback();
      });
    } catch (error) {
      console.log("updateStocks: item update fa." + error.message);
    }
  });
};

/**
 * Main function to fetch per page product and update the stocks in DB
 * @param {Number} page
 */
const product_inventory = async function (page = 1) {
  // const API_URL = `${BASE_URL}/onlinepartners/api/getAllProductInventory`;
  const API_URL = `${BASE_URL}/rest/V1/onlinepartners/api/getAllProductInventory`;

  console.log("product_inventory called for page -> " + page);

  const form = new FormData();

  form.append("branch_code", "17");
  form.append("last_updated_date", "2019-05-20 10:00:00");
  form.append("limit", ITEMS_PER_PAGE);
  form.append("page", page);

  const options = {
    headers: {
      ...{
        username: "ucs_yeepeey",
        password: PASSWORD,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      ...form.getHeaders(),
    },
  };

  try {
    const res = await axios.post(API_URL, form, options);
    if (res && res.data && res.data.status === "success") {
      await updateStocksInDB(res.data.inventory_data);

      console.log("ran updateStocksInDB");

      if (res.data.inventory_data.length < ITEMS_PER_PAGE) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.log("error:product_inventory ", error);
    return false;
  }
};

/**
 * Cron function for Product in stock update
 */
const updateProductStockPerPage = async () => {
  let page = 1;
  let reachedLastPage = false;

  while (page <= 200 && !reachedLastPage) {
    try {
      reachedLastPage = await product_inventory(page);
    } catch (error) {
      console.log("error:while:product_inventory " + page);
    }
    page++;
  }
};

/**
 * Cron function for Product price update
 */
const updateProductPricePerPage = async () => {
  let page = 1;
  let reachedLastPage = false;

  while (page <= 200 && !reachedLastPage) {
    try {
      reachedLastPage = await update_price(page);
    } catch (error) {
      console.log("error:while:update_price for page: " + page);
    }
    page++;
  }
};

/**
 *
 * Entry point below ---------------------------------------------------------
 *
 */

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

  // cron.schedule(cronString, updateProductPricePerPage, {
  //   scheduled: true,
  // });

  // cron.schedule(cronString, updateProductStockPerPage, {
  //   scheduled: true,
  // });

  updateProductPricePerPage();
  updateProductStockPerPage();
  console.log("6. Staging UC cron started...");
  console.log("************************************");

  return this;
})();
