import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';

import { Helper } from '../../helper';
import jQuery from 'jquery';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

// import {json2excel, excel2json} from 'js2excel';
declare var swal: any;
@Component({
  selector: 'app-deliveries',
  templateUrl: './deliveries.component.html',
  providers: [Helper],
})

export class DeliveriesComponent implements OnInit {
  @ViewChild('order_detail_modal')
  order_detail_modal: any;
  reciept_image: File;

  title: any;
  button: any;
  ORDER_STATE: any;
  heading_title: any;
  status: any;
  store_id: Object;
  server_token: String;
  requests: any[];
  interval: any;

  search_field: string;
  search_value: string;
  page: number;
  total_page: number;
  total_pages: number[];
  order_payment_id: Object;
  order_detail: any = {};
  payment_status: any = 'all';
  map: any;
  store_marker: any;
  user_marker: any;
  provider_marker: any;
  request_status: string = '';

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
  myLoading: Boolean = true;
  store_message: any = '';
  user_message: any = '';
  provider_message: any = '';

  vehicles: any[] = [];
  vehicle_id: string = '';
  @ViewChild('vehicle_list_modal')
  vehicle_list_modal: any;
  order_id: string = '';

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
    this.order_payment_id = null;
    var directionsDisplay = new google.maps.DirectionsRenderer();
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 7,
      streetViewControl: false,
      center: { lat: 0, lng: 0 },
    });
    directionsDisplay.setMap(this.map);
    this.store_marker = new google.maps.Marker({
      position: { lat: 0, lng: 0 },
      map: this.map,
      icon: 'map_pin_images/Store/store_open.png',
    });

    this.user_marker = new google.maps.Marker({
      position: { lat: 0, lng: 0 },
      map: this.map,
      icon: 'map_pin_images/Store/store_open.png',
    });
    this.provider_marker = new google.maps.Marker({
      position: { lat: 0, lng: 0 },
      map: this.map,
      icon: 'map_pin_images/Deliveryman/deliveryman_online.png',
    });

    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
    this.ORDER_STATE = this.helper.ORDER_STATE;
    this.status = this.helper.status;
    this.requests = [];
    this.filter(1);
    this.interval = setInterval(() => {
      this.orderDetail();
    }, this.helper.TIMEOUT.NEW_ORDER_REQUEST);

    jQuery(document.body)
      .find('#request_status')
      .on('change', (evnt, res_data) => {
        this.request_status = res_data.selected;
      });
    jQuery(document.body)
      .find('#search_field')
      .on('change', (evnt, res_data) => {
        this.search_field = res_data.selected;
      });
    jQuery(document.body)
      .find('#payment_status')
      .on('change', (evnt, res_data) => {
        this.payment_status = res_data.selected;
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
      .post('/api/admin/delivery_list_search_sort', {
        request_status: this.request_status,
        payment_status: this.payment_status,
        search_field: this.search_field,
        search_value: this.search_value,
        page: this.page,
      })
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;
          if (res_data.success == false) {
            this.requests = [];
            this.total_pages = [];
          } else {
            this.requests = res_data.requests;
            if (this.requests.length > 0) {
              this.get_request_data(0);
            }
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

  viewRequestOrder_detail(id) {
    this.helper.router_id.admin.request_id = id;
    this.helper.router.navigate(['admin/request_order_detail']);
  }

  orderDetail() {
    this.helper.http
      .post('/api/admin/delivery_list_search_sort', {
        store_id: this.store_id,
        payment_status: this.payment_status,
        server_token: this.server_token,
        request_status: this.request_status,
        search_field: this.search_field,
        search_value: this.search_value,
        page: this.page,
      })
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;
          if (res_data.success == false) {
            this.requests = [];
            this.total_page = res_data.pages;
            this.total_pages = Array(res_data.pages)
              .fill((x, i) => i)
              .map((x, i) => i + 1);
          } else {
            this.total_page = res_data.pages;
            this.total_pages = Array(res_data.pages)
              .fill((x, i) => i)
              .map((x, i) => i + 1);

            this.requests.forEach((value, index) => {
              if (value._id == this.order_detail._id) {
                this.order_detail = value;
              }

              var new_index = res_data.requests.findIndex(
                (x) => x._id == this.requests[index]._id
              );
              if (new_index == -1) {
                this.requests.splice(index, 1);
              } else {
                this.requests[index].delivery_status =
                  res_data.requests[new_index].delivery_status;
                this.requests[index].provider_detail =
                  res_data.requests[new_index].provider_detail;
                this.requests[index].date_time =
                  res_data.requests[new_index].date_time;
              }
            });

            res_data.requests.forEach((new_value, index) => {
              var aaa = this.requests.findIndex(
                (x) => x._id == res_data.requests[index]._id
              );

              if (aaa == -1) {
                this.requests.unshift(new_value);
              }
            });
          }
        },
        (error: any) => {
          this.helper.http_status(error);
        }
      );
  }

  open_detail_modal() {
    this.is_show_specification = false;
    this.order_total = 0;
    this.product_item_total = 0;
    this.total_item = 0;
    this.product_item_specification_total = 0;
    this.product_item_specification_total_array = [];
    this.product_item_total_array = [];
    this.product_specification_total_array = [];
    this.order_detail.cart_detail.order_details.forEach(
      (product, product_index) => {
        this.hide_specification_group[product_index] = 'false';
        product.items.forEach((item) => {
          this.order_total =
            this.order_total +
            (item.item_price + item.total_specification_price) * item.quantity;
          this.product_item_total =
            this.product_item_total +
            (item.item_price + item.total_specification_price) * item.quantity;
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
        this.product_item_total_array.push(this.product_item_total);
        this.product_item_total = 0;
      }
    );
    this.modalService.open(this.order_detail_modal);
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

  get_request_data(index) {
    var bounds = new google.maps.LatLngBounds();
    this.order_detail = this.requests[index];

    if (this.user_message) {
      this.user_message.close();
    }
    if (this.store_message) {
      this.store_message.close();
    }
    if (this.provider_message) {
      this.provider_message.close();
    }

    var store_location = new google.maps.LatLng(
      this.order_detail.pickup_addresses[0].location[0],
      this.order_detail.pickup_addresses[0].location[1]
    );
    this.store_marker.setPosition(store_location);
    bounds.extend(store_location);
    var store_contentString =
      '<p><b>Name</b>: ' +
      this.order_detail.pickup_addresses[0].user_details.name +
      '<br><b>Email</b>: ' +
      this.order_detail.pickup_addresses[0].user_details.email +
      '<br><b>Phone</b>: ' +
      this.order_detail.pickup_addresses[0].user_details.country_phone_code +
      this.order_detail.pickup_addresses[0].user_details.phone +
      '</p>';
    this.store_message = new google.maps.InfoWindow({
      content: store_contentString,
      maxWidth: 320,
    });
    google.maps.event.addListener(this.store_marker, 'click', (e) => {
      this.store_message.open(this.map, this.store_marker);
      setTimeout(() => {
        this.store_message.close();
      }, 5000);
    });

    var user_location = new google.maps.LatLng(
      this.order_detail.destination_addresses[0].location[0],
      this.order_detail.destination_addresses[0].location[1]
    );
    this.user_marker.setPosition(user_location);
    bounds.extend(user_location);
    var user_contentString =
      '<p><b>Name</b>: ' +
      this.order_detail.destination_addresses[0].user_details.name +
      '<br><b>Email</b>: ' +
      this.order_detail.destination_addresses[0].user_details.email +
      '<br><b>Phone</b>: ' +
      this.order_detail.destination_addresses[0].user_details
        .country_phone_code +
      this.order_detail.destination_addresses[0].user_details.phone +
      '<br><b>Address</b>: ' +
      this.order_detail.destination_addresses[0].address +
      '</p>';

    this.user_message = new google.maps.InfoWindow({
      content: user_contentString,
      maxWidth: 320,
    });
    google.maps.event.addListener(this.user_marker, 'click', (e) => {
      this.user_message.open(this.map, this.user_marker);
      setTimeout(() => {
        this.user_message.close();
      }, 5000);
    });

    if (this.order_detail.provider_detail) {
      if (!this.provider_marker) {
        this.provider_marker = new google.maps.Marker({
          position: { lat: 22, lng: 70 },
          map: this.map,
          icon: 'map_pin_images/Deliveryman/deliveryman_online.png',
        });
      }
      var provider_location = new google.maps.LatLng(
        this.order_detail.provider_detail.location[0],
        this.order_detail.provider_detail.location[1]
      );
      this.provider_marker.setPosition(provider_location);
      bounds.extend(provider_location);
      var provider_contentString =
        '<p><b>Name</b>: ' +
        this.order_detail.provider_detail.first_name +
        ' ' +
        this.order_detail.provider_detail.last_name +
        '<br><b>Email</b>: ' +
        this.order_detail.provider_detail.email +
        '<br><b>Phone</b>: ' +
        this.order_detail.provider_detail.country_phone_code +
        this.order_detail.provider_detail.phone +
        '</p>';
      this.provider_message = new google.maps.InfoWindow({
        content: provider_contentString,
        maxWidth: 320,
      });
      google.maps.event.addListener(this.provider_marker, 'click', (e) => {
        this.provider_message.open(this.map, this.provider_marker);
        setTimeout(() => {
          this.provider_message.close();
        }, 5000);
      });
    } else {
      if (this.provider_marker) {
        this.provider_marker.setMap(null);
        this.provider_marker = null;
      }
    }
    this.map.fitBounds(bounds);
  }

  vieworder_detail(id) {
    this.helper.router_id.store.order_id = id;
    this.helper.router.navigate(['store/order/detail']);
  }
  viewcart_detail(id) {
    this.helper.router_id.store.order_id = id;
    this.helper.router.navigate(['store/cart/detail']);
  }

  track_deliveryman(id) {
    this.helper.router_id.store.order_id = id;
    this.helper.router.navigate(['store/order/track_delivery_man']);
  }

  //delivery_export_csv
  delivery_export_csv() {
    this.helper.http
      .post('/api/admin/delivery_list_search_sort', {
        store_id: this.store_id,
        payment_status: this.payment_status,
        server_token: this.server_token,
        request_status: this.request_status,
        search_field: this.search_field,
        search_value: this.search_value,
      })
      .subscribe((res_data: any) => {
        var json2csv = require('json2csv').parse;
        res_data.requests.forEach((request, index) => {
          if (request.order_payment_detail.is_paid_from_wallet) {
            request.payment_status = this.title.wallet;
          } else {
            if (request.order_payment_detail.is_payment_mode_cash) {
              request.payment_status = this.helper.title.cash;
            } else {
              request.payment_status = request.payment_gateway_detail[0].name;
            }
          }

          request.user_name =
            request.user_detail.first_name +
            ' ' +
            request.user_detail.last_name;
          request.store_name = request.store_detail.name;

          if (request.provider_detail) {
            request.provider_name =
              request.provider_detail.first_name +
              ' ' +
              request.provider_detail.last_name;
          } else {
            request.provider_name = '';
          }

          switch (request.delivery_status) {
            case this.ORDER_STATE.WAITING_FOR_DELIVERY_MAN:
              request.status = this.status.waiting_for_delivery_man;
              break;
            case this.ORDER_STATE.DELIVERY_MAN_ACCEPTED:
              request.status = this.status.delivery_man_accepted;
              break;
            case this.ORDER_STATE.DELIVERY_MAN_COMING:
              request.status = this.status.delivery_man_coming;
              break;
            case this.ORDER_STATE.DELIVERY_MAN_ARRIVED:
              request.status = this.status.delivery_man_arrived;
              break;
            case this.ORDER_STATE.DELIVERY_MAN_PICKED_ORDER:
              request.status = this.status.picked_order;
              break;
            case this.ORDER_STATE.DELIVERY_MAN_STARTED_DELIVERY:
              request.status = this.status.started_for_delivery;
              break;
            case this.ORDER_STATE.DELIVERY_MAN_ARRIVED_AT_DESTINATION:
              request.status = this.status.arrived_at_destination;
              break;
            case this.ORDER_STATE.STORE_CANCELLED_REQUEST:
              request.status = this.status.store_cancelled_request;
              break;
            case this.ORDER_STATE.NO_DELIVERY_MAN_FOUND:
              request.status = this.status.no_delivery_man_found;
              break;
            default:
              request.satus = '';
          }
          request.amount = (
            +request.order_payment_detail.total_delivery_price +
            +request.order_payment_detail.total_order_price
          ).toFixed(2);
        });

        var fieldNames = [
          this.title.id,
          this.title.user,
          this.title.store,
          this.title.provider,
          this.title.status,
          this.title.amount,
          this.title.payment_by,
          this.title.date,
          this.title.delivery_at,
        ];
        var fields = [
          'unique_id',
          'user_name',
          'store_name',
          'provider_name',
          'status',
          'amount',
          'payment_status',
          'created_at',
          'created_at',
        ];

        var csv = json2csv(res_data.requests, {
          fields: fields,
        });

        var final_csv: any = csv;
        this.helper.downloadFile(final_csv);
      });
  }

  orderAssignProvider(data) {
    this.order_id = data.order_id;
    this.myLoading = true;
    this.helper.http
      .post('/api/store/get_vehicle_list', {
        order_id: this.order_id,
        city_id: data.city_id,
        delivery_type: data.delivery_type,
        store_id: this.store_id,
        server_token: this.server_token,
      })
      .subscribe((res_data: any) => {
        this.myLoading = false;
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
    let index = this.helper.router_id.store.no_deliveryman_orders.findIndex(
      (x) => x.order_detail._id == this.order_id
    );
    if (index !== -1) {
      this.helper.router_id.store.no_deliveryman_orders.splice(index, 1);
    }
    let json = {
      store_id: this.store_id,
      server_token: this.server_token,
      order_id: this.order_id,
      vehicle_id: this.vehicle_id,
    };
    this.helper.http.post('/api/store/create_request', json).subscribe(
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
          this.helper.data.storage = {
            code: res_data.message,
            message: this.helper.MESSAGE_CODE[res_data.message],
            class: 'alert-info',
          };
          this.helper.message();
          var index = this.requests.findIndex(
            (x) => x.order_detail._id == this.order_id
          );
          if (index !== -1) {
            this.requests[index].delivery_status =
              res_data.request.delivery_status;
            this.requests[index].provider_detail = res_data.provider_detail;
            this.get_request_data(index);
          }
          delete this.requests[index].provider_detail;
          this.get_request_data(index);
        }
        this.activeModal.close();
      },
      (error: any) => {
        this.myLoading = false;
        this.helper.http_status(error);
      }
    );
  }

  // delivery_export_excel
  delivery_export_excel() {
    this.helper.http
      .post('/api/admin/deliveries_export_excel', {
        search_field: this.search_field,
        search_value: this.search_value,
      })
      .subscribe((res_data: any) => {
        if (res_data.success == true) {
          var json2excel = require('js2excel');
          let data = res_data.requests;
          if (data.length > 0) {
            try {
              json2excel.json2excel({
                data,
                name: 'deliveries',
                formateDate: 'yyyy/mm/dd',
              });
            } catch (e) {
              console.error(e);
              console.error('export error');
            }
          }
        }
      });
  }

  complete_request(data) {
    data.type = 1;
    console.log(data);
    this.helper.http
      .post('api/provider/complete_request', data)
      .subscribe((res_data: any) => {
        if (res_data.success) {
          let index = this.requests.findIndex((x) => x._id == data.request_id);
          this.requests.splice(index, 1);
          this.helper.data.storage = {
            message: this.helper.MESSAGE_CODE[res_data.message],
            class: 'alert-info',
          };
          this.helper.message();
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

  image_update($event) {
    const files = $event.target.files || $event.srcElement.files;
    this.reciept_image = files[0];
    console.log('this.reciept_image :>> ', this.reciept_image);
  }

  orderStatus(data, new_status, url?) {
    this.myLoading = true;

    url = url ? url : '/api/admin/admin_update_order';
    if (new_status == this.ORDER_STATE.OREDER_READY) {
      let checkout_amount = Number(
        prompt('Please Enter Checkout Amount in AED : ')
      );
      while (isNaN(checkout_amount)) {
        checkout_amount = Number(
          prompt('Please Enter Checkout Amount in AED : ')
        );
      }
      let bill_amount = Number(prompt('Please Enter Bill Amount in AED : '));
      while (isNaN(bill_amount)) {
        bill_amount = Number(prompt('Please Enter Bill Amount in AED : '));
      }
      let deliver_in = Number(prompt('Please Enter Delivry Time in Min : '));
      while (isNaN(deliver_in)) {
        deliver_in = Number(prompt('Please Enter Delivry Time in Min : '));
      }
      var fromData = new FormData();
      fromData.append('reciept', this.reciept_image);
      fromData.append('store_id', data?.cart_detail?.store_id);
      fromData.append('deliver_in', String(deliver_in));
      fromData.append('order_id', data?.cart_detail?.order_id);
      fromData.append('order_status', new_status);
      fromData.append('checkout_amount', String(checkout_amount));
      fromData.append('bill_amount', String(bill_amount));
      if (deliver_in != 0 && checkout_amount) {
        this.helper.http.post(url, fromData).subscribe(
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
              var index = this.requests.findIndex((x) => x._id == data._id);
              this.requests[index].order_detail.order_status = data.new_status;
              this.requests[index].order_payment_detail.checkout_amount =
                checkout_amount;
              // if(data.order_status == this.ORDER_STATE.STORE_ACCEPTED){
              //     let index = this.helper.router_id.store.new_order_list.findIndex((x)=>x._id == data.order_id);
              //     if(index !== -1){
              //         this.helper.router_id.store.new_order_list.splice(index, 1);
              //     }
              // }
            }
          },
          (error: any) => {
            this.myLoading = false;
            this.helper.http_status(error);
          }
        );
      } else {
        this.helper.data.storage = {
          message: 'Invalid Delivery Time',
          class: 'alert-danger',
        };
        this.helper.message();
      }
    } else {
      let payload: any = {
        store_id: data?.cart_detail?.store_id,
        order_id: data?.orders?.order_id,
        order_status: new_status,
      };
      if (new_status === 101) {
        payload.cancel_reason = prompt('Please provide reason to cancel?');
        payload.user_id = data.user_id;
      }
      this.helper.http.post(url, payload).subscribe(
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
            var index = this.requests.findIndex((x) => x._id == data._id);
            this.requests[index].order_detail.order_status = data.new_status;
            // if(data.order_status == this.ORDER_STATE.STORE_ACCEPTED){
            //     let index = this.helper.router_id.store.new_order_list.findIndex((x)=>x._id == data.order_id);
            //     if(index !== -1){
            //         this.helper.router_id.store.new_order_list.splice(index, 1);
            //     }
            // }
          }
          setTimeout(() => {
            this.orderDetail();
          }, 1000);
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
    }

    // var store = JSON.parse(localStorage.getItem('store'));
    // if (data.order_type == 7 && data.order_status === this.ORDER_STATE.STORE_PREPARING_ORDER && store.is_ask_estimated_time_for_ready_order) {

    //     this.order_id = data.order_id;
    //     this.estimated_time_modal.open();
    // } else {
    // }
  }

  changeOrderstatus(data, new_status) {
    swal({
      title: 'Are you sure?',
      text: 'You know what you are doing, Right ?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Update it!',
    })
      .then((proceed) => {
        if (proceed) {
          this.orderStatus(
            data,
            new_status,
            '/api/admin/admin_revert_completed_order'
          );
        }
      })
      .catch(swal.noop);
  }
}
