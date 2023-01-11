const mongoose = require("mongoose");
const schema = mongoose.Schema;

const uploadCron = new schema(
  {
    unique_id: Number,
    filePath: { type: String, default: "", required: true },
    storeId: { type: schema.Types.ObjectId, default: "" },
    type: { type: String, default: "" },
  },
  {
    strict: true,
    timestamps: true,
  }
);

module.exports = mongoose.model("upload_cron", uploadCron);
