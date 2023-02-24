import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { OrderService } from 'src/app/services/order.service';
import { SocketService } from 'src/app/services/socket.service';
import { Helper } from 'src/app/views/helper';
import jQuery from 'jquery';

import { AuthService } from 'src/app/services/auth.service';
import { StoreService } from 'src/app/services/store.service';

declare var swal: any;

@Component({
  selector: 'app-admin-history',
  templateUrl: './admin-history.component.html',
  styleUrls: ['./admin-history.component.css'],
  providers: [Helper],
  //encapsulation: ViewEncapsulation.None,
})
export class AdminHistoryComponent implements OnInit {
  @ViewChild('order_detail_modal')
  @ViewChild('modal')
  modal: any;
  @ViewChild('order_detail_modal')
  order_detail_modal: any;
  @ViewChild('review_detail_modal')
  review_detail_modal: any;

  title: any;
  button: any;
  ORDER_STATE: any;
  heading_title: any;
  status: any;
  order_list: any[];
  pickup_type: any = 'both';
  order_type: any = 'both';
  payment_status: any = 'all';
  created_by: any = 'both';
  order_status_id: string;
  search_field: string;
  search_value: string;
  start_date: string;
  end_date: string;
  page: number;
  total_page: number;
  total_pages: number[];

  timezone: string = '';
  order_id: Object = '';
  rating: number = 1;
  review: string = '';
  type: number;
  selected_order_index: number = 0;
  order_detail: any = {};

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
  sender_name: string = '';
  reciever_name: string = '';
  message1: string = '';
  message2: string = '';
  is_show_specification: boolean = false;
  currency_sign: any = '';
  myLoading: boolean = true;
  review_detail: any = {};
  admin_detail: any = {};
  admin_token: String; //for getting token;
  notes_data: any;

  constructor(
    public helper: Helper,
    public vcr: ViewContainerRef,
    private modalService: NgbModal,
    private orderService: OrderService,
    private storeService: StoreService,
    private cdr: ChangeDetectorRef,
    public toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngAfterViewInit() {
    jQuery('.chosen-select').chosen({ disable_search: true });
    setTimeout(function () {
      jQuery('.chosen-select').trigger('chosen:updated');
    }, 1000);
  }
  ngOnInit() {
    this.order_status_id = '';
    this.search_field = 'user_detail.first_name';
    this.search_value = '';
    this.start_date = '';
    this.end_date = '';
    this.page = 1;

    this.helper.message();

    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
    this.ORDER_STATE = this.helper.ORDER_STATE;
    this.status = this.helper.status;
    this.admin_token = localStorage.getItem('admin_token');
    this.order_list = [];
    this.checkAdminTyp();
    jQuery(document.body)
      .find('#order_status_id')
      .on('change', (evnt, res_data) => {
        this.order_status_id = res_data.selected;
      });
    jQuery(document.body)
      .find('#search_field')
      .on('change', (evnt, res_data) => {
        this.search_field = res_data.selected;
      });
    jQuery(document.body)
      .find('#pickup_type')
      .on('change', (evnt, res_data) => {
        this.pickup_type = res_data.selected;
      });
    jQuery(document.body)
      .find('#created_by')
      .on('change', (evnt, res_data) => {
        this.created_by = res_data.selected;
      });

    jQuery(document.body)
      .find('#order_type')
      .on('change', (evnt, res_data) => {
        this.order_type = res_data.selected;
      });

    jQuery(document.body)
      .find('#payment_status')
      .on('change', (evnt, res_data) => {
        this.payment_status = res_data.selected;
      });
  }
  activeRoute(routename: string): boolean {
    return this.helper.router.url.indexOf(routename) > -1;
  }

  open_detail_modal(index) {
    this.order_detail = this.order_list[index];
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
    this.sender_name = this.order_detail.cart_detail.order_details[
      product_index
    ].items[item_index].sender_name
      ? this.order_detail.cart_detail.order_details[product_index].items[
          item_index
        ].sender_name
      : '';
    this.reciever_name = this.order_detail.cart_detail.order_details[
      product_index
    ].items[item_index].reciever_name
      ? this.order_detail.cart_detail.order_details[product_index].items[
          item_index
        ].reciever_name
      : '';
    this.message1 = this.order_detail.cart_detail.order_details[product_index]
      .items[item_index].message1
      ? this.order_detail.cart_detail.order_details[product_index].items[
          item_index
        ].message1
      : '';
    this.message2 = this.order_detail.cart_detail.order_details[product_index]
      .items[item_index].message2
      ? this.order_detail.cart_detail.order_details[product_index].items[
          item_index
        ].message2
      : '';
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
          this.myLoading = true;

          if (new_status == this.ORDER_STATE.OREDER_READY) {
            var deliver_in = Number(
              prompt('Please Enter Delivry Time in Min : ')
            );
            while (isNaN(deliver_in)) {
              deliver_in = Number(
                prompt('Please Enter Delivry Time in Min : ')
              );
            }
            if (deliver_in != 0) {
              // this.helper.http
              //   .post('/api/admin/admin_revert_completed_order', {
              //     store_id: data.store_id,
              //     deliver_in: deliver_in,
              //     order_id: data._id,
              //     order_status: new_status,
              //   })
              this.orderService
                .changeOrderStatus({
                  store_id: data.store_id,
                  deliver_in: deliver_in,
                  order_id: data._id,
                  order_status: new_status,
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
                      this.store_history(1);
                      var index = this.order_list.findIndex(
                        (x) => x._id == data._id
                      );
                      this.order_list[index].order_status = data.new_status;
                      this.myLoading = false;
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
              this.myLoading = false;
            }
          } else {
            this.orderService
              .changeOrderStatus({
                store_id: data.store_id,
                deliver_in: deliver_in,
                order_id: data._id,
                order_status: new_status,
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
                    this.store_history(1);
                    var index = this.order_list.findIndex(
                      (x) => x._id == data._id
                    );
                    this.order_list[index].order_status = data.new_status;
                    this.myLoading = false;
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
          }

          // var store = JSON.parse(localStorage.getItem('store'));
          // if (data.order_type == 7 && data.order_status === this.ORDER_STATE.STORE_PREPARING_ORDER && store.is_ask_estimated_time_for_ready_order) {

          //     this.order_id = data.order_id;
          //     this.estimated_time_modal.open();
          // } else {
          // }
        }
      })
      .catch(swal.noop);
  }
  checkAdminTyp() {
    let admin_id = localStorage.getItem('admin_id');
    let admin_token = localStorage.getItem('admin_token');
    this.authService
      .checkAuth({ admin_id: admin_id, admin_token: admin_token })
      .subscribe((data: any) => {
        if (data.success) {
          this.admin_detail = data.admin;
          this.store_history(1);
        } else {
          console.log('data :>> ', data);
        }
      });
  }

  history_export_csv() {
    this.storeService
      .storeHistory({
        start_date: this.start_date,
        end_date: this.end_date,
        payment_status: this.payment_status,
        created_by: this.created_by,
        pickup_type: this.pickup_type,
        order_status_id: this.order_status_id,
        search_field: this.search_field,
        search_value: this.search_value,
        order_type: this.order_type,
        admin_type: this.admin_detail.admin_type,
        main_store_id: this.admin_detail.store_id
          ? this.admin_detail.store_id
          : '',
      })
      .subscribe((res_data: any) => {
        var json2csv = require('json2csv').parse;
        // this.order_list.forEach((order, index) => {
        res_data.orders.forEach((order, index) => {
          if (order.order_payment_detail.is_paid_from_wallet) {
            order.payment_status = this.title.wallet;
          } else {
            if (order.order_payment_detail.is_payment_mode_cash) {
              order.payment_status = this.helper.title.cash;
            } else if (
              order.order_payment_detail.is_payment_mode_card_on_delivery
            ) {
              order.payment_status = 'Card On Delivery';
            } else if (
              order.order_payment_detail.is_payment_mode_online_payment
            ) {
              order.payment_status = 'Online';
            }
          }
          if (order.admin_notes) {
            if (order.admin_notes.length != 0) {
              order.admin_notes = order.admin_notes.join();
            }
          }

          if (order.paymentDetails) {
            order.paymentActionId =
              order?.paymentDetails?.payment_response?.action_id;
            order.paymentStatus =
              order?.paymentDetails?.payment_response?.status;
          }

          if (order.storeDetails) {
            order.branchName = order?.storeDetails?.branch_name;
          }

          order.delivery_boy_name = order?.delivery_boy_name;

          order.user_name =
            order.user_detail.first_name + ' ' + order.user_detail.last_name;
          order.store_name = order.store_detail ? order.store_detail.name : '';
          order.city_name = order?.city_detail?.city_name;
          if (order.request_detail !== undefined) {
            if (order.provider_detail) {
              order.provider_name =
                order.provider_detail.first_name +
                ' ' +
                order.provider_detail.last_name;
            }
          }

          switch (order.order_status) {
            case this.ORDER_STATE.STORE_REJECTED:
              order.status = this.status.rejected;
              break;
            case this.ORDER_STATE.STORE_CANCELLED:
              order.status = this.status.cancelled;
              break;

            case this.ORDER_STATE.CANCELED_BY_USER:
              order.status = this.status.user_cancelled;
              break;
            case this.ORDER_STATE.DELIVERY_MAN_COMPLETE_DELIVERY:
              order.status = this.status.order_delivered;
              break;
            case this.ORDER_STATE.ORDER_COMPLETED:
              order.status = this.status.completed;
              break;
            default:
              order.satus = '';
          }

          order.amount = (+order.order_payment_detail.bill_amount).toFixed(2);
          if (isNaN(order.amount)) order.amount = '';
          order.final_amount = (+order.order_payment_detail
            .user_pay_payment).toFixed(2);
          order.checkout_amount = order?.order_payment_detail?.checkout_amount;
          order.promo_code = order?.promo_code_detail?.promo_code_name;
          order.promo_payment = order?.order_payment_detail?.promo_payment;
          order.delivey_fees =
            order?.order_payment_detail?.total_delivery_price;
          switch (true) {
            case order?.order_payment_detail?.is_payment_mode_cash:
              order.payment_by = 'Cash';
              break;
            case order?.order_payment_detail?.is_payment_mode_card_on_delivery:
              order.payment_by = 'Card On Delivery';
              break;
            case order?.order_payment_detail?.is_payment_mode_online_payment:
              order.payment_by = 'Online Payment';
              break;
          }
        });

        var fields = [
          { title: 'ID', value: 'unique_id' },
          { title: 'User', value: 'user_name' },
          { title: 'Store', value: 'store_name' },
          { title: 'City', value: 'city_name' },
          { title: 'Provider', value: 'provider_name' },
          { title: 'Status', value: 'status' },
          { title: 'Bill Amount', value: 'amount' },
          { title: 'Final Amount', value: 'final_amount' },
          { title: 'Checkout Amount', value: 'checkout_amount' },
          { title: 'Branch Name', value: 'branchName' },
          { title: 'Payment Status', value: 'payment_status' },
          {
            label: 'Payment By',
            value: 'payment_by',
          },
          {
            label: 'Promo Code',
            value: 'promo_code',
          },
          {
            label: 'Promo Value',
            value: 'promo_payment',
          },
          {
            label: 'Delivery Fees',
            value: 'delivey_fees',
          },
          {
            label: 'Delivery Hero',
            value: 'delivery_boy_name',
          },
          {
            label: 'Notes',
            value: 'admin_notes',
          },
          {
            label: 'Payment Action Id',
            value: 'paymentActionId',
          },
          {
            label: 'Payment Status',
            value: 'paymentStatus',
          },
          { title: 'Updated At', value: 'updated_at' },
          { title: 'Completed At', value: 'completed_at' },
        ];

        var csv = json2csv(res_data.orders, {
          fields: fields,
        });

        var final_csv: any = csv;
        this.helper.downloadFile(final_csv);
      });
  }

  history_export_excel() {
    this.helper.http
      .post('/api/admin/history_v2', {
        start_date: this.start_date,
        end_date: this.end_date,
        search_field: this.search_field,
        search_value: this.search_value,
        admin_type: this.admin_detail.admin_type,
        main_store_id: this.admin_detail.store_id
          ? this.admin_detail.store_id
          : '',
      })
      .subscribe((res_data: any) => {
        var json_data = [];
        var json2excel = require('js2excel');
        res_data.orders.forEach((order, index) => {
          if (order.order_payment_detail.is_paid_from_wallet) {
            order.payment_status = this.title.wallet;
          } else {
            if (order.order_payment_detail.is_payment_mode_cash) {
              order.payment_status = this.helper.title.cash;
            } else if (
              order.order_payment_detail.is_payment_mode_card_on_delivery
            ) {
              order.payment_status = 'Card On Delivery';
            } else if (
              order.order_payment_detail.is_payment_mode_online_payment
            ) {
              order.payment_status = 'Online';
            }
          }

          order.user_name =
            order.user_detail.first_name + ' ' + order.user_detail.last_name;
          order.store_name = order.store_detail.name;

          order.city_name = order?.city_detail?.city_name;
          if (order.request_detail != undefined) {
            if (order.provider_detail.length > 0) {
              order.provider_name =
                order.provider_detail[0].first_name +
                ' ' +
                order.provider_detail[0].last_name;
            }
          }

          switch (order.order_status) {
            case this.ORDER_STATE.STORE_REJECTED:
              order.status = this.status.rejected;
              break;
            case this.ORDER_STATE.STORE_CANCELLED:
              order.status = this.status.cancelled;
              break;

            case this.ORDER_STATE.CANCELED_BY_USER:
              order.status = this.status.user_cancelled;
              break;
            case this.ORDER_STATE.DELIVERY_MAN_COMPLETE_DELIVERY:
              order.status = this.status.order_delivered;
              break;
            case this.ORDER_STATE.ORDER_COMPLETED:
              order.status = this.status.completed;
              break;
            default:
              order.satus = '';
          }

          order.amount = (
            +order.order_payment_detail.total_cart_price +
            +order.order_payment_detail.total_delivery_price
          ).toFixed(2);
          order.checkout_amount = order.order_payment_detail.checkout_amount;
          json_data.push({
            ID: order.unique_id,
            User: order.user_name,
            Store: order.store_name,
            Provider: order.provider_name,
            City: order.city_name,
            Status: order.status,
            Amount: order.amount,
            'Checkout Amount': order.checkout_amount,
            'Payment By': order.payment_status,
            Date: order.created_at,
          });
        });

        json2excel.json2excel({
          data: json_data,
          name: 'history_excel',
          formateDate: 'yyyy/mm/dd',
        });
      });
  }

  store_history(page) {
    this.myLoading = true;
    this.selected_order_index = 0;
    this.page = page;
    this.storeService
      .storeHistory({
        start_date: this.start_date,
        end_date: this.end_date,
        created_by: this.created_by,
        payment_status: this.payment_status,
        pickup_type: this.pickup_type,
        order_status_id: this.order_status_id,
        search_field: this.search_field,
        search_value: this.search_value,
        page: this.page,
        order_type: this.order_type,
        admin_type: this.admin_detail.admin_type,
        main_store_id: this.admin_detail.store_id
          ? this.admin_detail.store_id
          : '',
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
            console.log('order_list', this.order_list);
            // this.get_excel_data(this.order_list);
            this.total_page = res_data.pages;
            this.total_pages = Array(res_data.pages)
              .fill((x, i) => i)
              .map((x, i) => i + 1);
            if (this.order_list.length > 0) {
              this.order_detail = this.order_list[0];
            }
          }
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
  }

  show_review(order_id) {
    console.log(order_id);
    this.helper.http
      .post('/admin/get_review_detail', { order_id: order_id })
      .subscribe((res_data: any) => {
        if (res_data.success) {
          this.review_detail = res_data.review_detail;
          console.log(this.review_detail);
          this.modalService.open(this.review_detail_modal);
        } else {
          this.review_detail = {};
        }
      });
  }

  get_order_detail(index) {
    this.order_detail = this.order_list[index];
  }

  give_rate_modal(orderid, index, type) {
    this.rating = 1;
    this.review = '';
    this.type = type;
    this.order_id = orderid;
    this.modalService.open(this.modal);
    this.selected_order_index = index;
  }

  //For Admin Notes
  addNotes(order_id) {
    let check_notes = prompt('Please Enter Note', '');
    if (check_notes) {
      let _id, server_token, admin_notes;
      _id = order_id;
      server_token = this.admin_token;
      admin_notes = check_notes;
      this.notes_data = { _id, server_token, admin_notes };

      this.helper.http.post('admin/add_notes', this.notes_data).subscribe(
        (res_data: any) => {
          if (res_data.success == true) {
            alert('Notes Added Succesfully');
            this.helper.data.storage = {
              message: this.helper.MESSAGE_CODE[res_data.message],
              class: 'alert-info',
            };
            this.store_history(this.page);
          } else {
            this.helper.data.storage = {
              message: this.helper.ERROR_CODE[res_data.error_code],
              class: 'alert-danger',
            };
          }
        },
        (error: any) => {
          this.helper.http_status(error);
        }
      );
    }
  }
}
