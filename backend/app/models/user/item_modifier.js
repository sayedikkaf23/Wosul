const mongoose = require("mongoose");
const schema = mongoose.Schema;
const autoIncrement = require("mongoose-auto-increment");
const item_modifier = new schema(
  {
    unique_id: Number,
    store_id: { type: schema.Types.ObjectId, default: null, ref: "store" },
    unique_id_for_store_data: { type: String },
    price: { type: Number, default: 0 },
    sequence: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    strict: true,
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

item_modifier.plugin(autoIncrement.plugin, {
  model: "item_modifier",
  field: "unique_id",
  startAt: 1,
  incrementBy: 1,
});
module.exports = mongoose.model("item_modifier", item_modifier);
