import { Component, OnInit, ViewContainerRef } from '@angular/core';

import { Helper } from '../../franchise_helper';
import jQuery from 'jquery';

@Component({
  selector: 'app-order_earning_detail',
  templateUrl: './order_earning_detail.component.html',
  providers: [Helper],
})
export class FranchiseOrderEarningDetailComponent implements OnInit {
  title: any;
  button: any;
  heading_title: any;
  status: any;
  order_id: Object;
  franchise_id: Object;
  server_token: String;

  myLoading: boolean = true;

  order_detail: any[] = [];
  currency_sign: any = '';
  //total_order_price: number;
  order_total: number = 0;
  product_item_total: number = 0;
  product_item_total_array: number[] = [];
  product_item_specification_total: number = 0;
  product_item_specification_total_array: number[] = [];
  product_specification_total_array: any[] = [];
  total_item: number = 0;

  total_time: number = 0;
  total_distance: number = 0;

  base_price: number = 0;
  total_distance_price: number = 0;
  total_time_price: number = 0;
  total_service_price: number = 0;
  total_after_tax_price: number = 0;
  total_surge_price: number = 0;
  total_delivery_price: number = 0;
  promo_payment: number = 0;

  total_order_price: number = 0;
  service_tax: number = 0;
  total_cart_price: number = 0;

  total: number = 0;
  wallet_payment: number = 0;

  cash_payment: number = 0;
  card_payment: number = 0;

  store_have_service_payment: number = 0;
  store_have_order_payment: number = 0;
  pay_to_store: number = 0;
  total_store_income: number = 0;
  is_user_pick_up_order: Boolean = false;

  provider_paid_order_payment: number = 0;
  provider_have_cash_payment: number = 0;
  pay_to_provider: number = 0;
  total_provider_income: number = 0;

  total_admin_profit_on_store: number = 0;
  total_admin_profit_on_delivery: number = 0;
  admin_profit_value_on_delivery: number = 0;
  admin_profit_value_on_store: number = 0;
  current_rate: number = 0;
  total_store_tax_price: number = 0;
  is_promo_for_delivery_service: Boolean = false;

  user_first_name: String = '';
  user_last_name: String = '';
  user_email: String = '';
  user_address: String = '';
  order_user_name: string = '';
  order_user_phone: string = '';
  destination_address: string = '';
  provider_first_name: String = '';
  provider_last_name: String = '';
  provider_email: String = '';
  invoice_number: String = '';

  ORDER_STATE: any = this.helper.ORDER_STATE;
  ORDER_STATUS_ID: any = this.helper.ORDER_STATUS_ID;
  order_status: number = 0;
  order_status_id: number = 0;
  created_at: any = 0;
  store_accepted_at: any = 0;
  start_preparing_order_at: any = 0;
  order_ready_at: any = 0;
  store_order_created_at: any = 0;
  accepted_at: any = 0;
  cancelled_at: any = 0;
  start_for_pickup_at: any = 0;
  arrived_on_store_at: any = 0;
  picked_order_at: any = 0;
  start_for_delivery_at: any = 0;
  delivered_at: any = 0;
  completed_at: any = 0;

  constructor(public helper: Helper, public vcr: ViewContainerRef) {}
  ngOnInit() {
    let token = this.helper.getToken();

    if (!token) {
      this.helper.router.navigate(['franchise/logout']);
    }
    this.helper.message();
    var franchise = JSON.parse(localStorage.getItem('franchise'));
    if (franchise !== null) {
      this.franchise_id = franchise._id;
      this.server_token = franchise.server_token;
    }
    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
    this.status = this.helper.status;

    this.order_id = this.helper.router_id.franchise.view_order_earning_id;

    if (this.order_id !== '') {
      this.helper.http
        .post(this.helper.POST_METHOD.GET_ORDER_DATA, {
          order_id: this.order_id,
          franchise_id: this.franchise_id,
          server_token: this.server_token,
        })
        .subscribe(
          (res_data: any) => {
            this.myLoading = false;
            if (!res_data.success) {
              this.helper.data.storage = {
                code: res_data.error_code,
                message: this.helper.ERROR_CODE[res_data.error_code],
                class: 'alert-danger',
              };
              this.helper.router.navigate(['franchise/history']);
            } else {
              this.user_first_name = res_data.order.user_detail.first_name;
              this.user_last_name = res_data.order.user_detail.last_name;
              this.user_email = res_data.order.user_detail.email;
              this.user_address = res_data.order.user_detail.address;

              this.order_user_name = res_data.order.delivery_user_name;
              this.order_user_phone = res_data.order.delivery_user_phone;
              this.destination_address = res_data.order.destination_address;

              if (res_data.order.provider_detail.length > 0) {
                this.provider_first_name =
                  res_data.order.provider_detail[0].first_name;
                this.provider_last_name =
                  res_data.order.provider_detail[0].last_name;
                this.provider_email = res_data.order.provider_detail[0].email;
              }

              this.invoice_number = res_data.order.invoice_number;
              this.order_status = res_data.order.order_status;
              this.order_status_id = res_data.order.order_status_id;

              this.created_at = res_data.order.created_at;
              this.store_accepted_at = res_data.order.store_accepted_at;
              this.start_preparing_order_at =
                res_data.order.start_preparing_order_at;
              this.order_ready_at = res_data.order.order_ready_at;
              this.store_order_created_at =
                res_data.order.store_order_created_at;
              this.accepted_at = res_data.order.accepted_at;
              this.cancelled_at = res_data.order.cancelled_at;
              this.start_for_pickup_at = res_data.order.start_for_pickup_at;
              this.arrived_on_store_at = res_data.order.arrived_on_store_at;
              this.picked_order_at = res_data.order.picked_order_at;
              this.start_for_delivery_at = res_data.order.start_for_delivery_at;
              this.delivered_at = res_data.order.delivered_at;
              this.completed_at = res_data.order.completed_at;

              this.total_time = res_data.order.order_payment_detail.total_time;
              this.total_distance =
                res_data.order.order_payment_detail.total_distance;
              this.is_user_pick_up_order =
                res_data.order.order_payment_detail.is_user_pick_up_order;
              this.base_price = res_data.order.order_payment_detail.base_price;
              this.total_distance_price =
                res_data.order.order_payment_detail.distance_price;
              this.total_time_price =
                res_data.order.order_payment_detail.total_time_price;
              this.total_service_price =
                res_data.order.order_payment_detail.total_service_price;
              this.total_after_tax_price =
                res_data.order.order_payment_detail.total_admin_tax_price;
              this.total_surge_price =
                res_data.order.order_payment_detail.total_surge_price;
              this.total_delivery_price =
                res_data.order.order_payment_detail.total_delivery_price;
              this.promo_payment =
                res_data.order.order_payment_detail.promo_payment;
              this.total_delivery_price =
                res_data.order.order_payment_detail.total_delivery_price;

              this.total_order_price =
                res_data.order.order_payment_detail.total_order_price;
              this.total_order_price =
                res_data.order.order_payment_detail.total_order_price;
              this.service_tax =
                res_data.order.order_payment_detail.service_tax;
              this.total_store_tax_price =
                res_data.order.order_payment_detail.total_store_tax_price;

              this.total = res_data.order.order_payment_detail.total;
              this.wallet_payment =
                res_data.order.order_payment_detail.wallet_payment;
              this.cash_payment =
                res_data.order.order_payment_detail.cash_payment;
              this.card_payment =
                res_data.order.order_payment_detail.card_payment;

              this.store_have_service_payment =
                res_data.order.order_payment_detail.store_have_service_payment;
              this.store_have_order_payment =
                res_data.order.order_payment_detail.store_have_order_payment;
              this.total_store_income =
                res_data.order.order_payment_detail.total_store_income;
              this.pay_to_store =
                res_data.order.order_payment_detail.pay_to_store;

              this.provider_have_cash_payment =
                res_data.order.order_payment_detail.provider_have_cash_payment;
              this.provider_paid_order_payment =
                res_data.order.order_payment_detail.provider_paid_order_payment;
              this.total_provider_income =
                res_data.order.order_payment_detail.total_provider_income;
              this.pay_to_provider =
                res_data.order.order_payment_detail.pay_to_provider;

              this.total_admin_profit_on_store =
                res_data.order.order_payment_detail.total_admin_profit_on_store;
              this.total_admin_profit_on_delivery =
                res_data.order.order_payment_detail.total_admin_profit_on_delivery;
              this.admin_profit_value_on_delivery =
                res_data.order.order_payment_detail.admin_profit_value_on_delivery;
              this.admin_profit_value_on_store =
                res_data.order.order_payment_detail.admin_profit_value_on_store;

              this.current_rate =
                res_data.order.order_payment_detail.current_rate;

              this.order_detail = res_data.order.order_details;
              this.currency_sign = res_data.order.currency;
              //this.total_order_price = res_data.order.total_order_price
              this.total_cart_price =
                res_data.order.order_payment_detail.total_cart_price;
              this.is_promo_for_delivery_service =
                res_data.order.order_payment_detail.is_promo_for_delivery_service;

              res_data.order.order_details.forEach((product) => {
                product.items.forEach((item) => {
                  this.order_total =
                    this.order_total +
                    (item.item_price + item.total_specification_price) *
                      item.quantity;
                  this.product_item_total =
                    this.product_item_total +
                    (item.item_price + item.total_specification_price) *
                      item.quantity;
                  this.total_item = this.total_item + 1;
                  item.specifications.forEach((specification) => {
                    this.product_item_specification_total =
                      this.product_item_specification_total +
                      specification.specification_price;
                  });
                  this.product_item_specification_total_array.push(
                    this.product_item_specification_total
                  );
                  this.product_item_specification_total = 0;
                });
                this.product_specification_total_array.push(
                  this.product_item_specification_total_array
                );
                this.product_item_specification_total_array = [];
                this.product_item_total_array.push(this.product_item_total);
                this.product_item_total = 0;
              });
            }
          },
          (error: any) => {
            this.myLoading = false;
            this.helper.http_status(error);
          }
        );
    } else {
      this.myLoading = false;
      this.helper.router.navigate(['franchise/earning']);
    }
  }
}
