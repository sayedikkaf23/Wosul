const mongoose = require("mongoose");
const xlsx = require("node-xlsx");
const fs = require("fs");
// const ObjectId = mongoose.Types.ObjectId;
const { asyncForEach } = require("../../helpers/utils.helper");
const { getStoreCountBasedOnLocation } = require("../../services/user.service");
const Category = require("../../models/store/category");
const Product = require("../../models/store/product");
const Item = require("../../models/store/item");
const User = require("../../models/user/user");
const UserSetting = require("../../models/user/user_setting");
const { user_register } = require("./user");

module.exports = (function () {
  this.getHomePageItemList = async (req, res, next) => {
    try {
      const { latitude, longitude, limit: lmt = 20 } = req.body;
      let { stores } = await getStoreCountBasedOnLocation(latitude, longitude);
      stores = stores.filter((s) => s.show_items_home_page);
      let data = [];
      await asyncForEach(stores, async (store) => {
        let items = [];
        const category = await Category.findOne({
          show_items_home_page: true,
          store_id: store._id,
        }).lean();
        if (category) {
          const product = await Product.findOne({
            category_id: category._id,
          }).lean();
          if (product) {
            items = await Item.find({ product_id: product._id })
              .sort("-order_score")
              .limit(lmt)
              .lean();
          } else {
            items = await getHomePageItems({
              store_id: store._id,
              limit: 20,
            });
          }
        } else {
          items = await getHomePageItems({
            store_id: store._id,
            limit: 20,
          });
        }
        data = data.concat({
          name: category && category.name ? category.name : "",
          sub_title: category && category.sub_title ? category.sub_title : "",
          items,
        });
      });
      res.json({ status: true, data });
    } catch (error) {
      res.json({
        success: false,
        error_message: error.message || "Something went wrong!",
      });
    }
  };

  this.bulkRegister = async (req, res, next) => {
    try {
      const body = req.body;
      if (!req.files.length) {
        throw new Error("please attach file to upload.");
      }
      const [file] = req.files;
      const [obj] = xlsx.parse(fs.readFileSync(file.path));
      if (obj.data.length > 1) {
        const [title] = obj.data;
        const list = [];
        const error = [];
        const userSettingList = [];
        const userSettingError = [];
        await asyncForEach(obj.data, async (user, idx) => {
          if (idx !== 0) {
            const phone = user[3] || user[4] || "";
            const payload = {
              address: "",
              app_version: "2.0.65",
              city: "dubai",
              is_email_verified: "false",
              last_name: "",
              device_type: "android",
              cart_unique_token: "",
              social_id: "",
              password: user[5],
              phone: phone.replace(/ /g, ""),
              country_phone_code: "+971",
              device_token: "",
              referral_code: "",
              is_phone_number_verified: "true",
              first_name: user[0],
              login_by: "manual",
              email: user[2],
              country_id: "5d6791abc01cf5683d14c418",
            };
            const response = await new Promise((res, rej) => {
              try {
                res({ success: true });
                // user_register({ body:payload }, { json: (data) => res(data) });
              } catch (error) {
                rej(error);
              }
            }).catch((err) => {
              console.log("err: ", err);
              error.push({
                email: "",
                err,
              });
            });
            if (response.success) {
              console.log("response.success: " + response.success);
              let user = await User.findOne({ email: payload.email });
              if (body.addWallet) {
                if (user) {
                  user.wallet = body.addWallet ? body.addWallet : 10;
                  user.max_wallet_usage = body.addWallet ? body.addWallet : 10;
                  await user.save();
                }
              }
              console.log(
                "Number(body.addUserSetting): " + Number(body.addUserSetting)
              );
              if (!isNaN(Number(body.addUserSetting))) {
                if (user) {
                  console.log("user: ", user.email);
                  try {
                    userSettingList.push(
                      await UserSetting.create({
                        userId: user._id,
                        free_delivery: true,
                        free_delivery_amount: body.addUserSetting
                          ? Number(body.addUserSetting)
                          : 25,
                      })
                    );
                  } catch (e) {
                    userSettingError.push(e);
                  }
                }
              }
              list.push(response);
            } else {
              error.push({ ...response, email: body.email, phone: body.phone });
            }
          }
        });
        return res.json({
          userSettingList,
          userSettingError,
          list,
          error,
          status: true,
        });
      } else {
        throw new Error("Data not found, are you using correct format sheet?");
      }

      res.json({
        status: true,
      });
    } catch (e) {
      console.log("e: ", e);
      res.json({
        status: false,
        message: e.message,
      });
    }
  };
  return this;
})();
