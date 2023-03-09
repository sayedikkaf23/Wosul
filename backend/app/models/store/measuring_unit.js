var mongoose = require("mongoose");
var schema = mongoose.Schema;

var measuring_unit = new schema({
  name: { type: String, default: "" },

  description: { type: String, default: "" },

  value: { type: String, default: "" },
});

module.exports = mongoose.model("measuring_unit", measuring_unit);

