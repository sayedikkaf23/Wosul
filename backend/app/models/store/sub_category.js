var mongoose = require("mongoose");
var schema = mongoose.Schema;
var autoIncrement = require("mongoose-auto-increment");
require("../../utils/constants");

var sub_category = new schema(
  {
    unique_id: Number,
    name: { type: String, default: "" },
    details: { type: String, default: "" },
    image_url: { type: String, default: "" },
    is_visible_in_store: { type: Boolean, default: false },
    main_category_id: { type: schema.Types.ObjectId, default: null },
    sequence_number: { type: Number, default: 0 },
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

sub_category.plugin(autoIncrement.plugin, {
  model: "sub_category",
  field: "unique_id",
  startAt: 1,
  incrementBy: 1,
});
module.exports = mongoose.model("sub_category", sub_category, "sub_category");
