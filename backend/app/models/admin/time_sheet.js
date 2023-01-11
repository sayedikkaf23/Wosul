var mongoose = require("mongoose");
var schema = mongoose.Schema;
// var autoIncrement = require('mongoose-auto-increment');
var time_sheet = new schema(
  {
    admin_id: { type: schema.Types.ObjectId },
    is_play: { type: Boolean, default: false },
    is_pause: { type: Boolean, default: false },
    date: { type: String, default: "" },
    play: { type: Array, default: [] },
    pause: { type: Array, default: [] },
    duration: { type: Number, default: 0 },
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

time_sheet.index({ admin_id: 1 }, { background: true });
time_sheet.index({ created_at: 1 }, { background: true });
module.exports = mongoose.model("time_sheet", time_sheet);
