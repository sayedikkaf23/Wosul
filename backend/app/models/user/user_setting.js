var mongoose = require("mongoose");
var schema = mongoose.Schema;

var userSettings = new schema(
  {
    userId: { type: schema.Types.ObjectId },
    free_delivery: { type: Boolean, default: false },
    free_delivery_amount: { type: Number, default: 50 },
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

module.exports = mongoose.model("user_setting", userSettings);
