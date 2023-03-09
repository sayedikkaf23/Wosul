var mongoose = require("mongoose");
var schema = mongoose.Schema;

var modifier = new schema({
  name: { type: String, default: "" },

  description: { type: String, default: "" },

  price: { type: Number, default: 0 },
});

module.exports = mongoose.model("modifier", modifier);
