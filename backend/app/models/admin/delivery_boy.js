const mongoose = require("mongoose");
const schema = mongoose.Schema;
const autoIncrement = require("mongoose-auto-increment");
const delivery_boy = new schema(
  {
    unique_id: Number,
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  {
    strict: true,
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);


delivery_boy.plugin(autoIncrement.plugin, {
  model: "delivery_boy",
  field: "unique_id",
  startAt: 1,
  incrementBy: 1,
});
module.exports = mongoose.model("delivery_boy", delivery_boy);
