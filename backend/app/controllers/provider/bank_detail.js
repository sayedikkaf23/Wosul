require("../../utils/message_code");
require("../../utils/error_code");
require("../../utils/constants");
var console = require("../../utils/console");

var utils = require("../../utils/utils");
var Bank_detail = require("mongoose").model("bank_detail");
var Provider = require("mongoose").model("provider");
var User = require("mongoose").model("user");
var Store = require("mongoose").model("store");
var Payment_gateway = require("mongoose").model("payment_gateway");
var Country = require("mongoose").model("country");
var City = require("mongoose").model("city");

// add_bank_detail
exports.add_bank_detail = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [
      { name: "bank_account_holder_name", type: "string" },
      { name: "bank_holder_type" },
      { name: "bank_holder_id", type: "string" },
      { name: "account_number", type: "string" },
      { name: "routing_number", type: "string" },
    ],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var bank_account_holder_name =
          request_data_body.bank_account_holder_name;

        var bank_holder_type = Number(request_data_body.bank_holder_type);
        var social_id = request_data_body.social_id;
        var encrypted_password = request_data_body.password;
        encrypted_password = utils.encryptPassword(encrypted_password);
        var Table;
        switch (bank_holder_type) {
          case ADMIN_DATA_ID.USER:
            Table = User;
            break;
          case ADMIN_DATA_ID.PROVIDER:
            Table = Provider;
            break;
          case ADMIN_DATA_ID.STORE:
            Table = Store;
            break;
          default:
            break;
        }

        Table.findOne({ _id: request_data_body.bank_holder_id }).then(
          (detail) => {
            if (detail) {
              if (
                social_id == undefined ||
                social_id == null ||
                social_id == ""
              ) {
                social_id = null;
              }
              if (
                social_id == null &&
                encrypted_password != "" &&
                encrypted_password != detail.password
              ) {
                response_data.json({
                  success: false,
                  error_code: PROVIDER_ERROR_CODE.INVALID_PASSWORD,
                });
              } else if (
                social_id != null &&
                detail.social_ids.indexOf(social_id) < 0
              ) {
                response_data.json({
                  success: false,
                  error_code:
                    PROVIDER_ERROR_CODE.PROVIDER_NOT_REGISTER_WITH_SOCIAL,
                });
              } else {
                Country.findOne({ _id: detail.country_id }).then(
                  (country_detail) => {
                    if (!country_detail) {
                      response_data.json({
                        success: false,
                        error_code:
                          BANK_DETAIL_ERROR_CODE.BANK_DETAIL_ADD_FAILED,
                        stripe_error: error.message,
                      });
                    } else {
                      City.findOne({ _id: detail.city_id }).then(
                        (city_detail) => {
                          var city_name = "";
                          if (city_detail) {
                            city_name = city_detail.city_name;
                          }
                          var country_code = country_detail.country_code;
                          Payment_gateway.findOne({}).then(
                            (payment_gateway) => {
                              if (payment_gateway) {
                                var stripe_key = payment_gateway.payment_key;
                                var stripe = require("stripe")(stripe_key);
                                stripe.tokens.create(
                                  {
                                    bank_account: {
                                      country: "US", // country_detail.alpha2
                                      currency: "USD",
                                      account_holder_name:
                                        request_data_body.bank_account_holder_name,
                                      account_holder_type:
                                        request_data_body.account_holder_type,
                                      routing_number:
                                        request_data_body.routing_number,
                                      account_number:
                                        request_data_body.account_number,
                                    },
                                  },
                                  function (error, token) {
                                    if (error) {
                                      var error = error;
                                      response_data.json({
                                        success: false,
                                        error_code:
                                          BANK_DETAIL_ERROR_CODE.BANK_DETAIL_ADD_FAILED,
                                        stripe_error: error.message,
                                      });
                                    } else {
                                      var pictureData =
                                        request_data_body.document;
                                      var pictureData_buffer = new Buffer(
                                        pictureData,
                                        "base64"
                                      );

                                      stripe.fileUploads.create(
                                        {
                                          file: {
                                            data: pictureData_buffer,
                                            name: "document.jpg",
                                            type: "application/octet-stream",
                                          },
                                          purpose: "identity_document",
                                        },
                                        function (error, fileUpload) {
                                          var error = error;
                                          if (error || !fileUpload) {
                                            response_data.json({
                                              success: false,
                                              error_code:
                                                BANK_DETAIL_ERROR_CODE.BANK_DETAIL_ADD_FAILED,
                                              stripe_error: error.message,
                                            });
                                          } else {
                                            var dob = request_data_body.dob;
                                            dob = dob.split("-");
                                            stripe.accounts.create(
                                              {
                                                type: "custom",
                                                country: "US", // country_detail.alpha2
                                                email: detail.email,
                                                legal_entity: {
                                                  first_name: detail.first_name,
                                                  last_name: detail.last_name,
                                                  personal_id_number:
                                                    request_data_body.personal_id_number,
                                                  business_name:
                                                    request_data_body.business_name,
                                                  business_tax_id:
                                                    detail.tax_id,
                                                  dob: {
                                                    day: dob[0],
                                                    month: dob[1],
                                                    year: dob[2],
                                                  },
                                                  type: request_data_body.account_holder_type,
                                                  address: {
                                                    city: city_name,
                                                    country: "US",
                                                    line1: detail.address,
                                                    line2: detail.address,
                                                  },
                                                  verification: {
                                                    document: fileUpload.id,
                                                  },
                                                },
                                              },
                                              function (error, account) {
                                                var error = error;
                                                if (error || !account) {
                                                  response_data.json({
                                                    success: false,
                                                    error_code:
                                                      BANK_DETAIL_ERROR_CODE.BANK_DETAIL_ADD_FAILED,
                                                    stripe_error: error.message,
                                                  });
                                                } else {
                                                  stripe.accounts.createExternalAccount(
                                                    account.id,
                                                    {
                                                      external_account:
                                                        token.id,
                                                      default_for_currency: true,
                                                    },
                                                    function (
                                                      error,
                                                      bank_account
                                                    ) {
                                                      var error = error;
                                                      if (
                                                        error ||
                                                        !bank_account
                                                      ) {
                                                        response_data.json({
                                                          success: false,
                                                          error_code:
                                                            BANK_DETAIL_ERROR_CODE.BANK_DETAIL_ADD_FAILED,
                                                          stripe_error:
                                                            error.message,
                                                        });
                                                      } else {
                                                        detail.account_id =
                                                          account.id;
                                                        detail.bank_id =
                                                          bank_account.id;
                                                        detail.save();

                                                        stripe.accounts.update(
                                                          account.id,
                                                          {
                                                            tos_acceptance: {
                                                              date: Math.floor(
                                                                Date.now() /
                                                                  1000
                                                              ),
                                                              ip: request_data
                                                                .connection
                                                                .remoteAddress, // Assumes you're not using a proxy
                                                            },
                                                          },
                                                          function (
                                                            error,
                                                            update_bank_account
                                                          ) {
                                                            if (
                                                              error ||
                                                              !update_bank_account
                                                            ) {
                                                              var error = error;
                                                              response_data.json(
                                                                {
                                                                  success: false,
                                                                  error_code:
                                                                    BANK_DETAIL_ERROR_CODE.BANK_DETAIL_ADD_FAILED,
                                                                  stripe_error:
                                                                    error.message,
                                                                }
                                                              );
                                                            } else {
                                                              Bank_detail.find({
                                                                bank_holder_id:
                                                                  request_data_body.bank_holder_id,
                                                                bank_holder_type:
                                                                  bank_holder_type,
                                                              }).then(
                                                                (
                                                                  bank_details
                                                                ) => {
                                                                  //

                                                                  var bank_detail =
                                                                    new Bank_detail(
                                                                      {
                                                                        bank_holder_type:
                                                                          bank_holder_type,
                                                                        account_holder_type:
                                                                          request_data_body.account_holder_type,
                                                                        bank_holder_id:
                                                                          request_data_body.bank_holder_id,
                                                                        bank_account_holder_name:
                                                                          bank_account_holder_name,
                                                                        routing_number:
                                                                          request_data_body.routing_number,
                                                                        account_number:
                                                                          request_data_body.account_number,
                                                                        account_id:
                                                                          account.id,
                                                                        bank_id:
                                                                          bank_account.id,
                                                                      }
                                                                    );

                                                                  if (
                                                                    bank_details.length >
                                                                    0
                                                                  ) {
                                                                    bank_detail.is_selected = false;
                                                                    bank_detail.save();
                                                                  } else {
                                                                    bank_detail.is_selected = true;
                                                                    bank_detail.save();
                                                                  }

                                                                  bank_detail
                                                                    .save()
                                                                    .then(
                                                                      () => {
                                                                        detail.selected_bank_id =
                                                                          bank_detail._id;
                                                                        detail.save();
                                                                        response_data.json(
                                                                          {
                                                                            success: true,
                                                                            message:
                                                                              BANK_DETAIL_MESSAGE_CODE.BANK_DETAIL_ADD_SUCCESSFULLY,
                                                                            bank_detail:
                                                                              bank_detail,
                                                                          }
                                                                        );
                                                                      },
                                                                      (
                                                                        error
                                                                      ) => {
                                                                        console.log(
                                                                          error
                                                                        );
                                                                        response_data.json(
                                                                          {
                                                                            success: false,
                                                                            error_code:
                                                                              ERROR_CODE.SOMETHING_WENT_WRONG,
                                                                          }
                                                                        );
                                                                      }
                                                                    );
                                                                },
                                                                (error) => {
                                                                  console.log(
                                                                    error
                                                                  );
                                                                  response_data.json(
                                                                    {
                                                                      success: false,
                                                                      error_code:
                                                                        ERROR_CODE.SOMETHING_WENT_WRONG,
                                                                    }
                                                                  );
                                                                }
                                                              );
                                                            }
                                                          }
                                                        );
                                                      }
                                                    }
                                                  );
                                                }
                                              }
                                            );
                                          }
                                        }
                                      );
                                    }
                                  }
                                );
                              }
                            }
                          );
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
              }
            } else {
              response_data.json({
                success: false,
                error_code: ERROR_CODE.DETAIL_NOT_FOUND,
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

// get bank detail
exports.get_bank_detail = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [{ name: "bank_holder_type" }, { name: "bank_holder_id", type: "string" }],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var bank_holder_type = Number(request_data_body.bank_holder_type);
        var Table;
        switch (bank_holder_type) {
          case ADMIN_DATA_ID.USER:
            Table = User;
            break;
          case ADMIN_DATA_ID.PROVIDER:
            Table = Provider;
            break;
          case ADMIN_DATA_ID.STORE:
            Table = Store;
            break;
          default:
            break;
        }

        Table.findOne({ _id: request_data_body.bank_holder_id }).then(
          (detail) => {
            if (detail) {
              
                Bank_detail.find({
                  bank_holder_type: bank_holder_type,
                  bank_holder_id: request_data_body.bank_holder_id,
                }).then((bank_detail) => {
                  if (bank_detail.length == 0) {
                    response_data.json({
                      success: false,
                      error_code: BANK_DETAIL_ERROR_CODE.BANK_DETAIL_NOT_FOUND,
                    });
                  } else {
                    response_data.json({
                      success: true,
                      message:
                        BANK_DETAIL_MESSAGE_CODE.BANK_DETAIL_LIST_SUCCESSFULLY,
                      bank_detail: bank_detail,
                    });
                  }
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

// Delete bank detail
exports.delete_bank_detail = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [
      { name: "bank_holder_id", type: "string" },
      { name: "bank_holder_type" },
      { name: "bank_detail_id", type: "string" },
    ],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var bank_holder_type = Number(request_data_body.bank_holder_type);
        var social_id = request_data_body.social_id;
        var encrypted_password = request_data_body.password;
        encrypted_password = utils.encryptPassword(encrypted_password);
        var Table;
        switch (bank_holder_type) {
          case ADMIN_DATA_ID.USER:
            Table = User;
            break;
          case ADMIN_DATA_ID.PROVIDER:
            Table = Provider;
            break;
          case ADMIN_DATA_ID.STORE:
            Table = Store;
            break;
          default:
            break;
        }

        Table.findOne({ _id: request_data_body.bank_holder_id }).then(
          (detail) => {
            if (detail) {
              if (
                social_id == undefined ||
                social_id == null ||
                social_id == ""
              ) {
                social_id = null;
              }
              if (
                social_id == null &&
                encrypted_password != "" &&
                encrypted_password != detail.password
              ) {
                response_data.json({
                  success: false,
                  error_code: PROVIDER_ERROR_CODE.INVALID_PASSWORD,
                });
              } else if (
                social_id != null &&
                detail.social_ids.indexOf(social_id) < 0
              ) {
                response_data.json({
                  success: false,
                  error_code:
                    PROVIDER_ERROR_CODE.PROVIDER_NOT_REGISTER_WITH_SOCIAL,
                });
              } else {
                var bank_detail_id = request_data_body.bank_detail_id;
                Bank_detail.findOne({
                  bank_holder_type: bank_holder_type,
                  bank_holder_id: request_data_body.bank_holder_id,
                }).then(
                  (bank_detail) => {
                    if (bank_detail) {
                      Payment_gateway.findOne({}).then((payment_gateway) => {
                        if (payment_gateway) {
                          var stripe_key = payment_gateway.payment_key;
                          var stripe = require("stripe")(stripe_key);
                          stripe.accounts.del(
                            bank_detail.account_id,
                            function (error, stripe_delete) {
                              var error = error;
                              if (error || !stripe_delete) {
                                response_data.json({
                                  success: false,
                                  error_code:
                                    BANK_DETAIL_ERROR_CODE.BANK_DETAIL_DELETE_FAILED,
                                });
                              } else {
                                Bank_detail.deleteOne({
                                  _id: bank_detail_id,
                                  bank_holder_type: bank_holder_type,
                                }).then(
                                  () => {
                                    Bank_detail.find({
                                      bank_holder_type: bank_holder_type,
                                      bank_holder_id:
                                        request_data_body.bank_holder_id,
                                    }).then(
                                      (bank_detail) => {
                                        response_data.json({
                                          success: true,
                                          message:
                                            BANK_DETAIL_MESSAGE_CODE.BANK_DETAIL_DELETE_SUCCESSFULLY,
                                          bank_detail: bank_detail,
                                        });
                                      },
                                      (error) => {
                                        console.log(error);
                                        response_data.json({
                                          success: false,
                                          error_code:
                                            ERROR_CODE.SOMETHING_WENT_WRONG,
                                        });
                                      }
                                    );
                                  },
                                  (error) => {
                                    console.log(error);
                                    response_data.json({
                                      success: false,
                                      error_code:
                                        ERROR_CODE.SOMETHING_WENT_WRONG,
                                    });
                                  }
                                );
                              }
                            }
                          );
                        }
                      });
                    } else {
                      response_data.json({
                        success: false,
                        error_code:
                          BANK_DETAIL_ERROR_CODE.BANK_DETAIL_DELETE_FAILED,
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
            } else {
              response_data.json({
                success: false,
                error_code: ERROR_CODE.DETAIL_NOT_FOUND,
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

// select_bank_detail

exports.select_bank_detail = function (request_data, response_data) {
  utils.check_request_params(
    request_data.body,
    [
      { name: "bank_holder_type" },
      { name: "bank_holder_id", type: "string" },
      { name: "bank_detail_id", type: "string" },
    ],
    function (response) {
      if (response.success) {
        var request_data_body = request_data.body;
        var bank_holder_type = Number(request_data_body.bank_holder_type);
        var Table;
        switch (bank_holder_type) {
          case ADMIN_DATA_ID.USER:
            Table = User;
            break;
          case ADMIN_DATA_ID.PROVIDER:
            Table = Provider;
            break;
          case ADMIN_DATA_ID.STORE:
            Table = Store;
            break;
          default:
            break;
        }

        Table.findOne({ _id: request_data_body.bank_holder_id }).then(
          (detail) => {
            if (detail) {
              Bank_detail.findOne({
                _id: request_data_body.bank_detail_id,
                bank_holder_type: bank_holder_type,
                bank_holder_id: request_data_body.bank_holder_id,
              }).then(
                (bank_detail) => {
                  if (!bank_detail) {
                    response_data.json({
                      success: false,
                      error_code: BANK_DETAIL_ERROR_CODE.BANK_DETAIL_NOT_FOUND,
                    });
                  } else {
                    bank_detail.is_selected = true;
                    bank_detail.save().then(
                      () => {
                        Bank_detail.findOneAndUpdate(
                          {
                            _id: { $nin: request_data_body.bank_detail_id },
                            bank_holder_type: bank_holder_type,
                            bank_holder_id: request_data_body.bank_holder_id,
                            is_selected: true,
                          },
                          { is_selected: false }
                        ).then(
                          (bank_details) => {
                            detail.selected_bank_id = bank_detail._id;
                            detail.save();
                            response_data.json({
                              success: true,
                              message:
                                BANK_DETAIL_MESSAGE_CODE.BANK_DETAIL_SELECT_SUCCESSFULLY,
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
              response_data.json({
                success: false,
                error_code: ERROR_CODE.DETAIL_NOT_FOUND,
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
