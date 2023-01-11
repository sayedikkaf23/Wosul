var mongoose = require("mongoose");
var schema = mongoose.Schema;
var autoIncrement = require("mongoose-auto-increment");
require("../../utils/constants");
var order_payment = new schema(
  {
    unique_id: Number,
    invoice_number: String,

    cart_id: { type: schema.Types.ObjectId },
    order_id: { type: schema.Types.ObjectId },
    order_unique_id: Number,

    store_id: { type: schema.Types.ObjectId },
    user_id: { type: schema.Types.ObjectId },
    provider_id: { type: schema.Types.ObjectId },

    city_id: { type: schema.Types.ObjectId },
    country_id: { type: schema.Types.ObjectId },
    promo_id: { type: schema.Types.ObjectId, default: null },

    delivery_price_used_type: { type: Number, default: ADMIN_DATA_ID.ADMIN },
    delivery_price_used_type_id: { type: schema.Types.ObjectId, default: null },

    currency_code: { type: String, default: "" },
    email: { type: String, default: "" },
    name: { type: String, default: "" },
    description: { type: String, default: "" },
    reference: { type: String, default: "" },
    token: { type: String, default: "" },
    checkout_amount: { type: Number, default: 0 },
    bill_amount: { type: Number, default: 0 },
    checkout_payment_id: { type: String, default: "" },
    admin_currency_code: { type: String, default: "" },
    order_currency_code: { type: String, default: "" },
    current_rate: { type: Number, default: 1 }, // order to admin current rate
    wallet_to_admin_current_rate: { type: Number, default: 1 },
    wallet_to_order_current_rate: { type: Number, default: 1 },

    total_distance: { type: Number, default: 0 },
    total_time: { type: Number, default: 0 },
    total_item_count: { type: Number, default: 0 },
    is_distance_unit_mile: { type: Boolean, default: false },
    total_saving: {type: Number, default: 0},
    service_tax: { type: Number, default: 0 },
    total_service_price: { type: Number, default: 0 },
    total_admin_tax_price: { type: Number, default: 0 },
    total_delivery_price: { type: Number, default: 0 },

    // provider_have_cash_payment: {type: Number, default: 0},
    // provider_paid_order_payment: {type: Number, default: 0},
    // total_provider_have_payment: {type: Number, default: 0},

    pay_to_provider: { type: Number, default: 0 },
    admin_profit_mode_on_delivery: { type: Number, default: 1 },
    admin_profit_value_on_delivery: { type: Number, default: 0 },
    total_admin_profit_on_delivery: { type: Number, default: 0 },
    total_provider_income: { type: Number, default: 0 },

    item_tax: { type: Number, default: 0 },
    total_cart_price: { type: Number, default: 0 },
    total_store_tax_price: { type: Number, default: 0 },
    total_order_price: { type: Number, default: 0 },

    // store_have_service_payment: {type: Number, default: 0},
    // store_have_order_payment: {type: Number, default: 0},
    // total_store_have_payment: {type: Number, default: 0},

    other_promo_payment_loyalty: { type: Number, default: 0 },

    pay_to_store: { type: Number, default: 0 },
    admin_profit_mode_on_store: { type: Number, default: 0 },
    admin_profit_value_on_store: { type: Number, default: 0 },
    total_admin_profit_on_store: { type: Number, default: 0 },
    total_store_income: { type: Number, default: 0 },

    promo_payment: { type: Number, default: 0 },
    instrument_id: { type: String, default: "" },
    user_pay_payment: { type: Number, default: 0 },
    wallet_deduction: { type: Number, default: 0 },
    wallet_payment: { type: Number, default: 0 },
    loyalty_payment: { type: Number, default: 0 },
    loyalty_point: { type: Number, default: 0 },
    total_after_wallet_payment: { type: Number, default: 0 },
    remaining_payment: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    cash_payment: { type: Number, default: 0 },
    card_payment: { type: Number, default: 0 },
    yeep_earning: { type: Number, default: 0 },
    is_paid_from_wallet: { type: Boolean, default: false },
    is_promo_for_delivery_service: { type: Boolean, default: true },
    is_payment_mode_cash: { type: Boolean, default: true },
    is_payment_mode_card_on_delivery: { type: Boolean, default: false },
    is_payment_mode_online_payment: { type: Boolean, default: false },
    is_payment_mode_google_pay: { type: Boolean, default: false },
    is_payment_paid: { type: Boolean, default: false },
    is_order_price_paid_by_store: { type: Boolean, default: true },
    is_store_pay_delivery_fees: { type: Boolean, default: true },
    payment_id: { type: schema.Types.String },
    is_min_fare_applied: { type: Boolean, default: false },

    is_transfered_to_store: { type: Boolean, default: false },
    is_transfered_to_provider: { type: Boolean, default: false },

    is_user_pick_up_order: { type: Boolean, default: false },
    is_order_payment_status_set_by_store: { type: Boolean, default: false },

    is_cancellation_fee: { type: Boolean, default: false },
    order_cancellation_charge: { type: Number, default: 0 },
    is_order_payment_refund: { type: Boolean, default: false },
    refund_amount: { type: Number, default: 0 },

    is_provider_income_set_in_wallet: { type: Boolean, default: false },
    is_store_income_set_in_wallet: { type: Boolean, default: false },
    provider_income_set_in_wallet: { type: Number, default: 0 },
    store_income_set_in_wallet: { type: Number, default: 0 },

    completed_date_tag: { type: String, default: "" },
    completed_date_in_city_timezone: {
      type: Date,
      default: null,
    },
    delivered_at: {
      type: Date,
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

order_payment.index({ order_id: 1 }, { background: true });
order_payment.index(
  { user_id: 1, cart_id: 1, is_payment_paid: 1 },
  { background: true }
);
order_payment.index(
  { user_id: 1, is_payment_paid: 1, refund_amount: 1 },
  { background: true }
);

order_payment.index({ is_user_pick_up_order: 1 }, { background: true });
order_payment.index({ promo_id: 1 }, { background: true });
order_payment.index(
  { order_status_id: 1, completed_date_in_city_timezone: 1 },
  { background: true }
);
order_payment.index({ provider_id: 1, delivered_at: 1 }, { background: true });
order_payment.index({ store_id: 1, delivered_at: 1 }, { background: true });
order_payment.index(
  { provider_id: 1, completed_date_in_city_timezone: 1 },
  { background: true }
);
order_payment.index({ is_payment_mode_cash: 1 }, { background: true });
order_payment.index(
  {
    provider_id: 1,
    is_provider_income_set_in_wallet: 1,
    is_transfered_to_provider: 1,
  },
  { background: true }
);
order_payment.index(
  { store_id: 1, is_store_income_set_in_wallet: 1, is_transfered_to_store: 1 },
  { background: true }
);

order_payment.plugin(autoIncrement.plugin, {
  model: "order_payment",
  field: "unique_id",
  startAt: 1,
  incrementBy: 1,
});
module.exports = mongoose.model("order_payment", order_payment);
