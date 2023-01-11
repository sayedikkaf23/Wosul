const geolib = require("geolib");
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const utils = require("../utils/utils");
const { getDistanceFromTwoLocation } = require("../utils/helper");
const Store = require("../models/store/store");
const Advertise = require("../models/store/advertise");
const Cart = require("mongoose").model("cart");
const Item = require("../models/store/item");
const { asyncForEach } = require("../helpers/utils.helper");

module.exports = (function () {
  this.storeResponseMap = (_stores) => {
    return _stores.map(
      ({
        email,
        country_phone_code,
        phone,
        social_ids,
        password,
        address,
        is_master,
        is_email_verified,
        is_phone_number_verified,
        is_document_uploaded,
        is_use_item_tax,
        item_tax,
        is_order_cancellation_charge_apply,
        order_cancellation_charge_for_above_order_price,
        order_cancellation_charge_type,
        order_cancellation_charge_value,
        is_ask_estimated_time_for_ready_order,
        is_provide_delivery_anywhere,
        delivery_radius,
        is_store_pay_delivery_fees,
        // free_delivery_for_above_order_price,
        free_delivery_within_radius,
        delivery_time_max,
        delivery_time,
        provider_rate,
        provider_rate_count,
        admin_profit_mode_on_store,
        admin_profit_value_on_store,
        wallet,
        wallet_currency_code,
        bank_id,
        account_id,
        is_store_can_add_provider,
        is_store_can_complete_order,
        website_url,
        offers,
        comments,
        referral_code,
        total_referrals,
        is_referral,
        device_token,
        login_by,
        delivery_fees,
        store_delivery_id,
        country_id,
        city_id,
        is_card_on_delivery_visible,
        is_cash_visible,
        is_online_payment_visible,
        is_show_cash,
        is_wallet_visible,
        min_price_for_card_on_delivery,
        min_price_for_cash,
        min_price_for_online_payment,
        min_price_for_wallet,
        branchio_url,
        is_send_mail_report,
        ask_password_timer,
        max_bill_amount,
        app_version,
        device_type,
        distance,
        isInside,
        min_order_price,
        radius_regions,
        max_item_quantity_add_by_user,
        ...rest
      }) => ({ ...rest })
    );
  };

  this.getStoreCountBasedOnLocation = async (
    latitude,
    longitude,
    delivery_id
  ) => {
    let opts = { is_approved: true, is_business: true, is_visible: true };
    if (delivery_id) opts.store_delivery_id = delivery_id;
    const stores = await Store.find(opts).lean();
    const storesList = await this.getStoresBasedOnLocation({
      stores,
      latitude,
      longitude,
    });
    return { count: storesList.length, stores: storesList };
  };

  const findAndSetUserRadiusZone = (store, latitude, longitude) => {
    let price = null;
    store.radius_regions.forEach((c, idx) => {
      if (idx === 0) price = c.price;
      const coord = c.kmlzone.coordinates;
      if (coord && coord[0]) {
        const coordinates = coord[0].map(([longitude, latitude]) => {
          return { latitude, longitude };
        });
        const isInside = geolib.isPointInPolygon(
          {
            latitude: latitude,
            longitude: longitude,
          },
          coordinates
        );
        const inside = geolib.isPointInPolygon(
          {
            latitude: longitude,
            longitude: latitude,
          },
          coordinates
        );
        if (isInside || inside) {
          store.isInside = true;
          store.user_radius_zone = c;
          price = c.price;
        }
      }
    });
    return store && store.radius_regions && store.radius_regions.length
      ? price
      : store.min_order_price;
  };

  this.setUseRadiusZone = async (store, latitude, longitude, cart_id) => {
    let cart, address;
    const price = findAndSetUserRadiusZone(store, latitude, longitude);
    if (cart_id && !store.user_radius_zone) {
      cart = await Cart.findById(cart_id).lean().select("pickup_addresses");
      if (cart.pickup_addresses.length) {
        address = cart.pickup_addresses[0];
        if (Array.isArray(address.location)) {
          [latitude, longitude] = address.location;
          return findAndSetUserRadiusZone(store, latitude, longitude);
        }
      }
    } else {
      return price;
    }
  };

  this.getStoresBasedOnLocation = async ({ stores, latitude, longitude }) => {
    stores = stores.filter((d) => d.radius_regions);
    await asyncForEach(stores, async (store) => {
      this.setUseRadiusZone(store, latitude, longitude);
    });
    return stores.filter((s) => s.isInside);
  };

  this.getStoreTime = (store_time) => {
    let storeTime = [];
    let len = 6;
    let firstSlotDayIndex = 0;
    let firstSlot = {};
    for (let i = 0; i <= len; i++) {
      const day_name = moment().tz("Asia/Dubai").add(i, "days").format("ddd");
      const date = moment()
        .tz("Asia/Dubai")
        .add(i, "days")
        .format("DD/MM/YYYY");
      const currentStoreTime = store_time.find((s) => s.day_name === day_name);

      let time = currentStoreTime
        ? { ...currentStoreTime, day_name, date }
        : {
            is_store_open: false,
            is_store_open_full_time: false,
            day_name,
            date,
            day_time: [],
          };
      let is_store_open = false;
      if (i === firstSlotDayIndex) {
        const dayTime = [];
        time.day_time.forEach((t) => {
          const tm = moment(t.store_open_time, "HH:mm");
          const ctm = moment(t.store_close_time, "HH:mm");
          const currTime = moment(
            moment.tz("Asia/Dubai").format("HH:mm"),
            "HH:mm"
          );
          const minutesOfDay = (m) => m.minutes() + m.hours() * 60;
          if (
            (currTime.isSame(tm) ||
              currTime.isSame(ctm) ||
              currTime.isBetween(tm, ctm)) &&
            i === 0
          ) {
            is_store_open = true;
          }
          if (minutesOfDay(currTime) < minutesOfDay(tm) || i !== 0) {
            dayTime.push(t);
          }
        });
        time.is_store_open = is_store_open;
        time.day_time = dayTime;
        if (dayTime.length === 0) {
          firstSlot = { ...time };
          firstSlotDayIndex++;
        } else {
          storeTime.push(time);
        }
      } else {
        time.is_store_open = time.day_time.length > 0 ? true : false;
        storeTime.push(time);
      }
    }
    if (firstSlotDayIndex > 0) storeTime.push(firstSlot);
    return storeTime;
  };

  this.recentOrders = async ({ user_id }) => {
    return await Order.aggregate([
      { $match: { user_id: { $eq: mongoose.Types.ObjectId(user_id) } } },
      {
        $match: {
          $or: [
            {
              order_status: ORDER_STATE.ORDER_COMPLETED,
              is_user_show_invoice: true,
            },
            { order_status: ORDER_STATE.STORE_CANCELLED },
            { order_status: ORDER_STATE.CANCELED_BY_USER },
            { order_status: ORDER_STATE.STORE_REJECTED },
          ],
        },
      },
      {
        $lookup: {
          from: "stores",
          localField: "store_id",
          foreignField: "_id",
          as: "store_detail",
        },
      },
      {
        $unwind: {
          path: "$store_detail",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "cities",
          localField: "city_id",
          foreignField: "_id",
          as: "city_detail",
        },
      },
      { $unwind: "$city_detail" },

      {
        $lookup: {
          from: "countries",
          localField: "city_detail.country_id",
          foreignField: "_id",
          as: "country_detail",
        },
      },
      { $unwind: "$country_detail" },
      {
        $lookup: {
          from: "requests",
          localField: "request_id",
          foreignField: "_id",
          as: "request_detail",
        },
      },
      {
        $unwind: {
          path: "$request_detail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "order_payments",
          localField: "order_payment_id",
          foreignField: "_id",
          as: "order_payment_detail",
        },
      },
      { $unwind: "$order_payment_detail" },
      { $sort: { _id: -1 } },
      { $limit: 1 },
      {
        $project: {
          created_at: "$created_at",
          order_status: "$order_status",
          order_status_id: "$order_status_id",
          completed_at: "$completed_at",
          is_ramadan_order: "$is_ramadan_order",
          unique_id: "$unique_id",
          total: "$order_payment_detail.total",
          refund_amount: "$order_payment_detail.refund_amount",
          total_service_price: "$order_payment_detail.total_service_price",
          total_order_price: "$order_payment_detail.total_order_price",
          currency: "$country_detail.currency_sign",
          user_pay_payment: "$order_payment_detail.user_pay_payment",
          checkout_amount: "$order_payment_detail.checkout_amount",
          delivery_type: "$delivery_type",
          image_url: "$image_url",
          request_detail: {
            created_at: "$request_detail.created_at",
            request_unique_id: "$request_detail.unique_id",
            delivery_status: "$request_detail.delivery_status",
            delivery_status_manage_id:
              "$request_detail.delivery_status_manage_id",
          },
          store_detail: {
            name: {
              $cond: ["$store_detail", "$store_detail.name", ""],
            },
            min_order_price: {
              $cond: ["$store_detail", "$store_detail.min_order_price", ""],
            },
            image_url: {
              $cond: ["$store_detail", "$store_detail.image_url", ""],
            },
          },
        },
      },
    ]);
  };

  this.getHomePageItems = async ({ store_id, limit: lmt = 20 }) => {
    return await Item.find({ store_id }).sort("-order_score").limit(lmt).lean();
  };

  this.storeAdvFromUserLocation = async (lat, long, ads_for) => {
    const stores = await Store.aggregate([
      {
        $match: {
          $and: [
            { is_approved: { $eq: true } },
            { is_business: { $eq: true } },
            { is_visible: { $eq: true } },
            // { city_id: { $eq: Schema(city_id) } },
            // {
            //   store_delivery_id: {
            //     $eq: Schema(store_delivery_id),
            //   },
            // },
          ],
        },
      },
    ]);
    if (stores.length == 0) {
      return [];
    }
    var store_list = [];

    stores.forEach((store) => {
      store.distance = getDistanceFromTwoLocation([lat, long], store.location);
      store_list.push(store);
    });
    if (!stores.length) {
      stores.forEach((store) => {
        store.distance = getDistanceFromTwoLocation(
          [long, lat],
          store.location
        );
        store_list.push(store);
      });
    }
    store_list.sort((a, b) => a.distance - b.distance);

    const _stores = await this.getStoresBasedOnLocation({
      stores: store_list,
      latitude: lat,
      longitude: long,
    });
    _stores.sort((a, b) => a.store_sequence - b.store_sequence);

    const store_id = _stores.map((store) => store._id);
    let store_delivery_id = _stores.map((store) => store.store_delivery_id);

    const adv = await Advertise.find({
      is_ads_redirect_to_store: true,
      store_delivery_id: {
        $in: store_delivery_id,
      },
      store_id: {
        $in: store_id,
      },
      in_app_notification: false,
      is_ads_visible: true,
      ads_for: ads_for,
    });
    const adv1 = await Advertise.find({
      is_ads_redirect_to_store: false,
      store_delivery_id: {
        $in: store_delivery_id,
      },
      in_app_notification: false,
      is_ads_visible: true,
      ads_for: ads_for,
    });
    return [...adv, ...adv1];
  };

  return this;
})();
