var mongoose = require("mongoose");
var schema = mongoose.Schema;
var autoIncrement = require("mongoose-auto-increment");

var item = new schema(
  {
    unique_id: Number,
    store_id: { type: schema.Types.ObjectId, ref: "store" },

    substitute_items: { type: Array, default: [] },
    current_substitute_item_id: { type: String, default: null },
    current_substitute_item_unique_id: Number,

    product_id: { type: schema.Types.ObjectId },
    super_item_id: { type: schema.Types.ObjectId, default: null },
    details: { type: String, default: "" },
    details_1: { type: String, default: "" },
    name: { type: String, default: "" },
    price: { type: Number, default: 0 },
    purchase_cost: { type: Number, default: 0 },  
    item_price_without_offer: { type: Number, default: 0 },
    discount_percentage: { type: Number, default: 0 },
    discount_value: { type: Number, default: 0 },
    offer_message_or_percentage: { type: String, default: "" },
    total_quantity: { type: Number, default: 0 },
    in_cart_quantity: { type: Boolean, default: false },
    total_added_quantity: { type: Number, default: 0 },
    total_used_quantity: { type: Number, default: 0 },
    sequence_number: { type: Number, default: 0 },
    note_for_item: { type: String, default: "" },
    unique_id_for_store_data: { type: String, default: "0" },
    is_item_in_stock: { type: Boolean, default: true },
    is_most_popular: { type: Boolean, default: false },
    is_visible_in_store: { type: Boolean, default: true },

    is_recommend_in_store: { type: Boolean, default: false },
    is_express_in_delivery: { type: Boolean, default: false },

    // tax: { type: Number, default: 0 },
    specifications_unique_id_count: { type: Number, default: 0 },
    item_score: { type: Number, default: 0 },
    search_score: { type: Number, default: 0 },
    order_score: { type: Number, default: 0 },
    specifications: { type: Array, default: [] },

    image_url: { type: Array, default: [] },
    tags: { type: String, default: "" },
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

item.index({ store_id: 1, product_id: 1, name: 1 }, { background: true });
item.index({ store_id: 1, product_id: 1, _id: 1 }, { background: true });
item.index({ sequence_number: 1 }, { background: true });
// item.index({ name: 1 }, { background: true });
item.index(
  { user_id: 1, is_user_show_invoice: 1, order_status: 1 },
  { background: true }
);

item.plugin(autoIncrement.plugin, {
  model: "item",
  field: "unique_id",
  startAt: 1,
  incrementBy: 1,
});

module.exports = mongoose.model("item", item);
