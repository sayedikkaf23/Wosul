var mongoose = require("mongoose");
var schema = mongoose.Schema;

var discount = new schema({
  name: { type: String, default: "" },

  description: { type: String, default: "" },

  value: { type: String, default: "" },
});

module.exports = mongoose.model("discount", discount);
