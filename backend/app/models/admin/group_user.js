var mongoose = require("mongoose");
var schema = mongoose.Schema;
var autoIncrement = require("mongoose-auto-increment");

var group_user = new schema(
  {
    group_name: { type: String, default: "" },
    group_id: { type: String, default: "" },
    user_id: { type: String, default: "" },
    phone: { type: String, default: "" },
    
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

group_user.index({ group_name: 1}, { background: true });


module.exports = mongoose.model("group_user", group_user);
