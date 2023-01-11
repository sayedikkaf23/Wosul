var mongoose = require("mongoose");
var schema = mongoose.Schema;
var autoIncrement = require("mongoose-auto-increment");
var order = new schema(
  {
    unique_id: Number,
    store_id: { type: schema.Types.ObjectId },
    cart_id: { type: schema.Types.ObjectId },
    request_id: { type: schema.Types.ObjectId },
    order_payment_id: { type: schema.Types.ObjectId },
    city_id: { type: schema.Types.ObjectId },
    country_id: { type: schema.Types.ObjectId },
    timezone: { type: String, default: "" },
    reciept_url: { type: String, default: "" },

    is_user_confirmed: { type: Boolean, default: true },
    is_sent_notification: { type: Boolean, default: true },
    is_ramadan_order: { type: Boolean, default: false },
    user_id: { type: schema.Types.ObjectId },
    order_type: { type: Number, default: 7 },
    order_type_id: { type: schema.Types.ObjectId },
    delivery_type: { type: Number, default: 1 },
    order_status_id: { type: Number, default: 0 },
    order_status: { type: Number, default: 0 },
    order_status_manage_id: { type: Number, default: 0 },
    order_status_by: { type: schema.Types.ObjectId },
    image_url: { type: Array, default: [] },

    is_schedule_order_informed_to_store: { type: Boolean, default: false },
    estimated_time_for_ready_order: {
      type: Date,
    },

    max_bill_amount: { type: String, default: 100 },
    max_deduct_price: { type: String, default: 50 },
    deliver_in: { type: Number, default: 0 },

    confirmation_code_for_pick_up_delivery: Number,
    confirmation_code_for_complete_delivery: Number,
    
    review_check: { type: Boolean, default: false },
    store_notify: { type: Number, default: 0 },
    admin_notify: { type: Boolean, default: false },
    cancel_reason: { type: String, default: "" },
    selected_option: { type: String, default: "" },

    is_user_show_invoice: { type: Boolean, default: false },
    is_provider_show_invoice: { type: Boolean, default: false },

    is_store_rated_to_provider: { type: Boolean, default: false },
    is_store_rated_to_user: { type: Boolean, default: false },

    is_provider_rated_to_store: { type: Boolean, default: false },
    is_provider_rated_to_user: { type: Boolean, default: false },

    is_user_rated_to_provider: { type: Boolean, default: false },
    is_user_rated_to_store: { type: Boolean, default: false },
    is_schedule_order: { type: Boolean, default: false },

    date_time: { type: Array, default: [] },

    completed_date_tag: { type: String, default: "" },
    completed_date_in_city_timezone: {
      type: Date,
      default: null,
    },

    schedule_order_start_at: { type: String, default: "" },

    admin_notes:{type:Array},

    // delivery_boy_name:{ type: String, default: "" },

    // schedule_order_start_at: {
    //   type: Date,
    //   default: Date.now,
    // },
    schedule_order_server_start_at: {
      type: Date,
      default: Date.now,
    },

    completed_at: {
      type: Date,
      default: Date.now,
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

order.index({ order_status_id: 1, completed_at: 1 }, { background: true });
order.index({ order_status_id: 1, created_at: 1 }, { background: true });
order.index(
  { order_status_id: 1, completed_date_in_city_timezone: 1 },
  { background: true }
);
order.index({ order_status_id: 1, order_type: 1 }, { background: true });
order.index(
  { store_id: 1, user_id: 1, completed_at: 1, order_status_id: 1 },
  { background: true }
);
order.index(
  {
    current_provider: 1,
    delivery_status_manage_id: 1,
    delivery_status: 1,
    completed_at: 1,
  },
  { background: true }
);
order.index({ is_provider_show_invoice: 1 }, { background: true });
order.index({ cart_id: 1 }, { background: true, sparse: true  });
order.index({ order_payment_id: 1 }, { background: true });
order.index({ store_id: 1, request_status: 1 }, { background: true });
order.index(
  { store_id: 1, store_notify: 1, order_status: 1 },
  { background: true }
);
order.index(
  { order_type: 1, is_schedule_order: 1, order_status_id: 1, store_id: 1 },
  { background: true }
);
order.index(
  { completed_date_in_city_timezone: 1, store_id: 1 },
  { background: true }
);
order.index(
  { user_id: 1, order_status: 1, order_status_id: 1 },
  { background: true }
);
order.index(
  { completed_date_in_city_timezone: 1, user_id: 1 },
  { background: true }
);

order.plugin(autoIncrement.plugin, {
  model: "order",
  field: "unique_id",
  startAt: 1,
  incrementBy: 1,
});
module.exports = mongoose.model("order", order);
