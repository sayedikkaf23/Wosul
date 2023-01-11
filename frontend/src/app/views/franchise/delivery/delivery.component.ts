import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';

import { Helper } from '../../franchise_helper';
import jQuery from 'jquery';
//import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
declare var swal: any;

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  providers: [Helper],
})
export class FranchiseStoreDeliveryComponent implements OnInit {
  title: any;
  button: any;
  ORDER_STATE: any;
  heading_title: any;
  status: any;
  franchise_id: Object;
  server_token: String;
  order_list: any[];
  interval: any;

  sort_field: string;
  sort_order: number;
  search_field: string;
  search_value: string;
  page: number;
  total_page: number;
  total_pages: number[];
  order_payment_id: Object;

  myLoading: Boolean = true;
  constructor(public helper: Helper, public vcr: ViewContainerRef) {}

  ngAfterViewInit() {
    jQuery('.chosen-select').chosen({ disable_search: true });
    setTimeout(function () {
      jQuery('.chosen-select').trigger('chosen:updated');
    }, 1000);
  }

  ngOnInit() {
    this.sort_field = 'unique_id';
    this.sort_order = -1;
    this.search_field = 'user_detail.first_name';
    this.search_value = '';
    this.page = 1;
    this.order_payment_id = null;

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
    /*if(!JSON.parse(localStorage.getItem('store_document_ulpoaded')) && JSON.parse(localStorage.getItem('admin_store_document_ulpoaded')))
        {
            this.helper.router.navigate(['store/upload_document']);
        }*/
    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
    this.ORDER_STATE = this.helper.ORDER_STATE;
    this.status = this.helper.status;
    this.order_list = [];
    this.orderDetail();
    this.interval = setInterval(() => {
      this.orderDetail();
    }, this.helper.TIMEOUT.NEW_ORDER_REQUEST);

    jQuery(document.body)
      .find('#sort_field')
      .on('change', (evnt, res_data) => {
        this.sort_field = res_data.selected;
      });
    jQuery(document.body)
      .find('#sort_order')
      .on('change', (evnt, res_data) => {
        this.sort_order = res_data.selected;
      });
    jQuery(document.body)
      .find('#search_field')
      .on('change', (evnt, res_data) => {
        this.search_field = res_data.selected;
      });
  }
  ngOnDestroy() {
    clearInterval(this.interval);
  }
  activeRoute(routename: string): boolean {
    return this.helper.router.url.indexOf(routename) > -1;
  }

  filter(page) {
    this.myLoading = true;
    this.page = page;
    this.helper.http
      .post(this.helper.POST_METHOD.DELIVERY_LIST_SEARCH_SORT, {
        franchise_id: this.franchise_id,
        server_token: this.server_token,
        sort_field: this.sort_field,
        sort_order: this.sort_order,
        search_field: this.search_field,
        search_value: this.search_value,
        page: this.page,
      })
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;
          if (res_data.success == false) {
            this.order_list = [];
            this.total_pages = [];
          } else {
            this.order_list = res_data.orders;
            this.total_page = res_data.pages;
            this.total_pages = Array(res_data.pages)
              .fill((x, i) => i)
              .map((x, i) => i + 1);
          }
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
  }

  vieworder_detail(id) {
    this.helper.router_id.franchise.order_id = id;
    this.helper.router.navigate(['franchise/order/detail']);
  }
  viewcart_detail(id) {
    this.helper.router_id.franchise.order_id = id;
    this.helper.router.navigate(['franchise/cart/detail']);
  }

  track_deliveryman(id) {
    this.helper.router_id.franchise.order_id = id;
    this.helper.router.navigate(['franchise/order/track_delivery_man']);
  }
  orderDetail() {
    this.helper.http
      .post(this.helper.POST_METHOD.DELIVERY_LIST_SEARCH_SORT, {
        franchise_id: this.franchise_id,
        server_token: this.server_token,
        sort_field: this.sort_field,
        sort_order: this.sort_order,
        search_field: this.search_field,
        search_value: this.search_value,
        page: this.page,
      })
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;
          if (res_data.success == false) {
            this.order_list = [];
            this.total_page = res_data.pages;
            this.total_pages = Array(res_data.pages)
              .fill((x, i) => i)
              .map((x, i) => i + 1);
          } else {
            this.total_page = res_data.pages;
            this.total_pages = Array(res_data.pages)
              .fill((x, i) => i)
              .map((x, i) => i + 1);

            this.order_list.forEach((value, index) => {
              var new_index = res_data.orders.findIndex(
                (x) => x._id == this.order_list[index]._id
              );
              if (new_index == -1) {
                this.order_list.splice(index, 1);
              } else {
                this.order_list[index].order_status =
                  res_data.orders[new_index].order_status;
                this.order_list[index].provider_detail =
                  res_data.orders[new_index].provider_detail;
              }
            });

            res_data.orders.forEach((new_value, index) => {
              var aaa = this.order_list.findIndex(
                (x) => x._id == res_data.orders[index]._id
              );

              if (aaa == -1) {
                this.order_list.unshift(new_value);
              }
              // if(value._id === new_value._id)
              // {
              //     value.order_status=new_value.order_status;
              // }
            });
          }
        },
        (error: any) => {
          this.helper.http_status(error);
        }
      );
  }
}
