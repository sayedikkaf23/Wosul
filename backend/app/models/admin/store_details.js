const mongoose = require("mongoose");
const schema = mongoose.Schema;
const store_details = new schema(
  {
    store_id: { type: schema.Types.ObjectId },
    branch_name: { type: String, default: "" },
  },
  {
    strict: true,
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("store_details", store_details);
