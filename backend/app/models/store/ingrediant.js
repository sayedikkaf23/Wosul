var mongoose = require("mongoose");
var schema = mongoose.Schema;

var ingrediant = new schema({
  name: { type: String, default: "" },

  description: { type: String, default: "" },

  value: { type: String, default: "" },

  purchase_price: { type: Number, default: 0 },

  sale_price: { type: Number, default: 0 },

  default_sale_price: { type: Number, default: 0 },
});

module.exports = mongoose.model("ingrediant", ingrediant);
