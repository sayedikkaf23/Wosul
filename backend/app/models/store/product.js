var mongoose = require("mongoose");
var schema = mongoose.Schema;
var autoIncrement = require("mongoose-auto-increment");
require("../../utils/constants");

var product = new schema(
  {
    unique_id: Number,
    name: { type: String, default: "" },
    is_visible_in_store: { type: Boolean, default: false },
    is_price_updatable: { type: Boolean, default: false },
    is_include_offers: { type: Boolean, default: false },
    is_include_relevant_products: { type: Boolean, default: false },
    store_id: { type: schema.Types.ObjectId },
    category_id: { type: schema.Types.ObjectId, ref: "category" },
    super_product_id: { type: schema.Types.ObjectId, default: null },
    unique_id_for_store_data: { type: Number, default: 0 },
    sequence_number: { type: Number, default: 0 },
    search_id: { type: Number, default: 0 },
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

product.index({ franchise_product_id: 1 }, { background: true });
product.index({ store_id: 1 }, { background: true });

product.plugin(autoIncrement.plugin, {
  model: "product",
  field: "unique_id",
  startAt: 1,
  incrementBy: 1,
});
module.exports = mongoose.model("product", product);
