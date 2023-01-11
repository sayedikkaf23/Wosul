require("../../utils/message_code");
require("../../utils/error_code");
require("../../utils/constants");
var utils = require("../../utils/utils");
var console = require("../../utils/console");

var Installation_setting = require("mongoose").model("installation_setting");
var Setting = require("mongoose").model("setting");
var Image_setting = require("mongoose").model("image_setting");
var Country = require("mongoose").model("country");

//// check_app_keys
exports.check_app_keys = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    console.log("check_app_keys:>> " + JSON.stringify(request_data.body));
    if (response.success) {
      var request_data_body = request_data.body;
      var type = Number(request_data_body.type);
      Setting.findOne({}).then((setting) => {
        if (!setting) {
          response_data.json({
            success: false,
            error_code: SETTING_ERROR_CODE.APP_KEY_NOT_FOUND,
          });
        } else {
          var admin_contact_email = setting.admin_contact_email;
          var admin_contact_phone_number = setting.admin_contact_phone_number;
          var terms_and_condition_url = setting.domain_url + "/terms.html";
          var privacy_policy_url = setting.domain_url + "/privacy.html";

          Installation_setting.findOne({}).then(
            async (installation_setting) => {
              var country = await Country.findOne({
                country_name: "United Arab Emirates",
              });
              if (!country) country = {};
              if (!installation_setting) {
                response_data.json({
                  success: false,
                  error_code: SETTING_ERROR_CODE.APP_KEY_NOT_FOUND,
                });
              } else {
                switch (type) {
                  case ADMIN_DATA_ID.USER:
                    if (request_data_body.device_type == DEVICE_TYPE.ANDROID) {
                      response_data.json({
                        success: true,
                        message: SETTING_MESSAGE_CODE.APP_KEY_LIST_SUCCESSFULLY,
                        is_referral_user: country.is_referral_user,
                        referral_bonus_to_user: country.referral_bonus_to_user,
                        referral_bonus_to_user_friend:
                          country.referral_bonus_to_user_friend,
                        in_review: setting.in_review,
                        is_mobile_recharge_visible:
                          setting.is_mobile_recharge_visible,
                        is_use_referral: setting.is_referral_to_user,
                        is_verify_email: setting.is_user_mail_verification,
                        is_verify_phone: setting.is_user_sms_verification,
                        is_document_mandatory: setting.is_upload_user_documents,
                        is_login_by_email: setting.is_user_login_by_email,
                        is_login_by_phone: setting.is_user_login_by_phone,
                        is_login_by_social: setting.is_user_login_by_social,
                        is_profile_picture_required:
                          setting.is_user_profile_picture_required,
                        is_hide_optional_field: true,
                        is_show_optional_field:
                          setting.is_show_optional_field_in_user_register,
                        version_code:
                          installation_setting.android_user_app_version_code,
                        is_open_update_dialog:
                          installation_setting.is_android_user_app_open_update_dialog,
                        is_force_update:
                          installation_setting.is_android_user_app_force_update,
                        google_key:
                          installation_setting.android_user_app_google_key,
                        admin_contact_email: admin_contact_email,
                        admin_contact_phone_number: admin_contact_phone_number,
                        terms_and_condition_url: terms_and_condition_url,
                        privacy_policy_url: privacy_policy_url,
                        is_explore_page: installation_setting.is_explore_page,
                        is_recieved_welcome_message:
                          installation_setting.is_recieved_welcome_message,
                        is_email_id_field_required:
                          setting.is_email_id_field_required_in_user_register,
                        is_phone_field_required:
                          setting.is_phone_field_required_in_user_register,
                      });
                    } else if (
                      request_data_body.device_type == DEVICE_TYPE.IOS
                    ) {
                      response_data.json({
                        success: true,
                        message: SETTING_MESSAGE_CODE.APP_KEY_LIST_SUCCESSFULLY,
                        is_referral_user: country.is_referral_user,
                        referral_bonus_to_user: country.referral_bonus_to_user,
                        referral_bonus_to_user_friend:
                          country.referral_bonus_to_user_friend,
                        is_use_referral: setting.is_referral_to_user,
                        in_review: setting.in_review,
                        is_mobile_recharge_visible:
                          setting.is_mobile_recharge_visible,
                        is_verify_email: setting.is_user_mail_verification,
                        is_verify_phone: setting.is_user_sms_verification,
                        is_document_mandatory: setting.is_upload_user_documents,
                        is_login_by_email: setting.is_user_login_by_email,
                        is_login_by_phone: setting.is_user_login_by_phone,
                        is_login_by_social: setting.is_user_login_by_social,
                        is_hide_optional_field: true,
                        is_profile_picture_required:
                          setting.is_user_profile_picture_required,
                        is_show_optional_field:
                          setting.is_show_optional_field_in_user_register,
                        version_code:
                          installation_setting.ios_user_app_version_code,
                        is_open_update_dialog:
                          installation_setting.is_ios_user_app_open_update_dialog,
                        is_force_update:
                          installation_setting.is_ios_user_app_force_update,
                        google_key:
                          installation_setting.ios_user_app_google_key,
                        admin_contact_email: admin_contact_email,
                        admin_contact_phone_number: admin_contact_phone_number,
                        terms_and_condition_url: terms_and_condition_url,
                        privacy_policy_url: privacy_policy_url,
                        is_explore_page: installation_setting.is_explore_page,
                        is_recieved_welcome_message:
                          installation_setting.is_recieved_welcome_message,
                        is_email_id_field_required:
                          setting.is_email_id_field_required_in_user_register,
                        is_phone_field_required:
                          setting.is_phone_field_required_in_user_register,
                      });
                    }
                    break;
                  case ADMIN_DATA_ID.PROVIDER:
                    if (request_data_body.device_type == DEVICE_TYPE.ANDROID) {
                      response_data.json({
                        success: true,
                        message: SETTING_MESSAGE_CODE.APP_KEY_LIST_SUCCESSFULLY,
                        is_referral_user: country.is_referral_user,
                        referral_bonus_to_user: country.referral_bonus_to_user,
                        referral_bonus_to_user_friend:
                          country.referral_bonus_to_user_friend,
                        is_use_referral: setting.is_referral_to_provider,
                        in_review: setting.in_review,
                        is_mobile_recharge_visible:
                          setting.is_mobile_recharge_visible,
                        is_verify_email: setting.is_provider_mail_verification,
                        is_verify_phone: setting.is_provider_sms_verification,
                        is_document_mandatory:
                          setting.is_upload_provider_documents,
                        is_login_by_email: setting.is_provider_login_by_email,
                        is_login_by_phone: setting.is_provider_login_by_phone,
                        is_login_by_social: setting.is_provider_login_by_social,
                        is_hide_optional_field: true,
                        is_profile_picture_required:
                          setting.is_provider_profile_picture_required,
                        is_show_optional_field:
                          setting.is_show_optional_field_in_provider_register,
                        version_code:
                          installation_setting.android_provider_app_version_code,
                        is_open_update_dialog:
                          installation_setting.is_android_provider_app_open_update_dialog,
                        is_force_update:
                          installation_setting.is_android_provider_app_force_update,
                        google_key:
                          installation_setting.android_provider_app_google_key,
                        admin_contact_email: admin_contact_email,
                        admin_contact_phone_number: admin_contact_phone_number,
                        terms_and_condition_url: terms_and_condition_url,
                        privacy_policy_url: privacy_policy_url,
                        is_explore_page: installation_setting.is_explore_page,
                        is_recieved_welcome_message:
                          installation_setting.is_recieved_welcome_message,
                        is_email_id_field_required:
                          setting.is_email_id_field_required_in_provider_register,
                        is_phone_field_required:
                          setting.is_phone_field_required_in_provider_register,
                      });
                    } else if (
                      request_data_body.device_type == DEVICE_TYPE.IOS
                    ) {
                      response_data.json({
                        success: true,
                        message: SETTING_MESSAGE_CODE.APP_KEY_LIST_SUCCESSFULLY,
                        is_referral_user: country.is_referral_user,
                        referral_bonus_to_user: country.referral_bonus_to_user,
                        referral_bonus_to_user_friend:
                          country.referral_bonus_to_user_friend,
                        is_use_referral: setting.is_referral_to_provider,
                        is_verify_email: setting.is_provider_mail_verification,
                        is_verify_phone: setting.is_provider_sms_verification,
                        is_document_mandatory:
                          setting.is_upload_provider_documents,
                        is_login_by_email: setting.is_provider_login_by_email,
                        is_login_by_phone: setting.is_provider_login_by_phone,
                        is_hide_optional_field: true,
                        is_login_by_social: setting.is_provider_login_by_social,
                        is_profile_picture_required:
                          setting.is_provider_profile_picture_required,
                        is_show_optional_field:
                          setting.is_show_optional_field_in_provider_register,
                        version_code:
                          installation_setting.ios_provider_app_version_code,
                        is_open_update_dialog:
                          installation_setting.is_ios_provider_app_open_update_dialog,
                        is_force_update:
                          installation_setting.is_ios_provider_app_force_update,
                        google_key:
                          installation_setting.ios_provider_app_google_key,
                        admin_contact_email: admin_contact_email,
                        admin_contact_phone_number: admin_contact_phone_number,
                        terms_and_condition_url: terms_and_condition_url,
                        privacy_policy_url: privacy_policy_url,
                        is_explore_page: installation_setting.is_explore_page,
                        is_recieved_welcome_message:
                          installation_setting.is_recieved_welcome_message,
                        is_email_id_field_required:
                          setting.is_email_id_field_required_in_provider_register,
                        is_phone_field_required:
                          setting.is_phone_field_required_in_provider_register,
                      });
                    }

                    break;
                  case ADMIN_DATA_ID.STORE:
                    if (request_data_body.device_type == DEVICE_TYPE.ANDROID) {
                      response_data.json({
                        success: true,
                        message: SETTING_MESSAGE_CODE.APP_KEY_LIST_SUCCESSFULLY,
                        is_referral_user: country.is_referral_user,
                        referral_bonus_to_user: country.referral_bonus_to_user,
                        referral_bonus_to_user_friend:
                          country.referral_bonus_to_user_friend,
                        is_use_referral: setting.is_referral_to_store,
                        in_review: setting.in_review,
                        is_mobile_recharge_visible:
                          setting.is_mobile_recharge_visible,
                        is_verify_email: setting.is_store_mail_verification,
                        is_verify_phone: setting.is_store_sms_verification,
                        is_document_mandatory:
                          setting.is_upload_store_documents,
                        is_login_by_email: setting.is_store_login_by_email,
                        is_login_by_phone: setting.is_store_login_by_phone,
                        is_login_by_social: setting.is_store_login_by_social,
                        is_hide_optional_field: true,
                        is_profile_picture_required:
                          setting.is_store_profile_picture_required,
                        is_show_optional_field:
                          setting.is_show_optional_field_in_store_register,
                        version_code:
                          installation_setting.android_store_app_version_code,
                        is_open_update_dialog:
                          installation_setting.is_android_store_app_open_update_dialog,
                        is_force_update:
                          installation_setting.is_android_store_app_force_update,
                        google_key:
                          installation_setting.android_store_app_google_key,
                        admin_contact_email: admin_contact_email,
                        admin_contact_phone_number: admin_contact_phone_number,
                        terms_and_condition_url: terms_and_condition_url,
                        privacy_policy_url: privacy_policy_url,
                        is_explore_page: installation_setting.is_explore_page,
                        is_recieved_welcome_message:
                          installation_setting.is_recieved_welcome_message,
                        is_apply_image_settings:
                          setting.is_apply_image_settings,

                        is_email_id_field_required:
                          setting.is_email_id_field_required_in_store_register,
                        is_phone_field_required:
                          setting.is_phone_field_required_in_store_register,
                      });
                    } else if (
                      request_data_body.device_type == DEVICE_TYPE.IOS
                    ) {
                      response_data.json({
                        success: true,
                        message: SETTING_MESSAGE_CODE.APP_KEY_LIST_SUCCESSFULLY,
                        is_referral_user: country.is_referral_user,
                        referral_bonus_to_user: country.referral_bonus_to_user,
                        referral_bonus_to_user_friend:
                          country.referral_bonus_to_user_friend,
                        is_use_referral: setting.is_referral_to_store,
                        is_verify_email: setting.is_store_mail_verification,
                        is_verify_phone: setting.is_store_sms_verification,
                        is_document_mandatory:
                          setting.is_upload_store_documents,
                        is_login_by_email: setting.is_store_login_by_email,
                        is_login_by_phone: setting.is_store_login_by_phone,
                        is_login_by_social: setting.is_store_login_by_social,
                        is_hide_optional_field: true,
                        is_profile_picture_required:
                          setting.is_store_profile_picture_required,
                        is_show_optional_field:
                          setting.is_show_optional_field_in_store_register,
                        version_code:
                          installation_setting.ios_store_app_version_code,
                        is_open_update_dialog:
                          installation_setting.is_ios_store_app_open_update_dialog,
                        is_force_update:
                          installation_setting.is_ios_store_app_force_update,
                        google_key:
                          installation_setting.ios_store_app_google_key,
                        admin_contact_email: admin_contact_email,
                        is_explore_page: installation_setting.is_explore_page,
                        is_recieved_welcome_message:
                          installation_setting.is_recieved_welcome_message,
                        admin_contact_phone_number: admin_contact_phone_number,
                        terms_and_condition_url: terms_and_condition_url,
                        privacy_policy_url: privacy_policy_url,
                        is_apply_image_settings:
                          setting.is_apply_image_settings,
                        is_email_id_field_required:
                          setting.is_email_id_field_required_in_store_register,
                        is_phone_field_required:
                          setting.is_phone_field_required_in_store_register,
                      });
                    }
                    break;
                  default:
                    break;
                }
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
      response_data.json(response);
    }
  });
};

//// get_image_setting
exports.get_image_setting = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      var request_data_body = request_data.body;
      Image_setting.findOne({}).then(
        (image_setting) => {
          if (!image_setting) {
            response_data.json({
              success: false,
              error_code: SETTING_ERROR_CODE.APP_KEY_NOT_FOUND,
            });
          } else {
            response_data.json({
              success: true,
              message: SETTING_MESSAGE_CODE.APP_KEY_LIST_SUCCESSFULLY,
              image_setting: image_setting,
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
//// get app keys
exports.get_app_keys = function (request_data, response_data) {
  utils.check_request_params(request_data.body, [], function (response) {
    if (response.success) {
      Installation_setting.findOne({}).then(
        (installation_setting) => {
          if (!installation_setting) {
            response_data.json({
              success: false,
              error_code: SETTING_ERROR_CODE.APP_KEY_NOT_FOUND,
            });
          } else {
            response_data.json({
              success: true,
              message: SETTING_MESSAGE_CODE.APP_KEY_LIST_SUCCESSFULLY,
              app_keys: installation_setting,
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
