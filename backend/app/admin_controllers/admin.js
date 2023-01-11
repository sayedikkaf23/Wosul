require("../utils/message_code");
require("../utils/error_code");
require("../utils/constants");
var utils = require("../utils/utils");
var Admin = require("mongoose").model("admin");
var mongoose = require("mongoose");
var schema = mongoose.Schema;

// add_admin
exports.add_admin = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [
      { name: "admin_type" },
      { name: "email", type: "string" },
      { name: "username", type: "string" },
      { name: "password", type: "string" },
    ],
    async function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var admin_type = Number(request_data_body.admin_type);
        let store_id = null;
        if (admin_type == 4) {
          store_id = request_data_body.store_id;
        }
        Admin.findOne({
          admin_type: admin_type,
          email: request_data_body.email.trim().toLowerCase(),
          username: request_data_body.username.trim().toLowerCase(),
        }).then(
          (admin_data) => {
            if (admin_data) {
              response_data.json({
                success: false,
                error_code: ADMIN_ERROR_CODE.EMAIL_ALREADY_REGISTERED,
              });
            } else {
              var server_token = utils.generateServerToken(32);
              var admin = new Admin({
                admin_type: admin_type,
                username: request_data_body.username.trim().toLowerCase(),
                email: request_data_body.email.trim().toLowerCase(),
                server_token: server_token,
                store_id: store_id ? store_id : schema.Types.ObjectId(""),
                urls: [],
                password: utils.encryptPassword(request_data_body.password),
              });
              if (admin_type == ADMIN_DATA_ID.SUB_ADMIN || admin_type == 4) {
                admin.urls = request_data_body.urls;
              }
              admin.save().then(
                () => {
                  response_data.json({
                    success: true,
                    message: ADMIN_MESSAGE_CODE.ADD_SUCCESSFULLY,
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

//admin_list
exports.admin_list = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      Admin.find({}).then(
        (admins) => {
          if (admins.length == 0) {
            response_data.json({
              success: false,
              error_code: ADMIN_ERROR_CODE.DATA_NOT_FOUND,
            });
          } else {
            response_data.json({
              success: true,
              message: ADMIN_MESSAGE_CODE.LIST_SUCCESSFULLY,
              admins: admins,
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

// get_admin_detail
exports.get_admin_detail = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "admin_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        Admin.findOne({ _id: request_data_body.admin_id }).then(
          (admin) => {
            if (!admin) {
              response_data.json({
                success: false,
                error_code: ADMIN_ERROR_CODE.DETAIL_NOT_FOUND,
              });
            } else {
              response_data.json({
                success: true,
                message: ADMIN_MESSAGE_CODE.GET_DETAIL_SUCCESSFULLY,
                admin: admin,
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

// update_admin
exports.update_admin = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [
      { name: "admin_id", type: "string" },
      { name: "username", type: "string" },
    ],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var admin_id = request_data_body.admin_id;
        var username = request_data_body.username.trim().toLowerCase();
        request_data_body.username = username;

        if (request_data_body.password != "") {
          var password = request_data_body.password;
          request_data_body.password = utils.encryptPassword(password);
        }

        Admin.findOneAndUpdate({ _id: admin_id }, request_data_body, {
          new: true,
        }).then(
          (admin_data) => {
            if (admin_data) {
              response_data.json({
                success: true,
                message: ADMIN_MESSAGE_CODE.UPDATE_SUCCESSFULLY,
              });
            } else {
              response_data.json({
                success: false,
                error_code: ADMIN_ERROR_CODE.UPDATE_FAILED,
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

// delete_admin
exports.delete_admin = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "admin_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        Admin.deleteOne({ _id: request_data_body.admin_id }).then(
          () => {
            response_data.json({
              success: true,
              message: ADMIN_MESSAGE_CODE.DELETE_SUCCESSFULLY,
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
    }
  );
};

// login
exports.login = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [
      { name: "username", type: "string" },
      { name: "password", type: "string" },
    ],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var hash = utils.encryptPassword(request_data_body.password);
        var u_name = request_data_body.username.trim().toLowerCase();
        var username = {};
        username["username"] = u_name;
        var email = {};
        email["email"] = u_name;
        var password = {};
        password["password"] = hash;
        Admin.findOne({ $and: [{ $or: [username, email] }, password] }).then(
          (admin) => {
            if (!admin) {
              response_data.json({
                success: false,
                error_code: ADMIN_ERROR_CODE.DETAIL_NOT_FOUND,
              });
            } else {
              admin.server_token = utils.generateServerToken(32);
              admin.save();
              response_data.json({
                success: true,
                message: ADMIN_MESSAGE_CODE.LOGIN_SUCCESSFULLY,
                admin_data: admin,
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

//check_auth
exports.check_auth = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "admin_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        Admin.findOne({
          _id: request_data_body.admin_id,
          server_token: request_data_body.admin_token,
        }).then(
          (admin) => {
            if (!admin) {
              response_data.json({
                success: false,
                error_code: ADMIN_ERROR_CODE.DETAIL_NOT_FOUND,
              });
            } else {
              response_data.json({
                success: true,
                message: ADMIN_MESSAGE_CODE.GET_DETAIL_SUCCESSFULLY,
                admin: admin,
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
exports.add_update_subscription = async function (req, res) {
  try {
    const { subscription, admin_id } = req.body;
    const admin = await Admin.findOne({ _id: admin_id });
    if (!admin) {
      res.json({
        success: false,
      });
      return;
    }
    if (subscription) {
      if (!admin.subscription.includes(subscription)) {
        console.log("includes :>> ");
        admin.subscription.push(subscription);
        admin.save();
      }
    }
    res.json({
      success: true,
    });
  } catch (error) {
    res.statusCode = 500;
    res.json({
      success: false,
      message: error.message,
    });
  }
};

