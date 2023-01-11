const mongoose = require("mongoose");
// const moment = require("moment-timezone");
const Cart = require("../models/user/cart");

module.exports = (function () {
  this.getCart = async (cartId) => {
    return await Cart.aggregate([
      { $match: { _id: { $eq: cartId } } },
      { $unwind: "$order_details" },
      { $unwind: "$order_details.items" },
      {
        $lookup: {
          from: "items",
          localField: "order_details.items.unique_id",
          foreignField: "unique_id",
          as: "order_details.items.item_details",
        },
      },
      {
        $match: {
          $and: [
            {
              "order_details.items.item_details.is_item_in_stock": true,
            },
            {
              "order_details.items.item_details.is_visible_in_store": true,
            },
          ],
        },
      },
      {
        $unwind: "$order_details.items.item_details",
      },
      {
        $group: {
          _id: {
            order_id: "$_id",
            unique_id: "$order_details.unique_id",
          },
          items: { $push: "$order_details.items" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id.unique_id",
          foreignField: "unique_id",
          as: "_id.product_detail",
        },
      },
      {
        $match: {
          "_id.product_detail.is_visible_in_store": true,
        },
      },
      { $unwind: "$_id.product_detail" },
      {
        $project: {
          "order_detail.unique_id": "$_id.unique_id",
          "order_detail.product_detail": "$_id.product_detail",
          "order_detail.items": "$items",
        },
      },
      {
        $group: {
          _id: "$_id.order_id",
          order_details: { $push: "$order_detail" },
        },
      },
    ]);
  };

  return this;
})();
