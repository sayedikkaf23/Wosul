const mongoose = require("mongoose");
// const moment = require("moment-timezone");
const Item = require("../models/store/item");
const Setting = require("../models/admin/settings");

module.exports = (function () {
  this.getReportData = async (query) => {
    try {
      let data = [];
      switch (query.type) {
        case "items":
          {
            if (!query.store_id) throw new Error("Please pass store_id!");
            const setting = await Setting.findOne({});
            const limit =
              setting && setting.report_item_per_page
                ? setting.report_item_per_page
                : 999;
            const skip = ((query.page || 1) - 1) * limit;
            let opts = { store_id: mongoose.Types.ObjectId(query.store_id) };
            if (query.is_item_in_stock != undefined)
              opts.is_item_in_stock = query.is_item_in_stock;
            if (query.is_visible_in_store != undefined)
              opts.is_visible_in_store = query.is_visible_in_store;
            if (query.getAll) {
              data = await Item.find({
                store_id: mongoose.Types.ObjectId(query.store_id),
              })
                .select(
                  "name details image_url price is_item_in_stock is_visible_in_store unique_id_for_store_data store_id created_at"
                )
                .populate("store_id", "name")
                .lean();
            } else {
              data = await Item.find(opts)
                .skip(skip)
                .limit(limit)
                .select(
                  "name details image_url price is_item_in_stock is_visible_in_store unique_id_for_store_data store_id created_at"
                )
                .populate("store_id", "name")
                .lean();
            }
          }
          break;

        default:
          break;
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  return this;
})();
