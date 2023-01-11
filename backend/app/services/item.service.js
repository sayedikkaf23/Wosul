const mongoose = require("mongoose");
// const moment = require("moment-timezone");
const Item = require("../models/store/item");

module.exports = (function () {
  this.fixItemsImgSpace = (items) => {
    return items.map((i) => {
      const { image_url = [] } = i;
      i.image_url = this.fixImgSpace(image_url);
      return i;
    });
  };

  this.fixImgSpace = (url) => {
    if (Array.isArray(url)) {
      return url.map((img) => img.replace(/ /g, "%20"));
    } else {
      return url.replace(/ /g, "%20");
    }
  };

  this.autoCompleteSearchItems = async ({
    search_value,
    page,
    number_of_rec,
    store_id,
    skip,
  }) => {
    let pfLength = 3;
    // const TOTAL_INDEX_LEN = 20;
    const TOTAL_INDEX_LEN = 10;
    skip = (page - 1) * number_of_rec;
    if (/\s/g.test(search_value) && search_value.length > 6) {
      pfLength = 5;
    }
    if (search_value.length > 3) {
      pfLength = search_value.length - 2;
    }
    if (search_value.length >= 20) {
      pfLength = TOTAL_INDEX_LEN - 2;
    }
    console.log("pfLength: " + pfLength);
    const searchCondition = {
      $search: {
        autocomplete: {
          query: `${search_value}`,
          path: "tags",
          fuzzy: {
            maxEdits: 2,
            prefixLength: pfLength,
          },
        },
      },
    };
    return await this.searchItems({
      searchCondition,
      search_value,
      page,
      number_of_rec,
      store_id,
      skip,
    });
  };

  this.searchItems = async ({
    searchCondition,
    search_value,
    page,
    number_of_rec,
    store_id,
    skip,
  }) => {
    if (number_of_rec <= 0) {
      return [];
      return;
    }
    skip = (page - 1) * number_of_rec;
    searchCondition = searchCondition
      ? searchCondition
      : {
          $match: {
            name: { $regex: new RegExp("^" + search_value.toLowerCase(), "i") },
          },
        };

    return await Item.aggregate([
      searchCondition,
      {
        $match: {
          store_id: { $eq: mongoose.Types.ObjectId(store_id) },
          price: { $ne: 0 },
          is_visible_in_store: { $eq: true },
          is_item_in_stock: { $eq: true },
        },
      },
      // { $match: { is_visible_in_store: { $eq: true } } },
      // {
      //   $match: { store_id: { $eq: mongoose.Types.ObjectId(store_id) } },
      // },
      // { $match: { is_item_in_stock: { $eq: true } } },
      // {
      //   $match: { store_id: { $eq: mongoose.Types.ObjectId(store_id) } },
      // },
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
        $lookup: {
          from: "categories",
          localField: "product_detail.category_id",
          foreignField: "_id",
          as: "category_details",
        },
      },
      { $unwind: "$category_details" },
      { $sort: { "product_detail.search_id": -1 } },
      {
        $skip: skip,
      },
      {
        $limit: number_of_rec,
      },
    ]);
  };

  return this;
})();
