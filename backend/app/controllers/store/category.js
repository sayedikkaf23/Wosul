require("../../utils/message_code");
require("../../utils/error_code");
var console = require("../../utils/console");

require("../../utils/constants");
var utils = require("../../utils/utils");
var mongoose = require("mongoose");
var Category = require("mongoose").model("category");
var Product = require("mongoose").model("product");
var Store = require("mongoose").model("store");
var Item = require("mongoose").model("item");
var jwt = require("jsonwebtoken");

exports.add_category = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "name", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var name = request_data_body.name.trim();
        name = name.charAt(0).toUpperCase() + name.slice(1);
        request_data_body.name = name;
        var category_data = new Category(request_data_body);
        var file_list_size = 0;
        var files_details = request_data.files;

        if (files_details != null && files_details != undefined) {
          file_list_size = files_details.length;

          var file_data;
          var file_id;
          for (i = 0; i < file_list_size; i++) {
            file_data = files_details[i];
            file_id = file_data.fieldname;

            if (file_id == "image_url") {
              var image_name = category_data._id + utils.generateServerToken(4);
              var url =
                utils.getStoreImageFolderPath(FOLDER_NAME.STORE_PRODUCTS) +
                image_name +
                FILE_EXTENSION.PRODUCT;
              category_data.image_url = url;
              utils.storeImageToFolder(
                files_details[i].path,
                image_name + FILE_EXTENSION.PRODUCT,
                FOLDER_NAME.STORE_PRODUCTS
              );
              // category_data.save();
            }
          }
        }

        category_data.save().then(
          () => {
            response_data.json({
              success: true,
              message: CATEGORY_MESSAGE_CODE.CATEGORY_ADD_SUCCESSFULLY,
            });
          },
          (error) => {
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

exports.add_category1 = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "name", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var name = request_data_body.name.trim();
        name = name.charAt(0).toUpperCase() + name.slice(1);
        request_data_body.name = name;
        Store.findOne({ _id: request_data_body.store_id }).then(
          (store_detail) => {
            if (store_detail) {
              Category.findOne({
                store_id: request_data_body.store_id,
                name: { $regex: request_data_body.name, $options: "i" },
              }).then(
                (category_data) => {
                  if (category_data) {
                    response_data.json({
                      success: false,
                      error_code: CATEGORY_ERROR_CODE.CATEGORY_ALREADY_EXIST,
                    });
                  } else {
                    var category = new Category(request_data_body);
                    var image_file = request_data.files;
                    if (image_file != undefined && image_file.length > 0) {
                      var image_name =
                        category._id + utils.generateServerToken(4);
                      var url =
                        utils.getStoreImageFolderPath(
                          FOLDER_NAME.STORE_category
                        ) +
                        image_name +
                        FILE_EXTENSION.CATEGORY;

                      category.image_url = url;
                      utils.storeImageToFolder(
                        image_file[0].path,
                        image_name + FILE_EXTENSION.CATEGORY,
                        FOLDER_NAME.STORE_category
                      );
                    }
                    category.save().then(
                      () => {
                        response_data.json({
                          success: true,
                          message:
                            CATEGORY_MESSAGE_CODE.CATEGORY_ADD_SUCCESSFULLY,
                          category: category,
                        });
                      },
                      (error) => {
                        response_data.json({
                          success: false,
                          error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                        });
                      }
                    );
                  }
                },
                (error) => {
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

exports.get_category_list = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      Store.findOne({ _id: request_data_body.store_id }).then(
        (store_detail) => {
          if (store_detail) {
            var condition = {
              $match: {
                store_id: {
                  $eq: mongoose.Types.ObjectId(request_data_body.store_id),
                },
              },
            };
            Category.find(
              {
                store_id: mongoose.Types.ObjectId(request_data_body.store_id),
              },
              function (err, category) {
                if (category.length == 0) {
                  console.log("category data nnot found");
                  response_data.json({
                    success: false,
                    error_code: CATEGORY_ERROR_CODE.CATEGORY_DATA_NOT_FOUND,
                  });
                } else {
                  response_data.json({
                    success: true,
                    message: CATEGORY_MESSAGE_CODE.CATEGORY_LIST_SUCCESSFULLY,
                    category: category,
                  });
                }
              },
              (error) => {
                response_data.json({
                  success: false,
                  error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                });
              }
            ).sort({ sequence_number: 1 });
          } else {
            response_data.json({
              success: false,
              error_code: STORE_ERROR_CODE.STORE_DATA_NOT_FOUND,
            });
          }
        },
        (error) => {
          console.log("some other issue");
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

exports.get_category_data = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "category_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        Store.findOne({ _id: request_data_body.store_id }).then(
          (store_detail) => {
            if (store_detail) {
              Category.findOne({ _id: request_data_body.category_id }).then(
                (category) => {
                  if (!category) {
                    response_data.json({
                      success: false,
                      error_code: CATEGORY_ERROR_CODE.CATEGORY_DATA_NOT_FOUND,
                    });
                  } else {
                    var store_condition = {
                      $match: {
                        store_id: {
                          $eq: mongoose.Types.ObjectId(
                            request_data_body.store_id
                          ),
                        },
                      },
                    };
                    var category_condition = {
                      $match: {
                        _id: {
                          $ne: mongoose.Types.ObjectId(
                            request_data_body.category_id
                          ),
                        },
                      },
                    };
                    Category.aggregate([
                      store_condition,
                      category_condition,
                      { $project: { a: "$name" } },
                      { $unwind: "$a" },
                      {
                        $group: {
                          _id: "a",
                          category_name: { $addToSet: "$a" },
                        },
                      },
                    ]).then(
                      (category_array) => {
                        if (category_array.length == 0) {
                          response_data.json({
                            success: true,
                            message:
                              CATEGORY_MESSAGE_CODE.CATEGORY_LIST_SUCCESSFULLY,
                            category: category,
                            category_array: [],
                          });
                        } else {
                          response_data.json({
                            success: true,
                            message:
                              CATEGORY_MESSAGE_CODE.CATEGORY_LIST_SUCCESSFULLY,
                            category: category,
                            category_array: category_array[0].category_name,
                          });
                        }
                      },
                      (error) => {
                        response_data.json({
                          success: false,
                          error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                        });
                      }
                    );
                  }
                },
                (error) => {
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
          }
        );
      } else {
        response_data.json(response);
      }
    }
  );
};

exports.update_category = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "category_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var category_id = request_data_body.category_id;

        var name = request_data_body.name.trim();
        name = name.charAt(0).toUpperCase() + name.slice(1);
        request_data_body.name = name;

        Category.findOneAndUpdate({ _id: category_id }, request_data_body, {
          new: true,
        }).then((category_data) => {
          if (category_data) {
            var file_list_size = 0;
            var files_details = request_data.files;

            if (files_details != null && files_details != undefined) {
              file_list_size = files_details.length;

              var file_data;
              var file_id;
              for (i = 0; i < file_list_size; i++) {
                file_data = files_details[i];
                file_id = file_data.fieldname;

                if (file_id == "image_url") {
                  utils.deleteImageFromFolder(
                    category_data.image_url,
                    FOLDER_NAME.STORE_PRODUCTS
                  );
                  var image_name =
                    category_data._id + utils.generateServerToken(4);
                  var url =
                    utils.getStoreImageFolderPath(FOLDER_NAME.STORE_PRODUCTS) +
                    image_name +
                    FILE_EXTENSION.PRODUCT;
                  category_data.image_url = url;
                  utils.storeImageToFolder(
                    files_details[i].path,
                    image_name + FILE_EXTENSION.PRODUCT,
                    FOLDER_NAME.STORE_PRODUCTS
                  );
                  category_data.save();
                }
              }
            }
            response_data.json({
              success: true,
              message: CATEGORY_MESSAGE_CODE.UPDATE_SUCCESSFULLY,
              category: category_data,
            });
          } else {
            response_data.json({
              success: false,
              error_code: CATEGORY_ERROR_CODE.UPDATE_FAILED,
            });
          }
        });
      } else {
        response_data.json(response);
      }
    },
    (error) => {
      response_data.json({
        success: false,
        error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
      });
    }
  );
};

exports.update_category1 = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [
      { name: "category_id", type: "string" },
      { name: "name", type: "string" },
    ],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var category_id = request_data_body.category_id;
        var name = request_data_body.name.trim();
        name = name.charAt(0).toUpperCase() + name.slice(1);
        request_data_body.name = name;
        Store.findOne({ _id: request_data_body.store_id }).then(
          (store_detail) => {
            if (store_detail) {
              Category.findOne({
                _id: { $ne: request_data_body.category_id },
                store_id: request_data_body.store_id,
                name: { $regex: request_data_body.name, $options: "i" },
              }).then(
                (category_detail) => {
                  if (category_detail) {
                    response_data.json({
                      success: false,
                      error_code: CATEGORY_ERROR_CODE.CATEGORY_ALREADY_EXIST,
                    });
                  } else {
                    Category.findOneAndUpdate(
                      { _id: category_id },
                      request_data_body,
                      { new: true }
                    ).then(
                      (category_data) => {
                        if (category_data) {
                          var image_file = request_data.files;
                          if (
                            image_file != undefined &&
                            image_file.length > 0
                          ) {
                            utils.deleteImageFromFolder(
                              category_data.image_url,
                              FOLDER_NAME.STORE_category
                            );
                            var image_name =
                              category_data._id + utils.generateServerToken(4);
                            var url =
                              utils.getStoreImageFolderPath(
                                FOLDER_NAME.STORE_category
                              ) +
                              image_name +
                              FILE_EXTENSION.CATEGORY;
                            utils.storeImageToFolder(
                              image_file[0].path,
                              image_name + FILE_EXTENSION.CATEGORY,
                              FOLDER_NAME.STORE_category
                            );
                            category_data.image_url = url;
                            category_data.save();
                          }

                          response_data.json({
                            success: true,
                            message: CATEGORY_MESSAGE_CODE.UPDATE_SUCCESSFULLY,
                            category: category_data,
                          });
                        } else {
                          response_data.json({
                            success: false,
                            error_code: CATEGORY_ERROR_CODE.UPDATE_FAILED,
                          });
                        }
                      },
                      (error) => {
                        response_data.json({
                          success: false,
                          error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                        });
                      }
                    );
                  }
                },
                (error) => {
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

exports.get_category_item_detail = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [
      { name: "category_id", type: "string" },
      { name: "item_id", type: "string" },
    ],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        Category.findOne({
          _id: request_data_body.category_id,
          store_id: request_data_body.store_id,
        }).then(
          (category_detail) => {
            if (category_detail) {
              Item.findOne({
                _id: request_data_body.item_id,
                category_id: category_detail._id,
                store_id: category_detail.store_id,
              }).then(
                (item_detail) => {
                  response_data.json({
                    success: true,
                    message: CATEGORY_MESSAGE_CODE.GET_CATEGORY_ITEM_LIST,
                    category: category_detail,
                    item: item_detail,
                  });
                },
                (error) => {
                  response_data.json({
                    success: false,
                    error_code: ERROR_CODE.SOMETHING_WENT_WRONG,
                  });
                }
              );
            } else {
              response_data.json({
                success: false,
                error_code: CATEGORY_ERROR_CODE.ITEM_LIST_NOT_FOUND,
              });
            }
          },
          (error) => {
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

exports.add_default_category = function (request_data, response_data) {
  console.log("add_cat_in_subcat");

  Store.find({}, function (err, stores) {
    var count = 0;
    var change_count = 0;
    stores.forEach((store) => {
      var category = {
        store_id: store._id,
        sequence_number: 0,
        unique_id_for_store_data: 0,
        is_visible_in_store: true,
        name: "Restaurants Products 555 ",
      };
      var category_data = new Category(category);
      category_data.save();

      Product.find({ store_id: store._id }, function (err, products) {
        var product_count = 0;
        products.forEach((product) => {
          if (product.category_id == undefined || product.category_id == null) {
            change_count++;
            product.category_id = category_data._id;
            product.save();
          }

          product_count++;

          if (stores.length == count && products.length == product_count) {
            response_data.json({
              success: true,
              count: count,
              change_count: change_count,
            });
          }
        });
      });
    });
  });
};
