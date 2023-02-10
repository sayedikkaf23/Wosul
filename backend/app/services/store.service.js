const mongoose = require("mongoose");
const product = require("../models/store/product");
const category = require("../models/store/category");
const Store = require("../models/store/store");
const Delivery = require("../models/admin/delivery");
const Service = require("../models/store/services");

module.exports = (function () {
  this.bulkInsertCategoriesAndSubCategories = async (store) => {
    let delivery = await Delivery.findById({ _id: store.store_delivery_id });

    let demoStore = await Store.findById(delivery?.base_store_id);

    if (delivery?.delivery_name === "Restaurant") {
      this.addStoreServices(store);
    }
    // switch (delivery.delivery_name) {
    //   // case "Groceries":
    //   //   demoStore = await Store.findById("63cfba7cabf7b90cc27b5a32");
    //   //   break;
    //   case "Pet Shop":
    //     demoStore = await Store.findById("63d0b764e06d66cb4fe3061d");
    //     break;
    //   case "Flowers":
    //     demoStore = await Store.findById("63d0b936fa45a3775184f44f");
    //     break;
    //   case "Organic":
    //     demoStore = await Store.findById("63d0b9e93515a952cb59f64e");
    //     break;
    //   case "Restaurant":
    //     demoStore = await Store.findById("63cfba7cabf7b90cc27b5a32");
    //     this.addStoreServices(store);
    //     break;
    // }
    const cats = await category.find({ store_id: demoStore._id });
    if (cats && cats.length) {
      cats.forEach(async (cat) => {
        const products = await product.find({
          category_id: cat._id,
          store_id: demoStore._id,
        });
        let categry = cat.toJSON();
        delete categry._id;
        delete categry.unique_id;
        categry.store_id = store._id;

        await category.create(categry);

        products.forEach(async (prod) => {
          const newProd = prod.toJSON();
          delete newProd._id;
          delete newProd.unique_id;
          newProd.store_id = store._id;
          const prodct = await product.create(newProd);
        });
      });
    }
  };

  this.addStoreServices = async (store) => {
    if (store) {
      Service.insertMany([
        { name: "DINE IN", store_id: store._id, isActive: true },
        { name: "TAKE AWAY", store_id: store._id, isActive: true },
        { name: "DELIVERY", store_id: store._id, isActive: true },
        { name: "DELIVERY THROUGH", store_id: store._id, isActive: true },
      ]);
    }
  };

  return this;
})();
