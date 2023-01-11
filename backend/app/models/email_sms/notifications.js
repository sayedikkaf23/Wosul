var mongoose = require("mongoose");
var schema = mongoose.Schema;
var autoIncrement = require("mongoose-auto-increment");
var notifications = new schema({
  store_id: String,
  attr_name: String,
  attr_id: String,
  type: String,
  message: String,
  from: String,
  to: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
  is_read: { type: Boolean, default: false },
});

module.exports = mongoose.model("notifications", notifications);
