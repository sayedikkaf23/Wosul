var mongoose = require("mongoose");
var schema = mongoose.Schema;
require("../../utils/constants");

var loyaltyPoint = new schema(
  {
    type: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["valid", "expired"],
      default: "valid",
    },
    store_delivery_id: { type: schema.Types.ObjectId, ref: "delivery" },
    user_id: { type: schema.Types.ObjectId },
    order_payment_id: { type: schema.Types.ObjectId },
    amount: {
      type: Number,
      default: 0,
    },
    points: { type: Number, default: 0 },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    strict: true,
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("loyalty_point", loyaltyPoint);
