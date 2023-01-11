var mongoose = require("mongoose");
var schema = mongoose.Schema;
var autoIncrement = require("mongoose-auto-increment");
var setting = new schema(
  {
    default_search_radius: { type: Number, default: 0 },
    provider_timeout: { type: Number, default: 0 },
    store_timeout: { type: Number, default: 0 },
    app_name: { type: String, default: "" },
    scheduled_request_pre_start_minute: { type: Number, default: 30 },
    number_of_try_for_scheduled_request: { type: Number, default: 0 },
    admin_name: { type: String, default: "" },
    is_apply_image_settings: { type: Boolean, default: true },
    no_of_loop_for_send_request: { type: Number, default: 0 },
    is_ask_time_when_accept_order: { type: Boolean, default: false },

    access_key_id: { type: String, default: "" },
    secret_key_id: { type: String, default: "" },
    aws_bucket_name: { type: String, default: "" },
    aws_bucket_url: { type: String, default: "" },
    aws_bucket_region: { type: String, default: "" },
    is_use_aws_bucket: { type: Boolean, default: false },

    is_provider_earning_add_in_wallet_on_cash_payment: {
      type: Boolean,
      default: true,
    },
    is_store_earning_add_in_wallet_on_cash_payment: {
      type: Boolean,
      default: true,
    },
    is_provider_earning_add_in_wallet_on_other_payment: {
      type: Boolean,
      default: true,
    },
    is_store_earning_add_in_wallet_on_other_payment: {
      type: Boolean,
      default: true,
    },

    is_email_id_field_required_in_user_register: {
      type: Boolean,
      default: true,
    },
    is_phone_field_required_in_user_register: { type: Boolean, default: true },
    is_email_id_field_required_in_provider_register: {
      type: Boolean,
      default: true,
    },
    is_phone_field_required_in_provider_register: {
      type: Boolean,
      default: true,
    },
    is_email_id_field_required_in_store_register: {
      type: Boolean,
      default: true,
    },
    is_phone_field_required_in_store_register: { type: Boolean, default: true },

    is_confirmation_code_required_at_pickup_delivery: {
      type: Boolean,
      default: false,
    },
    is_confirmation_code_required_at_complete_delivery: {
      type: Boolean,
      default: false,
    },
    is_busy: { type: Boolean, default: false },

    admin_email: { type: String, default: "" },
    admin_phone_number: { type: String, default: "" },
    admin_contact_email: { type: String, default: "" },
    admin_contact_phone_number: { type: String, default: "" },
    admin_country: { type: String, default: "" },
    admin_currency_code: { type: String, default: "" },
    admin_currency: { type: String, default: "" },
    admin_time_zone: { type: String, default: "" },
    admin_panel_timezone: { type: String, default: "" },

    email: { type: String, default: "" },
    password: { type: String, default: "" },

    sms_gateway_id: { type: schema.Types.ObjectId },
    is_referral_to_user: { type: Boolean, default: false },
    is_referral_to_provider: { type: Boolean, default: false },
    is_referral_to_store: { type: Boolean, default: false },
    is_show_optional_field_in_user_register: { type: Boolean, default: false },
    is_show_optional_field_in_provider_register: {
      type: Boolean,
      default: false,
    },
    is_show_optional_field_in_store_register: { type: Boolean, default: false },
    is_upload_user_documents: { type: Boolean, default: false },
    is_upload_provider_documents: { type: Boolean, default: false },
    is_upload_store_documents: { type: Boolean, default: false },
    is_sms_notification: { type: Boolean, default: false },
    is_mail_notification: { type: Boolean, default: false },
    is_push_notification: { type: Boolean, default: false },
    is_user_mail_verification: { type: Boolean, default: false },
    is_user_sms_verification: { type: Boolean, default: false },
    is_provider_mail_verification: { type: Boolean, default: false },
    is_provider_sms_verification: { type: Boolean, default: false },
    is_store_mail_verification: { type: Boolean, default: false },
    is_store_sms_verification: { type: Boolean, default: false },
    is_user_profile_picture_required: { type: Boolean, default: false },
    is_provider_profile_picture_required: { type: Boolean, default: false },
    is_store_profile_picture_required: { type: Boolean, default: false },
    is_user_login_by_email: { type: Boolean, default: false },
    is_user_login_by_phone: { type: Boolean, default: false },
    is_user_login_by_social: { type: Boolean, default: false },
    is_provider_login_by_email: { type: Boolean, default: false },
    is_provider_login_by_phone: { type: Boolean, default: false },
    is_provider_login_by_social: { type: Boolean, default: false },
    is_store_login_by_email: { type: Boolean, default: false },
    is_store_login_by_phone: { type: Boolean, default: false },
    is_store_login_by_social: { type: Boolean, default: false },
    in_review: { type: Boolean, default: false },

    exact_search_item_count: { type: Number, default: 20 },
    report_item_per_page: { type: Number, default: 1000 },
    max_loyalty_per_order_to_redeem: { type: Number, default: 2 },
    is_amount_per_loyalty_to_redeem: { type: Number, default: 1 },
    is_amount_per_loyalty_to_add_for_order: { type: Number, default: 1 },

    welcome_image_url_for_logged_in_user: {
      type: String,
      default: "images/welcome-gift.png",
    },
    welcome_image_url_for_logged_out_user: {
      type: String,
      default: "images/welcome-back.png",
    },
    welcome_description_for_logged_in_user: { type: String, default: "" },
    welcome_description_for_logged_out_user: { type: String, default: "" },
    welcome_wallet: { type: Number, default: 25 },
    is_recieved_welcome_wallet: { type: Boolean, default: false },
    payment_gateway_fee: { type: Number, default: 3.54 },
    store_commission_for_online_payment: { type: Number, default: 4.5 },
    store_commission: { type: Number, default: 2.5 },
    user_default_address_limit_in_meters: { type: Number, default: 5000 },

    cart_notification_message: { type: String, default: "" },
    cart_notification_message_heading: { type: String, default: "" },
    cart_notification_interval: { type: String, default: "2" },
    cart_notification_img_url: { type: String, default: "" },
    new_user_notification_message: { type: String, default: "" },
    new_user_notification_message_heading: { type: String, default: "" },
    user_notification_interval: { type: String, default: "1" },
    user_notification_img_url: { type: String, default: "" },
    welcome_wallet_message_title: { type: String, default: "" },
    welcome_wallet_message_body: { type: String, default: "" },
    welcome_wallet_notification_count: { type: Number, default: 5 },
    wallet_notification_interval: { type: Number, default: 2 },
    wallet_notification_img_url: { type: String, default: "" },
    domain_url: { type: String, default: "" },
    welcome_wallet_notification_time: { type: String, default: "12:01" },
    is_send_wallet_notification: { type: Boolean, default: false },
    // Deliveries to get added as new one
    is_deliveries_new: { type: Boolean, default: false },
    // Mobile_recharge visibility
    is_mobile_recharge_visible: { type: Boolean, default: true },
    payment_switch_to_online_pin: { type: Number, default: 0 },

    step_notification: {
      type: Array,
      default: [
        {
          name: "First",
          interval: 2,
          img_url: "",
          time: "13:01",
          body: "",
          title: "",
          is_send_notification: false,
        },
        {
          name: "Second",
          interval: 2,
          img_url: "",
          time: "15:01",
          body: "second title",
          title: "second body",
          is_send_notification: false,
        },
        {
          name: "Third",
          interval: 2,
          img_url: "",
          time: "17:01",
          body: "third title",
          title: "third body",
          is_send_notification: false,
        },
      ],
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    strict: true,
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);
setting.plugin(autoIncrement.plugin, {
  model: "setting",
  field: "unique_id",
  startAt: 1,
  incrementBy: 1,
});
module.exports = mongoose.model("setting", setting);
