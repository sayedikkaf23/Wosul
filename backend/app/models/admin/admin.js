var mongoose = require("mongoose");
var schema = mongoose.Schema;
var autoIncrement = require("mongoose-auto-increment");
var admin = new schema(
  {
    unique_id: Number,
    store_id: { type: schema.Types.ObjectId },
    username: { type: String, default: "" },
    subscription : { type: Array, default: [] },
    password: { type: String, default: "" },
    server_token: { type: String, default: "" },
    email: { type: String, default: "" },
    urls: [{ type: String, default: "" }],
    admin_type: Number,
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

admin.index({ email: 1, admin_type: 1 }, { background: true });
admin.index({ username: 1, password: 1 }, { background: true });
admin.index({ email: 1, password: 1 }, { background: true });

admin.plugin(autoIncrement.plugin, {
  model: "admin",
  field: "unique_id",
  startAt: 1,
  incrementBy: 1,
});
module.exports = mongoose.model("admin", admin);
