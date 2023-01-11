var mongoose = require("mongoose");
var schema = mongoose.Schema;
require("../../utils/constants");

var dingResponse = new schema(
  {
    cartId: { type: schema.Types.ObjectId },
    orderId: { type: schema.Types.ObjectId },
    paymentId: { type: schema.Types.ObjectId },
    dingResponse: Object,
    ValidateOnly: Boolean,
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

module.exports = mongoose.model("ding_response", dingResponse);
