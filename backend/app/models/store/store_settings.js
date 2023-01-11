var mongoose = require("mongoose");
var schema = mongoose.Schema;

var userSettings = new schema(
  {
    storeId: { type: schema.Types.ObjectId, ref: "store" },
    
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    strict: true,
    timestamps: true,
  }
);

module.exports = mongoose.model("store_setting", userSettings);
