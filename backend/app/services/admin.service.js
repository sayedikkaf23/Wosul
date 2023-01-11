const mongoose = require("mongoose");
const Item = require("../models/store/item");

module.exports = (function () {
  this.updateItemDescAndVat = async (array_of_data, store_id) => {
    let items = array_of_data.filter((data) => data.length > 0);
    items.shift();
    items.forEach(async (itm) => {
      let updateObj = {
        name: itm[1],
        price: itm[2],
        details: itm[3],
        details_1: itm[5],
        item_price_without_offer: itm[6],
      };
      if (itm[4] != null && itm[4] != undefined) {
        updateObj.tax = itm[4];
      }
      if (itm[7] && ["yes", "no"].includes(itm[7])) {
        updateObj.is_item_in_stock = itm[7] === "yes" ? true : false;
      }
      //   console.log("updateObj" + JSON.stringify(updateObj));
      Item.updateMany(
        { unique_id_for_store_data: itm[0], store_id: store_id },
        { $set: updateObj }
      ).then((update_resp) => {
        if (update_resp) {
          console.log("item updated successfully");
        } else {
          console.log("item not updated");
        }
      });
    });
  };

  return this;
})();
