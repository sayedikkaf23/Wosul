require("../utils/message_code");
require("../utils/error_code");
require("../utils/constants");
var utils = require("../utils/utils");
var Advertise = require("mongoose").model("advertise");
var Country = require("mongoose").model("country");
var mongoose = require("mongoose");
var console = require("../utils/console");

//add_advertise
exports.add_advertise = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      request_data_body.store_id = request_data.query.store_id
      console.log('request_data_body.store_id :>> '+ typeof request_data_body.store_id);
      if(
        (request_data_body.is_ads_redirect_to_store == 'true' && request_data_body.store_id == "" ) || 
        request_data_body.city_id == "" || 
        request_data_body.country_id == "" || 
        request_data_body.store_delivery_id == "" ||
        request_data_body.ads_for == "null"
        ){
        let msg = request_data_body.country_id == "" ? "Plase select Country" :
        request_data_body.city_id == "" ? "Plase select City" :
        request_data_body.ads_for == "null" ? "Please Select Ads for" :
        request_data_body.store_id == "" ? "Please Select Store"
        : "Plase select Delivery"
        response_data.json({
          success : false,
          message : msg
        })
        return
      }
      if(request_data_body.is_ads_redirect_to_store == 'false'){
        request_data_body.store_id = null
      }
      var advertise = new Advertise(request_data_body);
      var image_file = request_data.files;
      if (image_file != undefined && image_file.length > 0) {
        var image_name = advertise._id + utils.generateServerToken(4);
        var url =
          utils.getStoreImageFolderPath(FOLDER_NAME.ADS_MOBILE_IMAGES) +
          image_name +
          FILE_EXTENSION.ADS;
        advertise.image_url = url;
        advertise.image_for_mobile = url;
        advertise.image_for_banner = url;
        utils.storeImageToFolder(
          image_file[0].path,
          image_name + FILE_EXTENSION.ADS,
          FOLDER_NAME.ADS_MOBILE_IMAGES
        );
        // advertise.save();
      }
      advertise.save().then(
        () => {
          response_data.json({
            success: true,
            message: ADS_MESSAGE_CODE.ADS_ADD_SUCCESSFULLY,
          });
        },
        (error) => {
          console.log(error);
          response_data.json({
            success: false,
            error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
          });
        }
      );
    } else {
      response_data.json(response);
    }
  });
};

/// advertise_list
exports.advertise_list = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      var advertise_array = {
        $lookup: {
          from: "advertises",
          localField: "_id",
          foreignField: "country_id",
          as: "advertises_detail",
        },
      };

      Country.aggregate([advertise_array]).then(
        (countries) => {
          if (countries.length == 0) {
            response_data.json({
              success: false,
              error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND,
            });
          } else {
            response_data.json({
              success: true,
              message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
              countries: countries,
            });
          }
        },
        (error) => {
          console.log(error);
          response_data.json({
            success: false,
            error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
          });
        }
      );
    } else {
      response_data.json(response);
    }
  });
};

// delete_advertise
exports.delete_advertise = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      Advertise.deleteOne({ _id: request_data_body.advertise_id }).then(
        () => {
          response_data.json({
            success: true,
            message: ADS_MESSAGE_CODE.ADS_DELETE_SUCCESSFULLY,
          });
        },
        (error) => {
          console.log(error);
          response_data.json({
            success: false,
            error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
          });
        }
      );
    } else {
      response_data.json(response);
    }
  });
};

// change_advertise_visibility
exports.change_advertise_visibility = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      Advertise.findOne({ _id: request_data_body.advertise_id }).then(
        (advertise_detail) => {
          if (advertise_detail) {
            advertise_detail.is_ads_visible = request_data_body.is_ads_visible;
            advertise_detail.save();
            response_data.json({
              success: true,
              message: CARD_MESSAGE_CODE.CARD_DELETE_SUCCESSFULLY,
            });
          } else {
            response_data.json({
              success: false,
              error_code: CARD_ERROR_CODE.CARD_DELETE_FAILED,
            });
          }
        },
        (error) => {
          console.log(error);
          response_data.json({
            success: false,
            error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
          });
        }
      );
    } else {
      response_data.json(response);
    }
  });
};

// update_advertise
exports.update_advertise = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      Advertise.findOneAndUpdate(
        { _id: request_data_body.advertise_id },
        request_data_body,
        { new: true }
      ).then(
        (advertise_detail) => {
          if (advertise_detail) {
            var image_file = request_data.files;
            if (image_file != undefined && image_file.length > 0) {
              utils.deleteImageFromFolder(
                advertise_detail.image_url,
                FOLDER_NAME.ADS_MOBILE_IMAGES
              );
              var image_name =
                advertise_detail._id + utils.generateServerToken(4);
              var url =
                utils.getStoreImageFolderPath(FOLDER_NAME.ADS_MOBILE_IMAGES) +
                image_name +
                FILE_EXTENSION.ADS;
              advertise_detail.image_url = url;
              advertise_detail.image_for_mobile = url;
              advertise_detail.image_for_banner = url;

              utils.storeImageToFolder(
                image_file[0].path,
                image_name + FILE_EXTENSION.ADS,
                FOLDER_NAME.ADS_MOBILE_IMAGES
              );
              advertise_detail.save();
            }
            response_data.json({
              success: true,
              message: ADS_MESSAGE_CODE.ADS_UPDATE_SUCCESSFULLY,
            });
          } else {
            response_data.json({
              success: false,
              error_code: DELIVERY_ERROR_CODE.UPDATE_FAILED,
            });
          }
        },
        (error) => {
          console.log(error);
          response_data.json({
            success: false,
            error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
          });
        }
      );
    } else {
      response_data.json(response);
    }
  });
};

//get_advertise_detail
exports.get_advertise_detail = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      var advertise_condition = {
        $match: {
          _id: { $eq: mongoose.Types.ObjectId(request_data_body.advertise_id) },
        },
      };
      var country_query = {
        $lookup: {
          from: "countries",
          localField: "country_id",
          foreignField: "_id",
          as: "country_details",
        },
      };
      var array_to_json_country_query = { $unwind: "$country_details" };
      var city_query = {
        $lookup: {
          from: "cities",
          localField: "city_id",
          foreignField: "_id",
          as: "city_details",
        },
      };
      var store_query = {
        $lookup: {
          from: "stores",
          localField: "store_id",
          foreignField: "_id",
          as: "store_details",
        },
      };

      Advertise.aggregate([
        advertise_condition,
        country_query,
        array_to_json_country_query,
        city_query,
        store_query,
      ]).then(
        (advertise) => {
          if (advertise.length == 0) {
            response_data.json({
              success: false,
              error_code: SERVICE_ERROR_CODE.SERVICE_DATA_NOT_FOUND,
            });
          } else {
            response_data.json({
              success: true,
              message: PRODUCT_MESSAGE_CODE.PRODUCT_LIST_SUCCESSFULLY,
              advertise: advertise[0],
            });
          }
        },
        (error) => {
          console.log(error);
          response_data.json({
            success: false,
            error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
          });
        }
      );
    } else {
      response_data.json(response);
    }
  });
};

// get_visible_advertise
exports.get_visible_advertise = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      Advertise.aggregate([
        { $match: { is_ads_visible: { $eq: true } } },
        {
          $lookup: {
            from: "countries",
            localField: "country_id",
            foreignField: "_id",
            as: "country_details",
          },
        },
      ]).then(
        (countries) => {
          if (countries.length == 0) {
            response_data.json({
              success: false,
              error_code: ITEM_ERROR_CODE.ITEM_NOT_FOUND,
            });
          } else {
            response_data.json({
              success: true,
              message: ITEM_MESSAGE_CODE.ITEM_LIST_SUCCESSFULLY,
              countries: countries,
            });
          }
        },
        (error) => {
          console.log(error);
          response_data.json({
            success: false,
            error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
          });
        }
      );
    } else {
      response_data.json(response);
    }
  });
};
