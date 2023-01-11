var users = require("../../controllers/user/user"); // include user controller ////
var flag = require("../../controllers/user/flag");
const {
  getHomePageItemList,
  bulkRegister,
} = require("../../controllers/user/user.controller");

module.exports = function (app) {
  app
    .route("/api/user/get_substitute_items")
    .post(users.user_get_substitute_items);
  app
    .route("/api/user/remove_item_from_cart")
    .post(users.remove_item_from_cart);
  app
    .route("/api/user/get_recommended_products")
    .post(users.get_recommended_products);

  app.route("/api/user/register").post(users.user_register);
  app.route("/api/user/bulkRegister").post(bulkRegister);
  app
    .route("/api/user/send_push_notification")
    .post(users.send_push_notification);
  app
    .route("/api/user/get_countries_flag_list")
    .post(flag.get_countries_flag_list);
  app
    .route("/api/user/get_special_category_list")
    .post(users.get_special_category_list);
  app
    .route("/api/user/get_special_category_item_list")
    .post(users.get_special_category_item_list);
  app
    .route("/api/user/generate_random_promo_code")
    .post(users.generate_random_promo_code);
  app.route("/api/user/login").post(users.user_login);
  app.route("/api/user/update").post(users.user_update);
  app.route("/api/user/update_device_token").post(users.update_device_token);
  app.route("/api/user/logout").post(users.logout);
  app.route("/api/user/get_detail").post(users.get_detail);
  app
    .route("/api/user/check_serving_at_location")
    .post(users.check_serving_at_location);
  app
    .route("/api/user/get_store_list_nearest_city")
    .post(users.get_store_list_nearest_city);

  app.route("/api/user/otp_verification").post(users.user_otp_verification);
  app.route("/api/user/rating_to_provider").post(users.user_rating_to_provider);
  app.route("/api/user/rating_to_store").post(users.user_rating_to_store);
  app.route("/api/user/get_store_list").post(users.get_store_list);
  app.route("/api/user/search_items_tags").post(users.search_items_tags);
  app.route("/api/user/update_search_tags").post(users.update_search_tags);
  app.route("/api/user/set_default_address").post(users.set_default_address);
  app
    .route("/api/user/get_item_list_by_price")
    .post(users.get_item_list_by_price);
  app
    .route("/api/v2/user/last_order_review_status")
    .post(users.last_order_review_status);
  app.route("/api/v2/user/update_image_url").post(users.updateImgUrl);

  app
    .route("/api/user/check_store_delivery_location")
    .post(users.check_store_delivery_location);
  app.route("/api/user/user_get_items").post(users.user_get_items);
  app
    .route("/api/user/get_delivery_list_for_nearest_city")
    .post(users.get_delivery_list_for_nearest_city);

  app
    .route("/api/v2/user/get_delivery_list_for_nearest_city")
    .post(users.get_delivery_list_for_nearest_city_v2);
  app
    .route("/api/user/getHomePageItemList")
    .post(
      checkRequestParam([
        { name: "country", type: "string" },
        { name: "latitude" },
        { name: "longitude" },
      ]),
      getHomePageItemList
    );

  app
    .route("/api/user/get_order_cart_invoice")
    .post(users.get_order_cart_invoice);
  app
    .route("/api/user/get_cards_and_order_cart_invoice")
    .post(users.get_cards_and_order_cart_invoice);
  app
    .route("/api/user/get_courier_order_invoice")
    .post(users.get_courier_order_invoice);
  app.route("/api/user/pay_order_payment").post(users.pay_order_payment);
  app
    .route("/api/user/user_get_store_product_item_list")
    .post(users.user_get_store_product_item_list);
  app.route("/api/user/search_items").post(users.search_items);
  app
    .route("/api/user/user_search_item_words")
    .post(users.user_search_item_words);
  app.route("/api/user/update_search_score").post(users.update_search_score);

  app.route("/api/user/add_favourite_store").post(users.add_favourite_store);
  app
    .route("/api/user/remove_favourite_store")
    .post(users.remove_favourite_store);
  app.route("/api/user/get_order_detail").post(users.get_order_detail);
  app
    .route("/api/user/get_favourite_store_list")
    .post(users.get_favourite_store_list);
  app
    .route("/api/user/user_get_store_review_list")
    .post(users.user_get_store_review_list);

  app
    .route("/api/user/user_like_dislike_store_review")
    .post(users.user_like_dislike_store_review);

  app.route("/api/user/store_list_for_item").post(users.store_list_for_item);

  app.route("/api/user/get_orders").post(users.get_orders);
  app.route("/api/user/get_order_status").post(users.get_order_status);
  app.route("/api/user/order_history").post(users.order_history);
  app.route("/api/user/bill_payment_history").post(users.bill_payment_history);
  app.route("/api/user/order_history_detail").post(users.order_history_detail);

  app
    .route("/api/user/get_provider_location")
    .post(users.get_provider_location);
  app.route("/api/user/get_invoice").post(users.get_invoice);

  app
    .route("/api/user/add_favourite_address")
    .post(users.add_favourite_address);
  app
    .route("/api/user/update_favourite_address")
    .post(users.update_favourite_address);
  app
    .route("/api/user/get_favourite_address")
    .post(users.get_favourite_address);
  app
    .route("/api/user/delete_favourite_address")
    .post(users.delete_favourite_address);

  app.route("/api/user/get_category_list").post(users.get_category_list);
  app.route("/api/user/user_get_price_sort").post(users.user_get_price_sort);

  app
    .route("/api/user/get_ramadan_category_list")
    .post(users.get_ramadan_category_list);
  app
    .route("/api/user/ramadan_product_item_list")
    .post(users.ramadan_product_item_list);

  app.route("/api/user/user_welcome").post(users.user_welcome);

  app.route("/api/user/get_store_details").post(users.get_store_details);
};
