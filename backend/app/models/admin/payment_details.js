const mongoose = require("mongoose");
const schema = mongoose.Schema;
const autoIncrement = require("mongoose-auto-increment");
const payment_details = new schema(
  {
    unique_id: Number,
    payment_response: { type: Object },
    order_payment_id: { type: String, default: "" },
    cart_id: { type: String, default: "" },
    checkout_amount: { type: Number, default: 0 },
    instrument_id: { type: String, default: "" },   
  },
  {
    strict: true,
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);


payment_details.plugin(autoIncrement.plugin, {
  model: "payment_details",
  field: "unique_id",
  startAt: 1,
  incrementBy: 1,
});
module.exports = mongoose.model("payment_details", payment_details);
