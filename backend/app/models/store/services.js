const mongoose = require("mongoose");
const schema = mongoose.Schema;
const service = new schema(
  {
    store_id: { type: schema.Types.ObjectId, default: null, ref: "store" },
    category_id: { type: schema.Types.ObjectId },
    name: { type: String, default: 0 },
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

module.exports = mongoose.model("store_service", service);
