var mongoose = require("mongoose");
var schema = mongoose.Schema;
var autoIncrement = require("mongoose-auto-increment");
var cart = new schema(
  {
    unique_id: Number,
    cart_unique_token: { type: String, default: "" },
    user_id: { type: schema.Types.ObjectId, ref: "user" },
    user_type: { type: Number, default: 7 },
    user_type_id: { type: schema.Types.ObjectId },
    user_address_id: { type: schema.Types.ObjectId, default: null },
    store_id: { type: schema.Types.ObjectId, default: null, ref: "store" },
    order_payment_id: { type: schema.Types.ObjectId, default: null },
    order_id: { type: schema.Types.ObjectId },
    city_id: { type: schema.Types.ObjectId },
    total_item_tax: { type: Number, default: 0 },
    delivery_type: { type: Number, default: 1 },
    is_ramadan_order: { type: Boolean, default: false },
    is_user_complete_order: { type: Boolean, default: false },
    substitute: { type: Boolean, default: false },
    pickup_addresses: { type: Array, default: [] },
    destination_addresses: { type: Array, default: [] },
    order_details: { type: Array, default: [] },
    // original_items: { type: Array, default: [] },
    total_item_count: { type: Number, default: 0 },
    total_cart_price: { type: Number, default: 0 },
    customer_replacement_reason: { type: String, default: "" },
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
    versionKey: false,
  }
);

cart.index({ cart_unique_token: 1 }, { background: true });

cart.plugin(autoIncrement.plugin, {
  model: "cart",
  field: "unique_id",
  startAt: 1,
  incrementBy: 1,
});
module.exports = mongoose.model("cart", cart);
