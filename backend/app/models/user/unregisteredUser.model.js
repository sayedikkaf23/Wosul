const mongoose = require("mongoose");

module.exports = mongoose.model(
  "unregistered_user",
  new mongoose.Schema(
    {
      device_token: { type: String, default: "" },
      device_type: { type: String, default: "" },
      comments: { type: String, default: "unregistered_user" },
      is_received_in_app_notification: { type: Boolean, default: false },
    },
    {
      strict: true,
      timestamps: true,
    }
  )
);
