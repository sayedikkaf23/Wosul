require("../../utils/message_code");
require("../../utils/error_code");
var console = require("../../utils/console");

require("../../utils/constants");
var utils = require("../../utils/utils");
var mongoose = require("mongoose");
var Product = require("mongoose").model("product");
var Store = require("mongoose").model("store");
var Sub_category = require("mongoose").model("sub_category");

// add product api
exports.add_sub_category = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [
      { name: "name", type: "string" },
      { name: "product_id", type: "string" },
    ],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var name = request_data_body.name.trim();
        name = name.charAt(0).toUpperCase() + name.slice(1);

        request_data_body.name = name;
        Store.findOne({ _id: request_data_body.store_id }).then(
          (store_detail) => {
            if (store_detail) {
              Product.findOne({
                store_id: request_data_body.store_id,
                _id: { $eq: request_data_body.product_id },
              }).then(
                (product_data) => {
                  if (product_data) {
                    Sub_category.findOne({
                      main_category_id: request_data_body.product_id,
                      name: { $eq: request_data_body.name },
                    }).then((sub_cat_data) => {
                      if (sub_cat_data) {
                        response_data.json({
                          success: false,
                          error_code: SUB_CATEGORY_CODE.ALREADY_EXIST,
                        });
                      } else {
                        var image_file = request_data.files;
                        if (image_file != undefined && image_file.length > 0) {
                          var image_name = utils.generateServerToken(4);
                          var url =
                            utils.getStoreImageFolderPath(
                              FOLDER_NAME.STORE_PRODUCTS
                            ) +
                            image_name +
                            FILE_EXTENSION.PRODUCT;
                          request_data_body.image_url = url;
                          utils.storeImageToFolder(
                            image_file[0].path,
                            image_name + FILE_EXTENSION.PRODUCT,
                            FOLDER_NAME.STORE_PRODUCTS
                          );
                        }
                        request_data_body.name = request_data_body.name;
                        request_data_body.details = request_data_body.details;
                        request_data_body.main_category_id =
                          mongoose.Types.ObjectId(request_data_body.product_id);
                        var sub_cat = new Sub_category(request_data_body);
                        sub_cat.save().then(
                          () => {
                            response_data.json({
                              success: true,
                              message:
                                SUB_CATEGORY_CODE.SUB_CATEGORY_ADD_SUCCESSFULLY,
                              sub_category: sub_cat,
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
                      }
                    });
                  } else {
                    response_data.json({
                      success: false,
                      error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND,
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
              response_data.json({
                success: false,
                error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND,
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
    }
  );
};
exports.update_sub_category = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [
      { name: "name", type: "string" },
      { name: "product_id", type: "string" },
      { name: "sub_cat_id", type: "string" },
    ],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var name = request_data_body.name.trim();
        name = name.charAt(0).toUpperCase() + name.slice(1);
        request_data_body.name = name;
        Store.findOne({ _id: request_data_body.store_id }).then(
          (store_detail) => {
            if (store_detail) {
              Product.findOne({
                store_id: request_data_body.store_id,
                _id: { $eq: request_data_body.product_id },
              }).then(
                (product_data) => {
                  if (product_data) {
                    Sub_category.findOne({
                      main_category_id: request_data_body.product_id,
                      name: { $eq: request_data_body.name },
                      _id: { $ne: request_data_body.sub_cat_id },
                    }).then((sub_cat_data) => {
                      if (sub_cat_data) {
                        response_data.json({
                          success: false,
                          error_code: SUB_CATEGORY_CODE.ALREADY_EXIST,
                        });
                      } else {
                        var image_file = request_data.files;
                        if (image_file != undefined && image_file.length > 0) {
                          // utils.deleteImageFromFolder(product_data.image_url, FOLDER_NAME.STORE_PRODUCTS);
                          var image_name =
                            product_data._id + utils.generateServerToken(4);
                          var url =
                            utils.getStoreImageFolderPath(
                              FOLDER_NAME.STORE_PRODUCTS
                            ) +
                            image_name +
                            FILE_EXTENSION.PRODUCT;
                          utils.storeImageToFolder(
                            image_file[0].path,
                            image_name + FILE_EXTENSION.PRODUCT,
                            FOLDER_NAME.STORE_PRODUCTS
                          );
                          request_data_body.image_url = url;
                        }
                        Sub_category.findOneAndUpdate(
                          { _id: request_data_body.sub_cat_id },
                          request_data_body,
                          { new: true }
                        ).then(
                          (sub_cat) => {
                            if (sub_cat) {
                              response_data.json({
                                success: true,
                                message: SUB_CATEGORY_CODE.UPDATE_SUCCESSFULLY,
                                sub_category: sub_cat,
                              });
                            } else {
                              response_data.json({
                                success: false,
                                error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
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
                      }
                    });
                  } else {
                    response_data.json({
                      success: false,
                      error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND,
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
              response_data.json({
                success: false,
                error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND,
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
    }
  );
};
