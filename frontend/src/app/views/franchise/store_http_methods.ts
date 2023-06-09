import { environment } from "src/environments/environment.prod";

let http_url = environment.serverUrl;

export var GET_METHOD = {
  GET_COUNTRY_LIST: http_url + 'api/admin/get_country_list',
};
environment
export var POST_METHOD = {
  REGISTER: http_url + '/api/franchise/register',
  STORE_REGISTER: http_url + '/api/store/register',
  ADMIN_OTP_VERIFICATION: http_url + '/api/admin/otp_verification',
  FORGOT_PASSWORD: http_url + '/api/admin/forgot_password',
  GET_CITY_LIST: http_url + '/api/admin/get_city_list',
  GET_DELIVERY_LIST_FOR_CITY: http_url + '/api/admin/get_delivery_list_for_city',
  GET_SETTING_DETAIL: http_url + '/api/admin/get_setting_detail',
  LOGIN: http_url + '/api/franchise/login',
  GET_FRANCHISE_DATA: http_url + '/api/franchise/get_franchise_data',
  GET_PRODUCT_LIST: http_url + '/api/franchise/get_product_list',
  GET_STORE_LIST: http_url + '/api/franchise/store_list_search_sort_franchises',
  LOGOUT: http_url + '/api/franchise/logout',
  UPDATE: http_url + '/api/franchise/update',
  GET_STORE_DATA: http_url + '/api/franchise/get_store_data',
  GET_IMAGE_SETTING: http_url + '/api/admin/get_image_setting',
  ADD_PRODUCT: http_url + '/api/franchise/add_product',
  GET_PRODUCT_DATA: http_url + '/api/franchise/get_product_data',
  GET_PRODUCT_STORE_LIST: http_url + '/api/franchise/get_product_store_data',
  UPDATE_PRODUCT: http_url + '/api/franchise/update_product',
  GET_SPECIFICATION_GROUP: http_url + '/api/franchise/get_specification_group',
  ADD_SPECIFICATION_GROUP: http_url + '/api/franchise/add_specification_group',
  DELETE_SPECIFICATION_GROUP: http_url + '/api/franchise/delete_specification_group',
  ADD_SPECIFICATION: http_url + '/api/franchise/add_specification',
  DELETE_SPECIFICATION: http_url + '/api/franchise/delete_specification',
  GET_STORE_PRODUCT_ITEM_LIST: http_url + '/api/franchise/get_store_product_item_list',
  GET_FOR_STORE_PRODUCT_ITEM_LIST: http_url +     '/api/franchise/get_for_store_product_item_list',
  IS_ITEM_IN_STOCK: http_url + '/api/franchise/is_item_in_stock',
  GET_SOECIFICATION_LIST: http_url + '/api/franchise/get_specification_lists',
  GET_SPECIFICATION_LISTS: http_url + '/api/franchise/get_specification_lists',
  ADD_ITEM: http_url + '/api/franchise/add_item',
  GET_ITEM_DATA: http_url + '/api/franchise/get_item_data',
  UPDATE_ITEM: http_url + '/api/franchise/update_item',
  UPDATE_ITEM_IMAGE: http_url + '/api/franchise/update_item_image',
  DELETE_ITEM_IMAGE: http_url + '/api/franchise/delete_item_image',
  ORDER_LIST_SEARCH_SORT: http_url + '/api/franchise/order_list_search_sort',
  STORE_RATING_TO_USER: http_url + '/api/franchise/rating_to_user',
  STORE_RATING_TO_PROVIDER: http_url + '/api/franchise/rating_to_provider',
  DELIVERY_LIST_SEARCH_SORT: http_url + '/api/franchise/delivery_list_search_sort',
  GET_ORDER_DETAIL: http_url + '/api/franchise/get_order_detail',
  HISTORY: http_url + '/api/franchise/history',
  PROVIDER_LOCATION_TRACK: http_url + '/api/franchise/provider_location_track',
  /* CHECK_DETAIL : http_url + '/api/admin/check_detail',
    CANCEL_REQUEST : http_url + '/api/franchise/cancel_request',
    ORDER_PAYMENT_STATUS_SET_ON_CASH_ON_DELIVERY : http_url + '/api/franchise/order_payment_status_set_on_cash_on_delivery',
    SET_ORDER_STATUS : http_url + '/api/franchise/set_order_status',
    STORE_CANCEL_OR_REJECT_ORDER : http_url + '/api/franchise/store_cancel_or_reject_order',
    CREATE_REQUEST : http_url + '/api/franchise/create_request',
    STORE_COMPLETE_ORDER : http_url + api/franchise/complete_order",
    ADD_ITEM_IN_CART: http_url + "api/user/add_item_in_cart",
    NEW_PASSWORD : http_url + '/api/admin/new_password',
    CHECK_REFERRAL: http_url + '/api/admin/check_referral',
    GET_DOCUMENT_LIST : http_url + '/api/admin/get_document_list',
    UPLOAD_DOCUMENT : http_url + '/api/admin/upload_document',
    GET_ORDER_CART_INVOICE: http_url + "api/user/get_order_cart_invoice",
    GET_USER : http_url + /api/store/get_user",
    PAY_ORDER_PAYMENT: http_url + "api/user/pay_order_payment",
    CREATE_ORDER: http_url + "api/user/create_order",
    APPLY_PROMO_CODE: http_url + "api/user/apply_promo_code",
    GET_COUNTRY_PHONE_NUMBER_LENGTH: http_url + 'api/store/get_country_phone_number_length',

    UPLOAD_ITEM_IMAGE : http_url + '/api/store/upload_item_image',
    DAILY_EARNING : http_url + '/api/store/daily_earning',
    GET_STORE_EARNING : http_url + '/api/store/get_store_earning',
    CHANGE_DELIVERY_ADDRESS: http_url + 'api/user/change_delivery_address',
    GET_ORDER_DATA : http_url + '/api/store/get_order_data',
    ADD_PRODUCT : http_url + '/api/store/add_product',
    GET_STORE_DATA : http_url + '/api/store/get_store_data',
    OTP_VERIFICATION : http_url + '/api/store/otp_verification',
    UPDATE_STORE_TIME : http_url + '/api/store/update_store_time',
    REGISTER : http_url + '/api/store/register',
    WEEKLY_EARNING : http_url + '/api/store/weekly_earning',

    */
};
