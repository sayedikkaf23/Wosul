var mongoose = require("mongoose");
var schema = mongoose.Schema;
var autoIncrement = require("mongoose-auto-increment");

var user_favourite_address = new schema(
  {
    unique_id: Number,
    user_id: { type: schema.Types.ObjectId },

    title: { type: String, default: "" },
    icon : { type: String, default: "" },
    appartmentno: { type: String, default: "" },
    landmark: { type: String, default: "" },
    country: { type: String, default: "" },
    city1: { type: String, default: "" },
    address: { type: String, default: "" },
    country_code_2: { type: String, default: "" },
    city2: { type: String, default: "" },
    country_code: { type: String, default: "" },
    city3: { type: String, default: "" },
    is_default_address: { type: Boolean, default: false },

    building_no: { type: String, default: "" },

    location: [
      {
        type: Number,
        index: "2dsphere",
      },
    ],

    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    strict: true,
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

user_favourite_address.plugin(autoIncrement.plugin, {
  model: "user_favourite_address",
  field: "unique_id",
  startAt: 1,
  incrementBy: 1,
});
module.exports = mongoose.model(
  "user_favourite_address",
  user_favourite_address
);
