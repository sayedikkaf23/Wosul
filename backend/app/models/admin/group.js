var mongoose = require("mongoose");
var schema = mongoose.Schema;
var autoIncrement = require("mongoose-auto-increment");

var group = new schema(
  {
    group_name: { type: String, default: "" },
    users_phone: { type: Array, default: [] },
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

group.index({ group_name: 1}, { background: true });


module.exports = mongoose.model("group", group);
