var mongoose = require("mongoose");
var schema = mongoose.Schema;
var autoIncrement = require("mongoose-auto-increment");

var delivery = new schema(
  {
    unique_id: Number,
    delivery_name: { type: String, default: "" },
    description: { type: String, default: "" },
    image_url: { type: String, default: "" },
    icon_url: { type: String, default: "" },
    map_pin_url: { type: String, default: "" },
    delivery_type_id: { type: schema.Types.ObjectId },
    delivery_type: { type: Number, default: 1 },
    is_business: { type: Boolean, default: false },
    is_deiveries_new: { type: Boolean, default: true },
    is_deliveries_subtitle: { type: String, default: "" },
    sequence_number: { type: Number, default: 0 },
    famous_products_tags: [{ type: String, default: [] }],
    base_store_id: { type: schema.Types.ObjectId },
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

delivery.index({ is_business: 1 }, { background: true });
delivery.index({ sequence_number: 1 }, { background: true });

delivery.plugin(autoIncrement.plugin, {
  model: "delivery",
  field: "unique_id",
  startAt: 1,
  incrementBy: 1,
});
module.exports = mongoose.model("delivery", delivery);
