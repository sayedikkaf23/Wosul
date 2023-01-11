import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';

import { Helper } from '../../store_helper';
import jQuery from 'jquery';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

export interface subStitute {
  main_item_id: Object;
  sub_item_id: Array<string>;
  cart_id: Object;
}

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  providers: [Helper],
})
export class StoreOrderComponents implements OnInit {
  @ViewChild('cancel_order_modal')
  cancel_order_modal: any;

  @ViewChild('complete_order_modal')
  complete_order_modal: any;

  @ViewChild('estimated_time_modal')
  estimated_time_modal: any;

  @ViewChild('order_detail_modal')
  order_detail_modal: any;

  @ViewChild('user_map_modal')
  user_map_modal: any;

  @ViewChild('sub_items_modal_for_user')
  sub_items_modal_for_user: any;

  current_index: number = -1;
  estimated_time: number = null;

  new_total_item_tax: number;
  new_total_cart_price: number;

  order_id: Object = null;
  confirmation_code_for_complete_delivery: number = null;
  confirmation_code: number = null;
  conf_code_error_message: Boolean = false;
  is_confirmation_code_required_at_complete_delivery: Boolean = false;

  title: any;
  button: any;
  ORDER_STATE: any;
  heading_title: any;
  status: any;
  store_id: Object;
  server_token: String;
  order_list: any[];
  interval: any;
  order_detail: any = {};
  selected_order_id: any = '';

  payment_mode: string = '';
  order_type: string = '';
  pickup_type: string = '';
  search_field: string;
  search_value: string;
  page: number;
  total_page: number;
  total_pages: number[];
  substitute_items: string[];
  substituted_items: any = [];

  current_order: any = [];
  cancel_reason: string = '';
  currency_sign: string = '';
  myLoading: boolean = true;

  total_item: number = 0;
  order_total: number = 0;
  product_item_total: number = 0;
  product_item_total_array: number[] = [];
  product_item_specification_total: number = 0;
  product_item_specification_total_array: number[] = [];
  product_specification_total_array: any[] = [];
  hide_specification_group: any[] = [];
  specifications: any[] = [];
  item_note: string = '';
  is_show_specification: boolean = false;
  store_detail: any = {};

  map: any;
  user_marker: any;
  store_marker: any;
  timer: any;
  vehicles: any[] = [];
  vehicle_id: string = '';
  @ViewChild('vehicle_list_modal')
  vehicle_list_modal: any;
  delivery_type: number = 1;

  public substitute: subStitute;
  substitute_item_list: any[];
  currentItem: any;
  currentCartId: string;
  currentItemIndex: any = -1;
  currentProductIndex: any = -1;

  constructor(
    public helper: Helper,
    public vcr: ViewContainerRef,
    private modalService: NgbModal,
    private activeModal: NgbActiveModal
  ) {}

  ngAfterViewInit() {
    jQuery('.chosen-select').chosen({ disable_search: true });
    setTimeout(function () {
      jQuery('.chosen-select').trigger('chosen:updated');
    }, 1000);
  }

  ngOnInit() {
    this.search_field = 'user_detail.first_name';
    this.search_value = '';
    this.page = 1;

    let token = this.helper.getToken();

    if (!token) {
      this.helper.router.navigate(['store/logout']);
    }

    this.substitute = {
      sub_item_id: null,
      main_item_id: null,
      cart_id: null,
    };

    this.helper.message();
    var store = JSON.parse(localStorage.getItem('store'));
    if (store !== null) {
      this.store_id = store._id;
      this.server_token = store.server_token;
      this.store_detail = store;
    }

    if (
      !JSON.parse(localStorage.getItem('store_document_ulpoaded')) &&
      JSON.parse(localStorage.getItem('admin_store_document_ulpoaded'))
    ) {
      this.helper.router.navigate(['store/upload_document']);
    }
    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
    this.ORDER_STATE = this.helper.ORDER_STATE;
    this.status = this.helper.status;
    this.order_list = [];
    this.filter(1);
    this.interval = setInterval(() => {
      this.orderDetail();
    }, this.helper.TIMEOUT.NEW_ORDER_REQUEST);

    // this.timer = setInterval(()=>{
    //   this.order_list.forEach((order)=>{
    //     if(order.order_status == this.ORDER_STATE.OREDER_READY){
    //       var ct = new Date();
    //       var updatedAt = new Date(order.updated_at)
    //       var diff = ct.getTime() - updatedAt.getTime()
    //       diff = Math.round((diff/ 60000));
    //       diff = Number(diff.toFixed())
    //       if(diff <= order.deliver_in){
    //       if(order.deliver){
    //           order.deliver = new Date(order.deliver.getTime()-5000)
    //         }
    //         else{
    //           order.deliver = new Date();
    //           var setmin = order.deliver_in - diff
    //           order.deliver.setMinutes(setmin, 0);
    //         }
    //       }
    //       else{
    //         order.deliver = new Date()
    //         order.deliver = order.deliver.setMinutes(0, 0);
    //       }
    //   }
    //   })
    // },5000)
    // timer(e){
    //   console.log("timer >>>",e)
    // }
    this.currentItem = null;
    this.currentProductIndex = -1;
    this.currentItemIndex = -1;
    this.currentCartId = '';

    jQuery(document.body)
      .find('#search_field')
      .on('change', (evnt, res_data) => {
        this.search_field = res_data.selected;
      });
    jQuery(document.body)
      .find('#payment_mode')
      .on('change', (evnt, res_data) => {
        this.payment_mode = res_data.selected;
      });
    jQuery(document.body)
      .find('#order_type')
      .on('change', (evnt, res_data) => {
        this.order_type = res_data.selected;
      });
    jQuery(document.body)
      .find('#pickup_type')
      .on('change', (evnt, res_data) => {
        this.pickup_type = res_data.selected;
      });
  }
  ngOnDestroy() {
    clearInterval(this.interval);
    // clearInterval(this.timer);
  }
  activeRoute(routename: string): boolean {
    return this.helper.router.url.indexOf(routename) > -1;
  }

  edit_order(order_id) {
    this.helper.router_id.store.order_id = order_id;
    this.helper.router.navigate(['store/edit/order']);
  }

  open_map_modal(order_id) {
    this.modalService.open(this.user_map_modal);

    jQuery(document.body)
      .find('#order_' + order_id)
      .toggle();
    let index = this.order_list.findIndex((x) => x._id == order_id);
    this.order_list[index].is_show = !this.order_list[index].is_show;

    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 7,
      streetViewControl: false,
      center: { lat: 0, lng: 0 },
    });

    var bounds = new google.maps.LatLngBounds();

    this.user_marker = new google.maps.Marker({
      position: { lat: 0, lng: 0 },
      map: this.map,
      icon: 'map_pin_images/Admin/user_pin.png',
    });

    var user_location_bound = new google.maps.LatLng(
      this.order_list[index].cart_detail.destination_addresses[0].location[0],
      this.order_list[index].cart_detail.destination_addresses[0].location[1]
    );
    this.user_marker.setPosition(user_location_bound);
    bounds.extend(user_location_bound);

    this.map.fitBounds(bounds);
  }
  filter(page) {
    this.myLoading = true;
    this.page = page;
    this.helper.http
      .post(this.helper.POST_METHOD.ORDER_LIST_SEARCH_SORT, {
        store_id: this.store_id,
        server_token: this.server_token,
        payment_mode: this.payment_mode,
        order_type: this.order_type,
        pickup_type: this.pickup_type,
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
            this.currency_sign = res_data.currency_sign;
            this.order_list = res_data.orders;
            this.total_page = res_data.pages;
            this.total_pages = Array(res_data.pages)
              .fill((x, i) => i)
              .map((x, i) => i + 1);
            this.is_confirmation_code_required_at_complete_delivery =
              res_data.is_confirmation_code_required_at_complete_delivery;
            if (this.order_list.length > 0) {
              this.order_detail = JSON.parse(
                JSON.stringify(this.order_list[0])
              );
            }
            this.order_list.forEach((order) => {
              order.is_show = false;
            });
          }
          jQuery('#sortable-1').sortable({
            connectWith: '#sortable-2',
            dropOnEmpty: true,
            remove: (event, ui) => {
              let index = ui.item[0].attributes.id.value;
              this.orderStatus({
                order_id: this.order_list[index]._id,
                order_type: this.order_list[index].order_type,
                order_status: this.ORDER_STATE.STORE_ACCEPTED,
                request_id: this.order_list[index].request_id,
              });
            },
          });
          jQuery('#sortable-2').sortable({
            connectWith: '#sortable-3',
            dropOnEmpty: true,
            cursorAt: { left: 5 },
            remove: (event, ui) => {
              let index = ui.item[0].attributes.id.value;
              this.orderStatus({
                order_id: this.order_list[index]._id,
                order_type: this.order_list[index].order_type,
                order_status: this.ORDER_STATE.STORE_PREPARING_ORDER,
                request_id: this.order_list[index].request_id,
              });
            },
          });
          jQuery('#sortable-3').sortable({
            connectWith: '#sortable-4',
            dropOnEmpty: true,
            remove: (event, ui) => {
              let index = ui.item[0].attributes.id.value;
              var checkout_amount = Number(prompt('Please Enter Checkout Amount in AED : '));
              while (isNaN(checkout_amount)) {
                checkout_amount = Number(prompt('Please Enter Checkout Amount in AED : '));
              }
              var deliver_in = Number(
                prompt('Please Enter Delivry Time in Min : ')
              );
              while (isNaN(deliver_in)) {
                deliver_in = Number(
                  prompt('Please Enter Delivry Time in Min : ')
                );
              }
              if (deliver_in == 0) {
                deliver_in = this.order_list[index].deliver_in;
              }
              this.orderStatus({
                order_id: this.order_list[index]._id,
                order_type: this.order_list[index].order_type,
                order_status: this.ORDER_STATE.OREDER_READY,
                request_id: this.order_list[index].request_id,
                deliver_in: deliver_in,
                checkout_amount : checkout_amount ? checkout_amount : 0 
              });
            },
          });
          jQuery('#sortable-4').sortable();
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
  }

  vieworder_detail(id) {
    this.helper.router_id.store.order_id = id;
    this.helper.router.navigate(['store/order/detail']);
  }

  viewcart_detail(id) {
    this.helper.router_id.store.order_id = id;
    this.helper.router.navigate(['store/cart/detail']);
  }
  substitueItems = {};

  showSubstitute(id) {
    return this.substitueItems[id];
  }

  fetchSubstitute(item) {
    if (
      item &&
      item.substitute_items &&
      item.substitute_items.length &&
      !item.subs_items
    ) {
      this.substitueItems['id'] = item.item_id;
      const subs_ids = item.substitute_items;

      this.helper.http
        .post('/api/user/get_substitute_items', {
          if_store_panel: true,
          item_id: item.item_id,
          store_id: this.store_id,
        })

        .subscribe((res_data: any) => {
          const substitute_item_list = res_data.items ? res_data.items : [];
          const subs_items = substitute_item_list.filter((s) =>
            subs_ids.includes(s._id)
          );
          item.subs_items = subs_items;
        });
    }
  }

  open_sub_items_modal_for_user(item_id, cart_id, product_index, item_index) {
    this.substitute.main_item_id = item_id;
    this.substitute.cart_id = cart_id;
    if (
      typeof this.order_detail.cart_detail.order_details[product_index].items[
        item_index
      ].substitute_items != 'undefined'
    )
      this.substitute_items =
        this.order_detail.cart_detail.order_details[product_index].items[
          item_index
        ].substitute_items;

    this.helper.http
      .post('/api/user/get_substitute_items', {
        if_store_panel: true,
        item_id: item_id,
        store_id: this.store_id,
      })

      .subscribe((res_data: any) => {
        this.substitute_item_list = res_data.items;

        var substituted_items = [];
        for (var i = 0; i < this.substitute_items.length; i++) {
          var id = this.substitute_items[i];

          substituted_items.push(this.get_sub_item_detail(id));
        }
        this.substituted_items = substituted_items;
      });
    this.modalService.open(this.sub_items_modal_for_user, {
      windowClass: 'substitute-modal',
    });

    jQuery('.category_list1').chosen();
    jQuery('.category_list1').trigger('chosen:updated');

    setTimeout(() => {
      jQuery('.category_list1').trigger('chosen:updated');
    }, 1000);
  }

  get_sub_item_detail(id) {
    for (var i = 0; i < this.substitute_item_list.length; i++) {
      var item = this.substitute_item_list[i];
      if (item._id == id) return item;
    }
    return null;
  }

  updateSubstituteItemCart() {
    var selected = [];
    var selectedStr = '';
    jQuery('.category_list1 :selected').each(function () {
      var value = jQuery(this).val();
      console.log(value);
      selected.push(value);
      selectedStr += ",'" + value + "'";
    });
    this.substitute.sub_item_id = eval('([' + selectedStr.substr(1) + '])');
    this.substitute_items = this.substitute.sub_item_id;
    var _this2 = this;
    this.helper.http
      .post('/api/store/select_substitute_item', {
        cart_id: this.substitute.cart_id,
        substitute_item_id: this.substitute.sub_item_id,
        item_id: this.substitute.main_item_id,
        store_id: this.store_id,
        server_token: this.server_token,
      })

      .subscribe((res_data: any) => {
        if (res_data.success == true) {
          this.helper.data.storage = {
            message: this.helper.MESSAGE_CODE[res_data.message],
            class: 'alert-info',
          };
          if (res_data.order_details.length > 0) {
            this.order_detail.cart_detail.order_details =
              res_data.order_details;

            let total = 0;
            let total_item_tax = 0;
            let product_total = 0;
            let product_total_item_tax = 0;
            res_data.order_details.forEach((product) => {
              product.items.forEach((item) => {
                total = total + item.total_item_price;
                total_item_tax = total_item_tax + item.total_item_tax;
                product_total = product_total + item.total_item_price;
                product_total_item_tax =
                  product_total_item_tax + item.total_item_tax;
              });
              product.total_item_tax = product_total_item_tax;
              product.total_item_price = product_total;
              product_total = 0;
              product_total_item_tax = 0;
            });
            this.new_total_item_tax = total_item_tax;
            this.new_total_cart_price = total;

            console.log('this.new_total_item_tax ' + this.new_total_item_tax);
            console.log(
              'this.new_total_cart_price ' + this.new_total_cart_price
            );
          }

          /*this.helper.http.post(  '/api/store/update_cart_detail', {total_item_tax:this.new_total_item_tax,total_cart_price:this.new_total_cart_price,cart_id:this.substitute.cart_id,store_id:this.store_id,server_token:this.server_token}).subscribe((res_data:any) => {
           
        });*/

          this.activeModal.close();
          this.pushSendToUser(this.order_detail._id);
          this.filter(1);

          //this.order_detail_modal.open();
        } else {
          this.helper.data.storage = {
            code: res_data.error_code,
            message: this.helper.ERROR_CODE[res_data.error_code],
            class: 'alert-danger',
          };
          this.helper.message();
        }
      });
  }

  pushSendToUser(id) {
    this.helper.http
      .post('/api/store/user_order_confirmation_push', { order_id: id })

      .subscribe((res_data: any) => {});
  }

  get_order_detail(id) {
    let index = this.order_list.findIndex((x) => x._id == id);
    this.current_index = index;
    this.order_detail = JSON.parse(JSON.stringify(this.order_list[index]));

    this.order_total = this.order_detail.order_payment_detail.total_order_price;
    this.total_item = 0;
    this.product_item_specification_total = 0;
    this.product_item_specification_total_array = [];
    this.product_item_total_array = [];
    this.product_specification_total_array = [];

    this.is_show_specification = false;
    this.order_detail.cart_detail.order_details.forEach(
      (product, product_index) => {
        this.hide_specification_group[product_index] = 'false';
        product.items.forEach((item) => {
          this.total_item++;
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
        this.product_item_total_array.push(product.total_item_price);
      }
    );
    this.modalService.open(this.order_detail_modal);

    // if(this.order_detail.cart_detail.order_details.length>0){
    //     this.specifications = this.order_detail.cart_detail.order_details[0].items[0].specifications;
    //     this.item_note = this.order_detail.cart_detail.order_details[0].items[0].note_for_item;
    // }
  }
  hide_specifications_group(specification_group_index) {
    this.hide_specification_group[specification_group_index] = 'true';
    jQuery('#spec_list' + specification_group_index).hide();
  }

  show_specifications_group(specification_group_index) {
    this.hide_specification_group[specification_group_index] = 'false';
    jQuery('#spec_list' + specification_group_index).show();
  }

  get_specification(product_index, item_index) {
    this.is_show_specification = true;
    this.specifications =
      this.order_detail.cart_detail.order_details[product_index].items[
        item_index
      ].specifications;
    this.item_note =
      this.order_detail.cart_detail.order_details[product_index].items[
        item_index
      ].note_for_item;
  }

  checkIfOrderCanComplete() {
    const readyForComplete = this.order_list.filter(
      (o) => o.order_status === this.ORDER_STATE.OREDER_READY
    );
    readyForComplete.forEach((order) => {
      var readyTime = order.date_time.find(
        (o) => o.status === this.ORDER_STATE.OREDER_READY
      );
      if (readyTime) {
        readyTime = readyTime.date;
        const diff = moment().diff(moment(readyTime), 'minutes');
        let time = this.store_detail.auto_complete_order + 15;
        if (!isNaN(time) && diff >= time) {
          // this.orderStatus(order);
          this.completeDeliveryModal(order._id, false, true);
        }
      }
    });
  }
  deliveryTimer() {
    // console.log("timer .....>>",this.order_list)
    const readyOrder = this.order_list.filter(
      (ord) => ord.order_status === this.ORDER_STATE.OREDER_READY
    );

    readyOrder.forEach((order) => {
      // console.log("....timer >>")
      var updatedAt = order.date_time.find(
        (ord_upd) => ord_upd.status === this.ORDER_STATE.OREDER_READY
      );
      // console.log("check timer >>>",updatedAt)
      if (updatedAt) {
        var ct = new Date();
        updatedAt = new Date(updatedAt.date);
        var diff = ct.getTime() - updatedAt.getTime();

        if (diff / 60000 <= order.deliver_in) {
          diff = Math.round(diff / 60000);
          diff = Number(diff.toFixed());
          if (order.deliver) {
            order.deliver = new Date(order.deliver.getTime() - 5000);
          } else {
            order.deliver = new Date();
            var setmin = order.deliver_in - diff;
            order.deliver.setMinutes(setmin, 0);
          }
        } else {
          order.deliver = new Date();
          order.deliver = order.deliver.setMinutes(0, 0);
        }
      }
    });
  }

  orderDetail() {
    this.helper.http
      .post(this.helper.POST_METHOD.ORDER_LIST_SEARCH_SORT, {
        store_id: this.store_id,
        server_token: this.server_token,
        payment_mode: this.payment_mode,
        order_type: this.order_type,
        pickup_type: this.pickup_type,
        search_field: this.search_field,
        search_value: this.search_value,
        page: this.page,
      })

      .subscribe(
        (res_data: any) => {
          this.myLoading = false;
          if (res_data.success == false) {
            this.order_list = [];
          } else {
            this.total_page = res_data.pages;
            this.total_pages = Array(res_data.pages)
              .fill((x, i) => i)
              .map((x, i) => i + 1);
            this.currency_sign = res_data.currency_sign;
            this.order_list.forEach((value, index) => {
              var new_index = res_data.orders.findIndex(
                (x) => x._id == this.order_list[index]._id
              );
              if (new_index == -1) {
                this.order_list.splice(index, 1);
              } else {
                this.order_list[index].order_status =
                  res_data.orders[new_index].order_status;
                this.order_list[index].date_time =
                  res_data.orders[new_index].date_time;
                this.order_list[index].deliver_in =
                  res_data.orders[new_index].deliver_in;
              }
            });

            res_data.orders.forEach((new_value, index) => {
              var aaa = this.order_list.findIndex(
                (x) => x._id == res_data.orders[index]._id
              );

              if (aaa == -1) {
                this.order_list.unshift(new_value);
              }
            });
          }
          // console.log("detail>>>", res_data.orders)
          this.deliveryTimer();
          this.checkIfOrderCanComplete();
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
  }

  orderStatus(data) {
    console.log('data.order_id: >>>>>>', data.order_id);
    var store = JSON.parse(localStorage.getItem('store'));
    if (
      data.order_type == 7 &&
      data.request_id == null &&
      data.order_status === this.ORDER_STATE.STORE_PREPARING_ORDER &&
      store.is_ask_estimated_time_for_ready_order
    ) {
      this.order_id = data.order_id;
      this.modalService.open(this.estimated_time_modal);
    } else {
      this.myLoading = true;
      this.helper.http
        .post(this.helper.POST_METHOD.SET_ORDER_STATUS, {
          store_id: this.store_id,
          server_token: this.server_token,
          order_id: data.order_id,
          order_status: data.order_status,
          deliver_in: data.deliver_in ? data.deliver_in : null,
          checkout_amount : data.checkout_amount
        })

        .subscribe(
          (res_data: any) => {
            this.myLoading = false;
            if (res_data.success == false) {
              this.helper.data.storage = {
                code: res_data.error_code,
                message: this.helper.ERROR_CODE[res_data.error_code],
                class: 'alert-danger',
              };
              this.helper.message();
            } else {
              var index = this.order_list.findIndex(
                (x) => x._id == data.order_id
              );
              this.order_list[index].order_status = data.order_status;
              if (data.order_status == this.ORDER_STATE.STORE_ACCEPTED) {
                let index =
                  this.helper.router_id.store.new_order_list.findIndex(
                    (x) => x._id == data.order_id
                  );
                if (index !== -1) {
                  this.helper.router_id.store.new_order_list.splice(index, 1);
                }
              }
            }
          },
          (error: any) => {
            this.myLoading = false;
            this.helper.http_status(error);
          }
        );
    }
  }
  rejectOrCancleOrder(data) {
    this.current_order = data;
    this.helper.ngZone.run(() => {
      jQuery('.iradio').iCheck({
        handle: 'radio',
        radioClass: 'iradio_square-green',
      });
      jQuery('#default_reason').iCheck('check');
      this.cancel_reason = jQuery('#default_reason').val() as string;;
      jQuery('.iradio').on('ifChecked', (event:any) => {
        if (event.target.value == 1) {
          jQuery('#text_box').show();
          this.cancel_reason = '';
        } else {
          jQuery('#text_box').hide();
          this.cancel_reason = event.target.value;
        }
      });
    });
    this.modalService.open(this.cancel_order_modal);
  }
  cancelservice() {
    if (this.cancel_reason !== '') {
      this.activeModal.close();
      let data = this.current_order;
      this.myLoading = true;
      this.helper.http
        .post(this.helper.POST_METHOD.STORE_CANCEL_OR_REJECT_ORDER, {
          store_id: this.store_id,
          cancel_reason: this.cancel_reason,
          server_token: this.server_token,
          order_id: data.order_id,
          order_status: data.order_status,
        })

        .subscribe(
          (res_data: any) => {
            this.myLoading = false;
            if (res_data.success == false) {
              this.helper.data.storage = {
                code: res_data.error_code,
                message: this.helper.ERROR_CODE[res_data.error_code],
                class: 'alert-danger',
              };
              this.helper.message();
            } else {
              var order_index = this.order_list.findIndex(
                (x) => x._id == data.order_id
              );
              this.order_list.splice(order_index, 1);
            }
          },
          (error: any) => {
            this.myLoading = false;
            this.helper.http_status(error);
          }
        );
    }
  }
  orderAssignProvider(order_id, delivery_type) {
    this.order_id = order_id;
    this.delivery_type = delivery_type;
    this.myLoading = true;
    this.helper.http
      .post(this.helper.POST_METHOD.GET_VEHICLE_LIST, {
        order_id: order_id,
        delivery_type: delivery_type,
        store_id: this.store_id,
        server_token: this.server_token,
      })

      .subscribe((res_data: any) => {
        this.myLoading = false;
        this.activeModal.close();
        if (res_data.success) {
          this.vehicles = res_data.vehicles;
          this.modalService.open(this.vehicle_list_modal);
          this.vehicle_id = res_data.vehicles[0]._id;
        } else {
          this.helper.data.storage = {
            code: res_data.error_code,
            message: this.helper.ERROR_CODE[res_data.error_code],
            class: 'alert-danger',
          };
          this.helper.message();
        }
      });
  }

  create_request() {
    let json;
    var store = JSON.parse(localStorage.getItem('store'));
    if (store.is_ask_estimated_time_for_ready_order) {
      json = {
        store_id: this.store_id,
        server_token: this.server_token,
        order_id: this.order_id,
        estimated_time_for_ready_order: this.estimated_time,
        vehicle_id: this.vehicle_id,
      };
    } else {
      json = {
        store_id: this.store_id,
        server_token: this.server_token,
        order_id: this.order_id,
        vehicle_id: this.vehicle_id,
      };
    }
    this.helper.http
      .post(this.helper.POST_METHOD.CREATE_REQUEST, json)

      .subscribe(
        (res_data: any) => {
          this.myLoading = false;
          if (res_data.success == false) {
            this.helper.data.storage = {
              code: res_data.error_code,
              message: this.helper.ERROR_CODE[res_data.error_code],
              class: 'alert-danger',
            };
            this.helper.message();
          } else {
            var index = this.order_list.findIndex(
              (x) => x._id == this.order_id
            );
            if (index !== -1) {
              this.order_list.splice(index, 1);
            }
          }
          this.activeModal.close();
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
  }

  completeDeliveryModal(
    order_id,
    confirmation_code_for_complete_delivery,
    is_user_pick_up_order
  ) {
    this.order_id = order_id;
    this.confirmation_code_for_complete_delivery =
      confirmation_code_for_complete_delivery;

    if (
      this.is_confirmation_code_required_at_complete_delivery &&
      is_user_pick_up_order
    ) {
      this.modalService.open(this.complete_order_modal);
    } else {
      this.myLoading = true;
      this.helper.http
        .post(this.helper.POST_METHOD.STORE_COMPLETE_ORDER, {
          store_id: this.store_id,
          server_token: this.server_token,
          order_id: this.order_id,
        })

        .subscribe(
          (res_data: any) => {
            this.myLoading = false;
            if (res_data.success == false) {
              this.helper.data.storage = {
                code: res_data.error_code,
                message: this.helper.ERROR_CODE[res_data.error_code],
                class: 'alert-danger',
              };
              this.helper.message();
            } else {
              let order_index = this.order_list.findIndex(
                (x) => x._id == this.order_id
              );
              this.order_list.splice(order_index, 1);
            }
          },
          (error: any) => {
            this.myLoading = false;
            this.helper.http_status(error);
          }
        );
    }
  }

  completeDelivery() {
    if (
      this.confirmation_code == this.confirmation_code_for_complete_delivery
    ) {
      this.activeModal.close();
      this.conf_code_error_message = false;
      this.myLoading = true;
      this.helper.http
        .post(this.helper.POST_METHOD.STORE_COMPLETE_ORDER, {
          store_id: this.store_id,
          server_token: this.server_token,
          order_id: this.order_id,
        })

        .subscribe(
          (res_data: any) => {
            this.myLoading = false;
            if (res_data.success == false) {
              this.helper.data.storage = {
                code: res_data.error_code,
                message: this.helper.ERROR_CODE[res_data.error_code],
                class: 'alert-danger',
              };
              this.helper.message();
            } else {
              this.helper.router.navigate(['store/history']);
            }
          },
          (error: any) => {
            this.myLoading = false;
            this.helper.http_status(error);
          }
        );
    } else {
      this.conf_code_error_message = true;
    }
  }

  keyPress(event: KeyboardEvent) {
    console.log('keyPress');
    const pattern = /^[0-9]*(\.[0-9]*)?$/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  onPriceChanged(event: Event) {
    console.log('onPriceChanged');
  }

  onFocusOut(event: Event) {
    let elem = <HTMLInputElement>event.target;
    // let elem = <HTMLElement> event.target;
    // var total_item_price = parseFloat(elem.innerHTML);
    var total_item_price = parseFloat(elem.value);
    var diff = total_item_price - this.currentItem.total_item_price;
    this.currentItem.total_item_price = total_item_price;

    this.order_total += diff;
    this.product_item_total_array[this.currentProductIndex] += diff;

    this.order_detail.order_payment_detail.total_cart_price += diff;
    this.order_detail.order_payment_detail.total_order_price += diff;
    this.order_detail.order_payment_detail.total += diff;
    this.order_detail.order_payment_detail.cash_payment += diff;

    var total_cart_price =
      this.order_detail.order_payment_detail.total_cart_price;
    var total_item_tax = this.order_detail.order_payment_detail.total_item_tax;
    var total_item_count =
      this.order_detail.order_payment_detail.total_item_count;

    this.helper.http
      .post('/api/store/update_cart_item_price', {
        item_id: this.currentItem.item_id,
        store_id: this.store_id,
        cart_id: this.currentCartId,
        item_price: total_item_price,
      })

      .subscribe((res_data: any) => {
        // this.helper.http
        //   .post("/api/store/update_cart_detail", {
        //     store_id: this.store_id,
        //     cart_id: this.currentCartId,
        //     total_cart_price: total_cart_price,
        //     total_item_tax: total_item_tax,
        //     total_item_count: total_item_count,
        //   })
        //
        //   .subscribe((res_data: any) => {});
      });
    this.order_list[this.current_index] = JSON.parse(
      JSON.stringify(this.order_detail)
    );
    this.order_list[this.current_index].cart_detail.order_details[
      this.currentProductIndex
    ].total_item_price += diff;
  }

  removeSubstitute(cart_details, item, products) {
    this.myLoading = true;
    this.helper.http
      .post(this.helper.POST_METHOD.REMOVE_SUBSTITUTE, {
        server_token: this.server_token,
        cart_id: cart_details._id,
        item_id: item.item_id,
        product_id: products.product_id,
      })

      .subscribe((res: any) => {
        this.myLoading = false;
        this.activeModal.close();
        this.activeModal.close();
        setTimeout(() => {
          this.filter(this.page);
        }, 0);
      });
  }

  showRemoveButton(cart_detail) {
    if (cart_detail.substitute_set_at) {
      var diff = moment(new Date()).diff(
        cart_detail.substitute_set_at,
        'minutes'
      );
      return diff >= 7 ? true : false;
    } else {
      return true;
    }
  }
}
