import { NgZone, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Data } from './data';
import { Router, ActivatedRoute } from '@angular/router';

import { CONSTANT, price_validation } from '../constant';
import { ToastrService } from 'ngx-toastr';
import { IMyDateModel } from 'mydatepicker';
import { Router_id } from './routing_hidden_id';
import {
  ERROR_CODE_CONSTANT,
  IMPORT_STORE_DATA,
  MONTH,
  WEEK,
  DAY,
  DATE_FORMAT,
  PROMO_FOR_ID,
  PROMO_FOR_STRING,
  PROMO_FOR,
  PROMO_RECURSION_ID,
  PROMO_RECURSION_STRING,
  PROMO_RECURSION,
  ORDER_STATE,
  TIMEOUT,
  ORDER_STATUS_ID,
  ORDER_CANCELLATION_CHARGE_TYPE,
  ADMIN_DATA_ID,
  IMAGE_RATIO,
} from '../constant';
import {
  title,
  button,
  heading_title,
  status,
  lable_title,
  message,
  menu_title,
} from './store/store_panel_string';
import { ERROR_CODE } from './store/store_panel_error_message ';
import { MESSAGE_CODE } from './store/store_panel_success_message';
import { validation_message } from './store/store_panel_validation_message';
import { GET_METHOD, POST_METHOD } from './store/store_http_methods';
import { StoreCart } from './store/cart';

// @Component({
//     selector: 'helper'
// })
@Injectable()
export class Helper {
  ///// for constant ////////////
  public ADMIN_DATA_ID: any = ADMIN_DATA_ID;
  public error_code: any = ERROR_CODE_CONSTANT;
  public ORDER_STATE: any = ORDER_STATE;
  public TIMEOUT: any = TIMEOUT;
  public ORDER_STATUS_ID: any = ORDER_STATUS_ID;
  public CONSTANT: any = CONSTANT;
  public title: any = title;
  public button: any = button;
  public heading_title: any = heading_title;
  public ERROR_CODE: any = ERROR_CODE;
  public MESSAGE_CODE: any = MESSAGE_CODE;
  public status: any = status;
  public messages: any = message;
  public menu_title: any = menu_title;
  public image_ratio: any = IMAGE_RATIO;
  public validation_message: any = validation_message;
  public ORDER_CANCELLATION_CHARGE_TYPE: any = ORDER_CANCELLATION_CHARGE_TYPE;

  public GET_METHOD: any = GET_METHOD;
  public POST_METHOD: any = POST_METHOD;
  public lable_title: any = lable_title;

  public PROMO_FOR_ID: any = PROMO_FOR_ID;
  public PROMO_FOR_STRING: any = PROMO_FOR_STRING;
  public PROMO_FOR: any = PROMO_FOR;

  public PROMO_RECURSION_ID: any = PROMO_RECURSION_ID;
  public PROMO_RECURSION_STRING: any = PROMO_RECURSION_STRING;
  public PROMO_RECURSION: any = PROMO_RECURSION;

  private log_boolean: Boolean = true;

  public WEEK: any = WEEK;
  public MONTH: any = MONTH;
  public DAY: any = DAY;

  public DATE_FORMAT: any = DATE_FORMAT;

  public IMPORT_STORE_DATA: any = IMPORT_STORE_DATA;

  constructor(
    public http: HttpClient,
    public ngZone: NgZone,
    public user_cart: StoreCart,
    public route: ActivatedRoute,
    public router_id: Router_id,
    public toastr: ToastrService,
    public router: Router,
    public data: Data
  ) {}

  public getToken() {
    return localStorage.getItem('token');
  }

  public setToken(token) {
    localStorage.setItem('token', token);
  }

  public removeToken() {
    localStorage.removeItem('token');
  }

  message() {
    // this.toastr.dispose();
    if (this.data.storage.message !== '') {
      if (this.data.storage.class == 'alert-info') {
        var a = this.data.storage.message;
        this.toastr.success(this.data.storage.message, null, {
          timeOut: TIMEOUT.TOASTER_NOTIFICATION,
        });
      } else if (this.data.storage.class == 'alert-danger') {
        if (
          this.data.storage.code == this.error_code.TOKEN_EXPIRED ||
          this.data.storage.code == this.error_code.STORE_DATA_NOT_FOUND
        ) {
          this.router.navigate(['store/logout']);
        }
        this.toastr.error(this.data.storage.message, null, {
          timeOut: TIMEOUT.TOASTER_NOTIFICATION,
        });
      }
      this.data.storage = {
        code: '',
        message: '',
        class: '',
      };
    }
  }

  redirect_to_invoice() {
    this.router.navigate(['store/invoice']);
  }

  string_log(key, value) {
    if (this.log_boolean) {
      console.log(key + ': ' + value);
    }
  }

  json_log(json) {
    if (this.log_boolean) {
      console.log(json);
    }
  }

  http_status(error) {
    if (error.status === 500) {
      console.log('Internal Server Error');
    } else if (error.status === 502) {
      console.log('Bad Gateway');
    } else if (error.status === 404) {
      console.log('Url Not Found');
    } else if (error.status === 503) {
      console.log('Service Unavailable');
    } else if (error.status === 504) {
      console.log('Gateway Timeout');
    } else if (error.status === 408) {
      console.log('Request Timeout');
    } else if (error.status === 413) {
      console.log('Request Entity To Large');
    }
  }

  increase_qty(product_index, item_index) {
    this.user_cart.cart_data.cart[product_index].items[item_index].quantity++;
    let qty =
      this.user_cart.cart_data.cart[product_index].items[item_index].quantity;
    let total_item_price =
      this.user_cart.cart_data.cart[product_index].items[item_index].item_price;
    let total_specification_price =
      this.user_cart.cart_data.cart[product_index].items[item_index]
        .total_specification_price;
    let total_item_tax =
      this.user_cart.cart_data.cart[product_index].items[item_index].total_tax;
    this.user_cart.cart_data.cart[product_index].items[item_index].total_price =
      total_item_price + total_specification_price;
    this.user_cart.cart_data.cart[product_index].items[
      item_index
    ].total_item_price = (total_item_price + total_specification_price) * qty;
    this.user_cart.cart_data.cart[product_index].items[
      item_index
    ].total_item_tax = total_item_tax * qty;
    this.calculateTotalAmount();
  }

  decrease_qty(product_index, item_index) {
    if (
      this.user_cart.cart_data.cart[product_index].items[item_index].quantity >
      1
    ) {
      this.user_cart.cart_data.cart[product_index].items[item_index].quantity--;

      let qty =
        this.user_cart.cart_data.cart[product_index].items[item_index].quantity;
      let total_item_price =
        this.user_cart.cart_data.cart[product_index].items[item_index]
          .item_price;
      let total_specification_price =
        this.user_cart.cart_data.cart[product_index].items[item_index]
          .total_specification_price;
      let total_item_tax =
        this.user_cart.cart_data.cart[product_index].items[item_index]
          .total_tax;
      this.user_cart.cart_data.cart[product_index].items[
        item_index
      ].total_price = total_item_price + total_specification_price;
      this.user_cart.cart_data.cart[product_index].items[
        item_index
      ].total_item_price = (total_item_price + total_specification_price) * qty;
      this.user_cart.cart_data.cart[product_index].items[
        item_index
      ].total_item_tax = total_item_tax * qty;
      this.calculateTotalAmount();
    }
  }

  add_to_cart() {
    var store = JSON.parse(localStorage.getItem('store'));
    if (store !== null) {
      this.user_cart.destination_address.location = store.location;
      this.user_cart.destination_address.address = store.address;
      this.user_cart.cart_data.destination_addresses.push(
        this.user_cart.destination_address
      );

      this.user_cart.pickup_address.location = store.location;
      this.user_cart.pickup_address.address = store.address;
      this.user_cart.pickup_address.user_details.email = store.email;
      this.user_cart.pickup_address.user_details.country_phone_code =
        store.country_phone_code;
      this.user_cart.pickup_address.user_details.phone = store.phone;
      this.user_cart.pickup_address.user_details.name = store.name;
      this.user_cart.cart_data.pickup_addresses.push(
        this.user_cart.pickup_address
      );
    }

    let json = {
      user_id: '',
      server_token: '',
      user_type: 1,
      store_id: this.user_cart.cart_data.selectedStoreId,
      cart_unique_token: this.user_cart.cart_unique_token,
      order_details: this.user_cart.cart_data.cart,
      destination_addresses: this.user_cart.cart_data.destination_addresses,
      pickup_addresses: this.user_cart.cart_data.pickup_addresses,
    };

    this.http.post(this.POST_METHOD.ADD_ITEM_IN_CART, json).subscribe(
      (res_data: any) => {
        if (res_data.success) {
          this.user_cart.cart_data.cart_id = res_data.cart_id;
          this.user_cart.cart_data.city_id = res_data.city_id;
          this.data.storage = {
            message: this.MESSAGE_CODE[res_data.message],
            class: 'alert-info',
          };
          this.router.navigate(['store/invoice']);
        } else {
          this.data.storage = {
            message: this.ERROR_CODE[res_data.error_code],
            class: 'alert-danger',
          };
        }
        this.message();
      },
      (error: any) => {
        this.http_status(error);
      }
    );
  }

  create_order_without_item() {
    this.router.navigate(['store/create_order_without_item']);
  }

  calculateTotalAmount() {
    let total = 0;
    let total_item_tax = 0;
    let product_total = 0;
    let product_total_item_tax = 0;
    this.user_cart.cart_data.cart.forEach((product) => {
      product.items.forEach((item) => {
        total = total + item.total_item_price;
        total_item_tax = total_item_tax + item.total_item_tax;
        product_total = product_total + item.total_item_price;
        product_total_item_tax = product_total_item_tax + item.total_item_tax;
      });
      product.total_item_tax = product_total_item_tax;
      product.total_item_price = product_total;
      product_total = 0;
      product_total_item_tax = 0;
    });
    this.user_cart.total_cart_amount = total;
    this.user_cart.total_item_tax = total_item_tax;

    if (this.user_cart.cart_data.total_item == 0) {
      this.clear_cart();
    }
  }

  clear_cart() {
    this.user_cart.cart_data = {
      cart_id: null,
      city_id: null,
      deliveryAddress: '',
      deliveryLatLng: [0, 0],
      delivery_addresses: [],
      pickup_addresses: [],
      cart: [],
      selectedStoreId: null,
      total_item: 0,
    };
    this.user_cart.total_cart_amount = 0;
    this.user_cart.total_item_tax = 0;
    this.user_cart.order_payment_id = null;
  }

  remove_from_cart(product_index, item_index) {
    this.user_cart.cart_data.cart[product_index].items.splice(item_index, 1);
    if (this.user_cart.cart_data.cart[product_index].items.length <= 0) {
      this.user_cart.cart_data.cart.splice(product_index, 1);
    }
    this.user_cart.cart_data.total_item--;
    this.calculateTotalAmount();
  }

  public myStartDatePickerOptions: any = {
    // other options...
    dateFormat: 'mm-dd-yyyy',
    openSelectorOnInputClick: true,
    showInputField: true,
    showClearDateBtn: false,
    editableMonthAndYear: false,
    editableDateField: false,
    disableUntil: { year: null, month: null, day: null },
    selectionTxtFontSize: '13px',
    alignSelectorRight: false,
    disableSince: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate() + 1,
    },
  };
  public myEndDatePickerOptions: any = {
    // other options...
    dateFormat: 'mm-dd-yyyy',
    openSelectorOnInputClick: true,
    showInputField: true,
    showClearDateBtn: false,
    editableMonthAndYear: false,
    editableDateField: false,
    disableUntil: { year: null, month: null, day: null },
    selectionTxtFontSize: '13px',
    alignSelectorRight: true,
    disableSince: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate() + 1,
    },
  };
  private ExpiryDatePickerOptions: any = {
    // other options...
    dateFormat: 'mm-dd-yyyy',
    openSelectorOnInputClick: true,
    showInputField: true,
    showClearDateBtn: false,
    editableMonthAndYear: false,
    editableDateField: false,
    disableUntil: {
      year: new Date().getFullYear(),
      month: new Date().getMonth(),
      day: new Date().getDate() - 1,
    },
    selectionTxtFontSize: '13px',
    alignSelectorRight: true,
    disableSince: { year: 0, month: 0, day: 0 },
  };

  onStartDateChanged(event: IMyDateModel) {
    // event properties are: event.date, event.jsdate, event.formatted and event.epoc
    if (event.date.day !== 0) {
      this.myEndDatePickerOptions.disableUntil.year = event.date.year;
      this.myEndDatePickerOptions.disableUntil.month = event.date.month;
      this.myEndDatePickerOptions.disableUntil.day = event.date.day;
    } else {
      this.myEndDatePickerOptions.disableUntil.year = null;
      this.myEndDatePickerOptions.disableUntil.month = null;
      this.myEndDatePickerOptions.disableUntil.day = null;
    }
  }
  onEndDateChanged(event: IMyDateModel) {
    // event properties are: event.date, event.jsdate, event.formatted and event.epoc
    if (event.date.day !== 0) {
      this.myStartDatePickerOptions.disableSince.year = event.date.year;
      this.myStartDatePickerOptions.disableSince.month = event.date.month;
      this.myStartDatePickerOptions.disableSince.day = event.date.day;
    } else {
      this.myStartDatePickerOptions.disableSince.year =
        new Date().getFullYear();
      this.myStartDatePickerOptions.disableSince.month =
        new Date().getMonth() + 1;
      this.myStartDatePickerOptions.disableSince.day = new Date().getDate() + 1;
    }
  }

  /// date picker for promo code //

  private promocodeStartDatePickerOptions: any = {
    // other options...
    dateFormat: 'mm-dd-yyyy',
    openSelectorOnInputClick: true,
    showInputField: true,
    showClearDateBtn: false,
    editableMonthAndYear: false,
    editableDateField: false,
    disableUntil: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate() - 1,
    },
    selectionTxtFontSize: '13px',
    alignSelectorRight: true,
    disableSince: { year: 0, month: 0, day: 0 },
  };
  private promocodeEndDatePickerOptions: any = {
    // other options...
    dateFormat: 'mm-dd-yyyy',
    openSelectorOnInputClick: true,
    showInputField: true,
    showClearDateBtn: false,
    editableMonthAndYear: false,
    editableDateField: false,
    disableUntil: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate() - 1,
    },
    selectionTxtFontSize: '13px',
    alignSelectorRight: true,
    disableSince: { year: 0, month: 0, day: 0 },
  };

  promocodeOnStartDateChanged(event: IMyDateModel) {
    // event properties are: event.date, event.jsdate, event.formatted and event.epoc
    if (event.date.day !== 0) {
      this.promocodeEndDatePickerOptions.disableUntil.year = event.date.year;
      this.promocodeEndDatePickerOptions.disableUntil.month = event.date.month;
      this.promocodeEndDatePickerOptions.disableUntil.day = event.date.day - 1;
    } else {
      this.promocodeEndDatePickerOptions.disableUntil.year = null;
      this.promocodeEndDatePickerOptions.disableUntil.month = null;
      this.promocodeEndDatePickerOptions.disableUntil.day = null;
    }
  }
  promocodeOnEndDateChanged(event: IMyDateModel) {
    // event properties are: event.date, event.jsdate, event.formatted and event.epoc
    if (event.date.day !== 0) {
      this.promocodeStartDatePickerOptions.disableSince.year = event.date.year;
      this.promocodeStartDatePickerOptions.disableSince.month =
        event.date.month;
      this.promocodeStartDatePickerOptions.disableSince.day =
        event.date.day + 1;
    } else {
      this.promocodeStartDatePickerOptions.disableSince.year =
        new Date().getFullYear();
      this.promocodeStartDatePickerOptions.disableSince.month =
        new Date().getMonth() + 1;
      this.promocodeStartDatePickerOptions.disableSince.day =
        new Date().getDate() + 1;
    }
  }

  ////

  number_validation(evt) {
    var charCode = evt.which ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      if (charCode == 46) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }

  location_validation(evt) {
    var charCode = evt.which ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      if (charCode == 46 || charCode == 45) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }

  price_validation(evt, price) {
    var charCode = evt.which ? evt.which : evt.keyCode;
    price = price.toString();
    price = price.split('.');
    if (price[0] <= price_validation.MAX_PRICE) {
      if (price[1] == undefined) {
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
          if (charCode == 46 && price[0] > 1) {
            return true;
          }
          return false;
        }
        return true;
      } else {
        if (price[1] <= price_validation.MAX_PRICE_AFTER_POINT) {
          if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
          }
          return true;
        } else {
          if (charCode == 8) {
            return true;
          }
          return false;
        }
      }
    } else {
      if (price[1] != undefined) {
        if (price[1] <= price_validation.MAX_PRICE_AFTER_POINT) {
          if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
          }
          return true;
        } else {
          if (charCode == 8) {
            return true;
          }
          return false;
        }
      } else {
        if (charCode == 46 || charCode == 8) {
          return true;
        }
        return false;
      }
    }
  }

  downloadFile(data: any) {
    var blob = new Blob([data], { type: 'text/csv' });
    var url = window.URL.createObjectURL(blob);
    var element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', url + '.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  getIDFromEmailToken(email_token) {
    var server_token = '',
      id = '',
      milli = '';
    var milli_seconds = 0;
    var length = 30; // 13 milli seconds so * 2 => 26

    var milli_token = email_token.substr(0, length);
    var id_token = email_token.substr(length);

    for (var i = 0; i < length; i++) {
      if (i % 2 == 0) {
        milli = milli + milli_token.charAt(i);
      } else {
        server_token = server_token + milli_token.charAt(i);
      }
    }

    milli = milli.split('').reverse().join('');
    milli_seconds = parseInt(milli);

    length = id_token.length;
    for (var i = 0; i < length; i++) {
      if (i % 2 == 0) {
        id = id + id_token.charAt(i);
      } else {
        server_token = server_token + id_token.charAt(i);
      }
    }
    return { id: id, server_token: server_token, milli_seconds: milli_seconds };
  }
}
