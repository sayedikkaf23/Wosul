var mongoose = require("mongoose");
var schema = mongoose.Schema;

var ftp_server_details = new schema(
  {
    store_id: { type: schema.Types.ObjectId, ref: "store" },
    host: { type: String, default: "" },
    port: { type: Number, default: 0 },
    user: { type: String, default: "" },
    password: { type: String, default: "" },
    filter: {
      type: Object,
    },
    header_details: { type: Array },
  },
  {
    strict: true,
    timestamps: true,
  }
);

module.exports = mongoose.model("ftp_server_details", ftp_server_details);
