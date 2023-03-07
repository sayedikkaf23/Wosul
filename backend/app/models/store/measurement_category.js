var mongoose = require("mongoose");
var schema = mongoose.Schema;

var measurement_category = new schema({
  name: { type: String, default: "" },

  description: { type: String, default: "" },

  value: { type: String, default: "" },
});

module.exports = mongoose.model("measurement_category", measurement_category);
