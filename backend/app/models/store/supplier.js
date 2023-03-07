var mongoose = require("mongoose");
var schema = mongoose.Schema;

var supplier = new schema({
  name: { type: String, default: "" },

  description: { type: String, default: "" },

  value: { type: String, default: "" },
});

module.exports = mongoose.model("supplier", supplier);
