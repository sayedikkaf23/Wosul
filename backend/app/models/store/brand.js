var mongoose = require("mongoose");
var schema = mongoose.Schema;

var brand = new schema({
  name: { type: String, default: "" },

  description: { type: String, default: "" },

  value: { type: String, default: "" },
});

module.exports = mongoose.model("brand", brand);
