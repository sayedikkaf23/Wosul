var mongoose = require("mongoose");
var schema = mongoose.Schema;
var autoIncrement = require("mongoose-auto-increment");
require("../../utils/constants");

var category = new schema(
  {
    unique_id: Number,
    name: { type: String, default: "" },
    sub_title: { type: String, default: "" },
    is_visible_in_store: { type: Boolean, default: false },
    is_special_category: { type: Boolean, default: false },
    store_id: { type: schema.Types.ObjectId },
    unique_id_for_store_data: { type: Number, default: 0 },
    sequence_number: { type: Number, default: 0 },
    image_url: { type: String, default: "" },
    //show Items in home page based on store selection
    show_items_home_page : { type: Boolean, default: false },
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

category.index({ franchise_product_id: 1 }, { background: true });
category.index({ store_id: 1 }, { background: true });

category.plugin(autoIncrement.plugin, {
  model: "category",
  field: "unique_id",
  startAt: 1,
  incrementBy: 1,
});
module.exports = mongoose.model("category", category);
