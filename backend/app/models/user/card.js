var mongoose = require("mongoose");
var schema = mongoose.Schema;
var autoIncrement = require("mongoose-auto-increment");
var card = new schema(
  {
    unique_id: Number,
    payment_token: { type: String, default: "" },
    card_type: { type: String, default: "" },
    expiry_month: { type: String, default: "" },
    expiry_year: { type: String, default: "" },
    card_holder_name: { type: String, default: "" },
    card_number: { type: String, default: "" },
    is_default: { type: Boolean, default: false },
    is_card_verified: { type: Boolean, default: false },
    instrument_id: { type: String, default: "" },
    user_id: { type: schema.Types.ObjectId },

    user_type: Number,
    customer_id: { type: String, default: "" },
    // payment_id: {type: schema.Types.ObjectId},
    is_default: { type: Boolean, default: false },
    last_four: { type: String, default: "" },
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

card.index({ user_id: 1, user_type: 1 }, { background: true });
card.index({ user_id: 1, payment_id: 1, is_default: 1 }, { background: true });

card.plugin(autoIncrement.plugin, {
  model: "card",
  field: "unique_id",
  startAt: 1,
  incrementBy: 1,
});
module.exports = mongoose.model("card", card);
