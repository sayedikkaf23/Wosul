import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ToastrService } from 'ngx-toastr';
import { OrderService } from 'src/app/services/order.service';
import { SocketService } from 'src/app/services/socket.service';
import { Helper } from 'src/app/views/helper';
import jQuery from 'jquery';
import * as htmlToImage from 'html-to-image';
import * as moment from 'moment';
import { AuthService } from 'src/app/services/auth.service';

declare var swal: any;

@Component({
  selector: 'app-admin-order',
  templateUrl: './admin-order.component.html',
  styleUrls: ['./admin-order.component.css'],
  //encapsulation: ViewEncapsulation.None,
})
export class AdminOrderComponent implements OnInit {
  @ViewChild('order_detail_modal')
  order_detail_modal: NgbModal;
  title: any;
  button: any;
  ORDER_STATE: any;
  DATE_FORMAT: any;
  heading_title: any;
  status: any;
  order_list: any[];
  interval: any;
  search_field: string;
  search_value: string;
  page: number;
  total_page: number;
  total_pages: number[];
  myLoading: boolean = true;
  reciept_image: File;
  timezone: string;
  order_detail: any = {};
  admin_detail: any = {};
  order_status: any = 'all';
  pickup_type: any = 'both';
  created_by: any = 'both';
  payment_status: any = 'all';
  order_type: any = 'both';
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
  dropdownSettings: IDropdownSettings;
  dropdownList = [];
  selectedItems = [];
  store_redirect_list = [];
  store_list: any[];
  ab: any = {};
  admin_token: String; //for getting token
  notes_data: any;
  vehicle_list: any[];
  selected_vehicle: any;
  vehicle_data: any;
  capturedImage: any;
  navigator: any = window.navigator;

  selectedDeliveryBoy: any;
  delivery_boy_list: any[];
  payload: any = {};
  orderUpdatedStatus: any;
  orderUrl: any;
  selectedOrder: any;
  modalReference: any; //for delivery boy modal
  IsDeliveryShow: boolean = false;
  type: any;
  IsModalFieldsShow: boolean = false;

  setting_pin: any;
  userId: any;
  card_list: any = [];
  isCardShow: boolean = false;
  card_id: any;
  instrument_id: any;
  onlinePaymentPin: any;
  isOnlinePaymentPaid: boolean = false;
  threedigitcurrency = ['OMR', 'BHD', 'KWD'];
  calculatedAmount: any;

  isShowFilters: boolean = false;

  selectedCar: any;

  tableCount = [
    { id: 1, name: '10' },
    { id: 2, name: '20' },
    { id: 3, name: '30' },
    { id: 4, name: '40' },
    { id: 5, name: '50' },
  ];

  constructor(
    public helper: Helper,
    public vcr: ViewContainerRef,
    private modalService: NgbModal,
    private orderService: OrderService,
    private socket: SocketService,
    private cdr: ChangeDetectorRef,
    public toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngAfterViewInit() {
    jQuery('#store').chosen();
    jQuery('.chosen-select').chosen({ disable_search: true });
    setTimeout(function () {
      jQuery('.chosen-select').trigger('chosen:updated');
    }, 1000);
  }
  capture() {
    try {
      this.toastr.success('', 'Please wait...');
      var order_detail_items = document.getElementById('order_detail_items');
      order_detail_items.classList.remove('invoice_popup_box', 'scrollbar');
      htmlToImage
        .toJpeg(document.getElementById('order-detail-screen-capture'), {
          quality: 0.95,
          cacheBust: true,
        })
        .then(
          function (dataUrl) {
            var img = new Image();
            img.crossOrigin = 'anonymous';
            var a = document.createElement('a');
            a.download = `order-detais-${this.order_detail.unique_id}.jpeg`;
            a.href = dataUrl;
            a.click();
            order_detail_items.classList.add('invoice_popup_box', 'scrollbar');
          }.bind(this)
        );
    } catch (error) {
      //console.error(error);
    }
  }

  getDeliveryBoy() {
    this.orderService.getDeliveryList().subscribe((res: any) => {
      if (res.success) {
        this.delivery_boy_list = res.delivery_boys;
        console.log('Delivery Boys', this.delivery_boy_list);
      }
    });
  }

  getSettingDetails() {
    this.authService.getSettingDetail({}).subscribe((res_data: any) => {
      this.setting_pin = res_data.setting.payment_switch_to_online_pin;
    });
  }

  getCardList(user_id) {
    const payload = {
      user_id,
    };
    this.orderService.getCardList(payload).subscribe((res: any) => {
      if (res.success) {
        this.card_list = res?.data;
        if (this.card_list.length === 0) {
          this.toastr.error('Card not found!');
          this.onlinePaymentPin = '';
          this.isCardShow = false;
          return;
        }
        this.card_id = this.card_list?._id;
        this.instrument_id = this.card_list?.instrument_id;
        this.isCardShow = true;
      }
    });
  }

  ngOnInit() {
    const bodyElement = document.body;
    bodyElement.classList.remove('add-order-page');

    this.checkAdminTyp();
    this.getDeliveryBoy();
    this.getSettingDetails();
    this.search_field = 'user_detail.first_name';
    this.search_value = '';
    //        this.start_date = '';
    //        this.end_date = '';
    this.page = 1;
    this.timezone = '';
    this.helper.message();
    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
    this.ORDER_STATE = this.helper.ORDER_STATE;
    this.DATE_FORMAT = this.helper.DATE_FORMAT;
    this.status = this.helper.status;
    this.title = this.helper.title;
    this.order_list = [];
    this.socket.onEvent('newOrder').subscribe((socket) => {
      console.log('new order :>> ');
      this.orderDetail();
    });
    this.admin_token = localStorage.getItem('admin_token');
    // setTimeout(() => {
    //   this.orderDetail();
    // }, 500)
    // this.interval = setInterval(() => {
    //   this.orderDetail();
    // }, this.helper.TIMEOUT.NEW_ORDER_REQUEST);
    // this.admin_history(1);
    jQuery(document.body)
      .find('#store')
      .on('change', (evnt, res_data) => {
        console.log('res_data.selected :>> ', res_data.selected);
        this.ab.store_id = res_data.selected;
      });
    this.get_store_list('');
    jQuery(document.body)
      .find('#order_status')
      .on('change', (evnt, res_data) => {
        console.log('res_data.selected :>> ', res_data.selected);
        this.order_status = res_data.selected;
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
  changeStore(store_id, order_id) {
    this.myLoading = true;
    console.log('value :>> ', store_id);
    console.log('ab.order_id :>> ', order_id);
    const apiData = {
      store_id: store_id,
      order_id: order_id,
    };
    this.helper.http
      .post('/api/admin/admin_change_order_store', apiData)
      .subscribe((res_data: any) => {
        if (res_data.success) {
          console.log('update success');
          this.orderDetail();
          // this.admin_history(1);
          this.myLoading = false;
        } else {
          console.log('update failure');
          this.myLoading = false;
        }
      });
  }
  substitueItems = {};

  fetchSubstitute(item) {
    if (
      item &&
      item.substitute_items &&
      item.substitute_items.length &&
      !item.subs_items
    ) {
      this.substitueItems['id'] = item.item_id;
      const subs_ids = item.substitute_items;
      if (subs_ids.length != 0) {
      }
      this.helper.http
        .post('/api/user/get_substitute_items', {
          if_store_panel: true,
          item_id: item.item_id,
          store_id: this.order_detail.store_id,
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

  view_cart(id) {
    this.helper.router_id.admin.order_id = id;
    this.helper.router.navigate(['admin/view_cart']);
  }
  get_store_list(countryid) {
    this.orderService
      .getMainStoreList({ is_main_store: true })
      .subscribe((res_data: any) => {
        // console.log('object :>> ', res_data);
        this.store_list = res_data.stores;
        jQuery('#store').trigger('chosen:updated');
      });
    // this.helper.http
    //   .post('/admin/get_main_store_list', { is_main_store: true })
    //   .subscribe((res_data: any) => {
    //     // console.log('object :>> ', res_data);
    //     this.store_list = res_data.stores;
    //     jQuery('#store').trigger('chosen:updated');
    //   });
  }
  checkAdminTyp() {
    let admin_id = localStorage.getItem('admin_id');
    let admin_token = localStorage.getItem('admin_token');

    this.authService
      .checkAuth({ admin_id: admin_id, admin_token: admin_token })
      .subscribe((data: any) => {
        if (data.success) {
          this.admin_detail = data.admin;
          this.orderDetail();
          this.admin_history(1);
        } else {
          console.log('data :>> ', data);
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
      fromData.append('store_id', data.store_id);
      fromData.append('deliver_in', String(deliver_in));
      fromData.append('order_id', data._id);
      fromData.append('order_status', new_status);
      fromData.append('checkout_amount', String(checkout_amount));
      fromData.append('bill_amount', String(bill_amount));
      if (deliver_in != 0 && checkout_amount) {
        this.orderService.changeOrderStatus(fromData).subscribe(
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
              var index = this.order_list.findIndex((x) => x._id == data._id);
              this.order_list[index].order_status = data.new_status;
              this.order_list[index].order_payment_detail.checkout_amount =
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

        // this.helper.http.post(url, fromData).subscribe(
        //   (res_data: any) => {
        //     this.myLoading = false;
        //     if (res_data.success == false) {
        //       this.helper.data.storage = {
        //         code: res_data.error_code,
        //         message: this.helper.ERROR_CODE[res_data.error_code],
        //         class: 'alert-danger',
        //       };
        //       this.helper.message();
        //     } else {
        //       var index = this.order_list.findIndex((x) => x._id == data._id);
        //       this.order_list[index].order_status = data.new_status;
        //       this.order_list[index].order_payment_detail.checkout_amount =
        //         checkout_amount;
        //       // if(data.order_status == this.ORDER_STATE.STORE_ACCEPTED){
        //       //     let index = this.helper.router_id.store.new_order_list.findIndex((x)=>x._id == data.order_id);
        //       //     if(index !== -1){
        //       //         this.helper.router_id.store.new_order_list.splice(index, 1);
        //       //     }
        //       // }
        //     }
        //   },
        //   (error: any) => {
        //     this.myLoading = false;
        //     this.helper.http_status(error);
        //   }
        // );
      } else {
        this.helper.data.storage = {
          message: 'Invalid Delivery Time',
          class: 'alert-danger',
        };
        this.helper.message();
      }
    } else {
      console.log('data: ', data);
      let payload: any = {
        store_id: data.store_id,
        order_id: data._id,
        order_status: new_status,
      };
      if (new_status === 101) {
        payload.cancel_reason = prompt('Please provide reason to cancel?');
        payload.user_id = data.user_id;
      }
      this.orderService.changeOrderStatus(payload).subscribe(
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
            var index = this.order_list.findIndex((x) => x._id == data._id);
            this.order_list[index].order_status = data.new_status;
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
      // this.helper.http.post(url, payload).subscribe(
      //   (res_data: any) => {
      //     this.myLoading = false;
      //     if (res_data.success == false) {
      //       this.helper.data.storage = {
      //         code: res_data.error_code,
      //         message: this.helper.ERROR_CODE[res_data.error_code],
      //         class: 'alert-danger',
      //       };
      //       this.helper.message();
      //     } else {
      //       var index = this.order_list.findIndex((x) => x._id == data._id);
      //       this.order_list[index].order_status = data.new_status;
      //     }
      //     setTimeout(() => {
      //       this.orderDetail();
      //     }, 1000);
      //   },
      //   (error: any) => {
      //     this.myLoading = false;
      //     this.helper.http_status(error);
      //   }
      // );
    }

    // var store = JSON.parse(localStorage.getItem('store'));
    // if (data.order_type == 7 && data.order_status === this.ORDER_STATE.STORE_PREPARING_ORDER && store.is_ask_estimated_time_for_ready_order) {

    //     this.order_id = data.order_id;
    //     this.estimated_time_modal.open();
    // } else {
    // }
  }
  changeOrderstatus(data, new_status) {
    if (new_status) {
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

  admin_history(page) {
    this.isCardShow = false;
    this.myLoading = true;
    this.page = page;
    const payload = {
      order_status: this.order_status,
      payment_status: this.payment_status,
      pickup_type: this.pickup_type,
      created_by: this.created_by,
      order_type: this.order_type,
      search_field: this.search_field,
      search_value: this.search_value,
      page: this.page,
      admin_type: this.admin_detail.admin_type,
      main_store_id: this.admin_detail.store_id
        ? this.admin_detail.store_id
        : '',
    };
    this.orderService.getOrderList(payload).subscribe(
      (res_data: any) => {
        this.myLoading = false;
        if (res_data.success == false) {
          this.order_list = [];
          this.total_pages = [];
        } else {
          this.timezone = res_data.timezone;
          this.order_list = res_data.orders;
          console.log(this.order_list);
          this.vehicle_list = res_data.vehicles;
          this.checkIfOrderCanComplete();
          this.order_list.forEach((element) => {
            console.log('order: ', element.order_status);
          });
          this.total_page = res_data.pages;
          this.total_pages = Array(res_data.pages)
            .fill((x, i) => i)
            .map((x, i) => i + 1);
          if (this.order_list.length > 0) {
            this.order_detail = this.order_list[0];
            this.userId = this.order_list[0]?.user_id;
            this.isOnlinePaymentPaid =
              this.order_list[0]?.order_payment_detail?.is_payment_mode_online_payment;
          }
        }
      },
      (error: any) => {
        this.myLoading = false;
        this.helper.http_status(error);
      }
    );
  }

  checkIfOrderCanComplete() {
    // const readyForComplete = this.order_list.filter(o=>o.order_status === this.ORDER_STATE.OREDER_READY);
    // readyForComplete.forEach(order => {
    //     const readyTime = order.date_time.find(o=>o.status===this.ORDER_STATE.OREDER_READY).date;
    //     const diff = moment().diff(moment(readyTime),'minutes');
    //     console.log('diff: >> >> >>', diff);
    //     if(diff >= 15){
    //         this.orderStatus(order,this.ORDER_STATE.ORDER_COMPLETED);
    //     }
    // });
  }
  deliveryTimer() {
    // console.log(this.order_list)
    const readyOrder = this.order_list.filter(
      (ord) => ord.order_status === this.ORDER_STATE.OREDER_READY
    );
    if (readyOrder.length > 0) {
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
  }

  getDeliverIn(order) {
    let time: any = '00:00:00';
    var updatedAt = order.date_time.find(
      (ord_upd) => ord_upd.status === this.ORDER_STATE.OREDER_READY
    );
    if (updatedAt) {
      let deliverIn = moment().diff(
        moment().subtract(order.deliver_in, 'minutes')
      );
      const lapsed = moment().diff(moment(updatedAt.date));
      const diff = deliverIn - lapsed;
      if (
        !isNaN(diff) &&
        !isNaN(lapsed) &&
        moment.duration(lapsed).asMinutes() < order.deliver_in
      ) {
        time = moment.utc(diff).format('HH:mm:ss');
      }
    }
    return time;
  }

  orderDetail() {
    const payload = {
      order_status: this.order_status,
      payment_status: this.payment_status,
      pickup_type: this.pickup_type,
      created_by: this.created_by,
      order_type: this.order_type,
      search_field: this.search_field,
      search_value: this.search_value,
      page: this.page,
      admin_type: this.admin_detail.admin_type,
      main_store_id: this.admin_detail.store_id
        ? this.admin_detail.store_id
        : '',
    };

    this.orderService.getOrderList(payload).subscribe(
      (res_data: any) => {
        this.myLoading = false;
        if (res_data.success == false) {
          this.order_list = [];
          this.total_page = res_data.pages;
          this.total_pages = Array(res_data.pages)
            .fill((x, i) => i)
            .map((x, i) => i + 1);
        } else {
          this.timezone = res_data.timezone;
          this.total_page = res_data.pages;
          this.total_pages = Array(res_data.pages)
            .fill((x, i) => i)
            .map((x, i) => i + 1);
          this.checkIfOrderCanComplete();
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
              this.order_list[index].store_detail =
                res_data.orders[new_index].store_detail;
              this.order_list[index].order_payment_detail =
                res_data.orders[new_index].order_payment_detail;
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
          this.deliveryTimer();
        }
        this.cdr.detectChanges();
      },
      (error: any) => {
        this.helper.http_status(error);
      }
    );
  }

  // order_export_csv
  order_export_csv() {
    const payload = {
      order_status: this.order_status,
      payment_status: this.payment_status,
      pickup_type: this.pickup_type,
      created_by: this.created_by,
      order_type: this.order_type,
      search_field: this.search_field,
      search_value: this.search_value,
      admin_type: this.admin_detail.admin_type,
      main_store_id: this.admin_detail.store_id
        ? this.admin_detail.store_id
        : '',
    };
    this.orderService.getOrderList(payload).subscribe((res_data: any) => {
      var json2csv = require('json2csv').parse;
      console.log('res_data.orders: ', res_data.orders);
      res_data.orders.forEach((order, index) => {
        if (order.order_payment_detail.is_paid_from_wallet) {
          order.payment_status = this.title.wallet;
        } else {
          if (order.order_payment_detail.is_payment_mode_cash) {
            order.payment_status = this.title.cash;
          } else {
            if (order.order_payment_detail.length > 0) {
              order.payment_status = order.payment_gateway_detail[0].name;
            }
          }
        }

        order.user_name =
          order.user_detail.first_name + ' ' + order.user_detail.last_name;
        order.store_name = order.store_detail.name;

        order.city_name = order.city_detail.city_name;
        if (order.admin_notes) {
          if (order.admin_notes.length != 0) {
            order.admin_notes = order.admin_notes.join();
            console.log('Notes : ' + order.admin_notes);
          }
        }

        order.delivery_boy_name = order?.delivery_boy_name;

        switch (order.order_status) {
          case this.ORDER_STATE.WAITING_FOR_ACCEPT_STORE:
            order.status = this.status.waiting_for_accept;
            break;
          case this.ORDER_STATE.STORE_ACCEPTED:
            order.status = this.status.accepted;
            break;
          case this.ORDER_STATE.STORE_PREPARING_ORDER:
            order.status = this.status.start_preparing_order;
            break;
          case this.ORDER_STATE.OREDER_READY:
            order.status = this.status.order_ready;
            break;
          default:
            order.satus = '';
        }
        // order.amount = (
        //   +order.order_payment_detail.total_cart_price +
        //   +order?.order_payment_detail?.total_delivery_price
        // ).toFixed(2);
        order.amount = (+order.order_payment_detail.bill_amount).toFixed(2);
        if (isNaN(order.amount)) order.amount = '';
        order.final_amount = (+order.order_payment_detail
          .user_pay_payment).toFixed(2);
        order.checkout_amount = order?.order_payment_detail?.checkout_amount;
        order.promo_code = order?.promo_code_detail?.promo_code_name;
        order.promo_payment = order?.order_payment_detail?.promo_payment;
        order.delivey_fees = order?.order_payment_detail?.total_delivery_price;
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

      // var fieldNames = [
      //   this.title.id,
      //   this.title.user,
      //   this.title.store,
      //   this.title.city,
      //   this.title.status,
      //   this.title.amount,
      //   this.title.payment_by,
      //   this.title.date,
      //   this.title.delivery_at,
      // ];
      let fields = [
        {
          label: this.title.id,
          value: 'unique_id',
        },
        {
          label: this.title.user,
          value: 'user_name',
        },
        {
          label: this.title.store,
          value: 'store_name',
        },
        {
          label: 'Delivery Hero',
          value: 'delivery_boy_name',
        },
        {
          label: this.title.city,
          value: 'city_name',
        },
        {
          label: this.title.status,
          value: 'status',
        },
        {
          label: 'Bill Amount',
          value: 'amount',
        },
        {
          label: 'Final Amount',
          value: 'final_amount',
        },
        // {
        //   label: this.title.payment_by,
        //   value: 'payment_status',
        // },
        {
          label: this.title.date,
          value: 'created_at',
        },
        {
          label: this.title.delivery_at,
          value: 'store_order_created_at',
        },
        {
          label: 'Checkout Amount',
          value: 'checkout_amount',
        },
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
          label: 'Notes',
          value: 'admin_notes',
        },
      ];

      let csv = json2csv(res_data.orders, { fields });

      let final_csv: any = csv;
      this.helper.downloadFile(final_csv);
    });
    // this.helper.http
    //   .post('/admin/orders_list', {
    //     order_status: this.order_status,
    //     payment_status: this.payment_status,
    //     pickup_type: this.pickup_type,
    //     created_by: this.created_by,
    //     order_type: this.order_type,
    //     search_field: this.search_field,
    //     search_value: this.search_value,
    //     admin_type: this.admin_detail.admin_type,
    //     main_store_id: this.admin_detail.store_id
    //       ? this.admin_detail.store_id
    //       : '',
    //   })
    //   .subscribe((res_data: any) => {
    //     var json2csv = require('json2csv').parse;
    //     console.log('res_data.orders: ', res_data.orders);
    //     res_data.orders.forEach((order, index) => {
    //       if (order.order_payment_detail.is_paid_from_wallet) {
    //         order.payment_status = this.title.wallet;
    //       } else {
    //         if (order.order_payment_detail.is_payment_mode_cash) {
    //           order.payment_status = this.title.cash;
    //         } else {
    //           if (order.order_payment_detail.length > 0) {
    //             order.payment_status = order.payment_gateway_detail[0].name;
    //           }
    //         }
    //       }

    //       order.user_name =
    //         order.user_detail.first_name + ' ' + order.user_detail.last_name;
    //       order.store_name = order.store_detail.name;

    //       order.city_name = order.city_detail.city_name;
    //       if (order.admin_notes) {
    //         if (order.admin_notes.length != 0) {
    //           order.admin_notes = order.admin_notes.join();
    //           console.log('Notes : ' + order.admin_notes);
    //         }
    //       }

    //       order.delivery_boy_name = order?.delivery_boy_name;

    //       switch (order.order_status) {
    //         case this.ORDER_STATE.WAITING_FOR_ACCEPT_STORE:
    //           order.status = this.status.waiting_for_accept;
    //           break;
    //         case this.ORDER_STATE.STORE_ACCEPTED:
    //           order.status = this.status.accepted;
    //           break;
    //         case this.ORDER_STATE.STORE_PREPARING_ORDER:
    //           order.status = this.status.start_preparing_order;
    //           break;
    //         case this.ORDER_STATE.OREDER_READY:
    //           order.status = this.status.order_ready;
    //           break;
    //         default:
    //           order.satus = '';
    //       }
    //       // order.amount = (
    //       //   +order.order_payment_detail.total_cart_price +
    //       //   +order?.order_payment_detail?.total_delivery_price
    //       // ).toFixed(2);
    //       order.amount = (+order.order_payment_detail.bill_amount).toFixed(2);
    //       if (isNaN(order.amount)) order.amount = '';
    //       order.final_amount = (+order.order_payment_detail
    //         .user_pay_payment).toFixed(2);
    //       order.checkout_amount = order?.order_payment_detail?.checkout_amount;
    //       order.promo_code = order?.promo_code_detail?.promo_code_name;
    //       order.promo_payment = order?.order_payment_detail?.promo_payment;
    //       order.delivey_fees =
    //         order?.order_payment_detail?.total_delivery_price;
    //       switch (true) {
    //         case order?.order_payment_detail?.is_payment_mode_cash:
    //           order.payment_by = 'Cash';
    //           break;
    //         case order?.order_payment_detail?.is_payment_mode_card_on_delivery:
    //           order.payment_by = 'Card On Delivery';
    //           break;
    //         case order?.order_payment_detail?.is_payment_mode_online_payment:
    //           order.payment_by = 'Online Payment';
    //           break;
    //       }
    //     });

    //     // var fieldNames = [
    //     //   this.title.id,
    //     //   this.title.user,
    //     //   this.title.store,
    //     //   this.title.city,
    //     //   this.title.status,
    //     //   this.title.amount,
    //     //   this.title.payment_by,
    //     //   this.title.date,
    //     //   this.title.delivery_at,
    //     // ];
    //     let fields = [
    //       {
    //         label: this.title.id,
    //         value: 'unique_id',
    //       },
    //       {
    //         label: this.title.user,
    //         value: 'user_name',
    //       },
    //       {
    //         label: this.title.store,
    //         value: 'store_name',
    //       },
    //       {
    //         label: 'Delivery Hero',
    //         value: 'delivery_boy_name',
    //       },
    //       {
    //         label: this.title.city,
    //         value: 'city_name',
    //       },
    //       {
    //         label: this.title.status,
    //         value: 'status',
    //       },
    //       {
    //         label: 'Bill Amount',
    //         value: 'amount',
    //       },
    //       {
    //         label: 'Final Amount',
    //         value: 'final_amount',
    //       },
    //       {
    //         label: this.title.payment_by,
    //         value: 'payment_status',
    //       },
    //       {
    //         label: this.title.date,
    //         value: 'created_at',
    //       },
    //       {
    //         label: this.title.delivery_at,
    //         value: 'store_order_created_at',
    //       },
    //       {
    //         label: 'Checkout Amount',
    //         value: 'checkout_amount',
    //       },
    //       {
    //         label: 'Payment By',
    //         value: 'payment_by',
    //       },
    //       {
    //         label: 'Promo Code',
    //         value: 'promo_code',
    //       },
    //       {
    //         label: 'Promo Value',
    //         value: 'promo_payment',
    //       },
    //       {
    //         label: 'Delivery Fees',
    //         value: 'delivey_fees',
    //       },
    //       {
    //         label: 'Notes',
    //         value: 'admin_notes',
    //       },
    //     ];

    //     let csv = json2csv(res_data.orders, { fields });

    //     let final_csv: any = csv;
    //     this.helper.downloadFile(final_csv);
    //   });
  }

  orders_export_excel() {
    this.helper.http
      .post('/admin/orders_list', {
        order_status: this.order_status,
        payment_status: this.payment_status,
        pickup_type: this.pickup_type,
        created_by: this.created_by,
        order_type: this.order_type,
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
              order.payment_status = this.title.cash;
            } else {
              if (order.order_payment_detail.length > 0) {
                order.payment_status = order.payment_gateway_detail[0].name;
              }
            }
          }
          order.user_name =
            order.user_detail.first_name + ' ' + order.user_detail.last_name;
          order.store_name = order.store_detail.name;
          order.city_name = order.city_detail.city_name;
          switch (order.order_status) {
            case this.ORDER_STATE.WAITING_FOR_ACCEPT_STORE:
              order.status = this.status.waiting_for_accept;
              break;
            case this.ORDER_STATE.STORE_ACCEPTED:
              order.status = this.status.accepted;
              break;
            case this.ORDER_STATE.STORE_PREPARING_ORDER:
              order.status = this.status.start_preparing_order;
              break;
            case this.ORDER_STATE.OREDER_READY:
              order.status = this.status.order_ready;
              break;
            default:
              order.satus = '';
          }
          // order.amount = (
          //   +order.order_payment_detail.total_cart_price +
          //   +order?.order_payment_detail?.total_delivery_price
          // ).toFixed(2);
          order.amount = (+order.order_payment_detail.bill_amount).toFixed(2);
          order.final_amount = order?.order_payment_detail?.user_pay_payment;
          json_data.push({
            ID: order.unique_id,
            User: order.user_name,
            Store: order.store_name,
            City: order.city_name,
            Status: order.status,
            'Bill Amount': order.amount,
            FinalAmount: order.final_amount,
            'Payment By': order.payment_status,
            Date: order.created_at,
          });
        });

        json2excel.json2excel({
          data: json_data,
          name: 'order_excel',
          formateDate: 'yyyy/mm/dd',
        });
      });
  }

  open_detail_modal(order) {
    this.is_show_specification = false;
    this.order_total = 0;
    this.product_item_total = 0;
    this.total_item = 0;
    this.product_item_specification_total = 0;
    this.product_item_specification_total_array = [];
    this.product_item_total_array = [];
    this.product_specification_total_array = [];
    for (let product_index in this.order_detail.cart_detail.order_details) {
      this.product_specification_total_array.push(
        this.product_item_specification_total_array
      );
      this.product_item_specification_total_array = [];
      this.product_item_total_array.push(
        this.order_detail.cart_detail.order_details[product_index]
          ?.total_item_price
      );
      this.product_item_total = 0;

      let subs_id = [];
      this.order_detail.cart_detail.order_details[product_index][
        'items'
      ].forEach((itm) => {
        if (itm.substitute_items) {
          subs_id = subs_id.concat(itm.substitute_items);
        }
      });

      for (
        let i = 0;
        i <
        this.order_detail.cart_detail.order_details[product_index]['items']
          .length;
        i++
      ) {
        if (
          subs_id.includes(
            this.order_detail.cart_detail.order_details[product_index]['items'][
              i
            ].item_id
          )
        ) {
          this.order_detail.cart_detail.order_details[product_index]['items'][
            i
          ].user_selected = true;
        }
      }

      for (let item of this.order_detail.cart_detail.order_details[
        product_index
      ].items) {
        this.order_total =
          this.order_total +
          (item.item_price +
            (item.total_specification_price
              ? item.total_specification_price
              : 0)) *
            item.quantity;
        this.product_item_total =
          this.product_item_total +
          (item.item_price +
            (item.total_specification_price
              ? item.total_specification_price
              : 0)) *
            item.quantity;
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
        this.helper.http
          .post('/api/user/get_substitute_items', {
            if_store_panel: true,
            item_id: item.item_id,
            store_id: order.store_id,
          })
          .subscribe((res_data: any) => {
            this.order_detail.cart_detail.order_details[product_index][
              'show_substitute'
            ] = res_data.success;
            if (res_data.success) {
              this.order_detail.cart_detail.order_details[product_index][
                'substitutes'
              ] = [];
              res_data.items.forEach((itm) => {
                this.order_detail.cart_detail.order_details[product_index][
                  'substitutes'
                ].push({
                  image_url: itm.image_url[0],
                  price: +itm.price,
                  name: itm.name,
                });
              });
            } else {
              this.order_detail.cart_detail.order_details[product_index][
                'substitutes'
              ] = [];
            }
          });
      }
      if (
        Number(product_index) ==
        this.order_detail.cart_detail.order_details.length - 1
      ) {
        this.modalService.open(this.order_detail_modal, { size: 'xl' });
      }
    }
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
    ].items[item_index].sender_note
      ? this.order_detail.cart_detail.order_details[product_index].items[
          item_index
        ].sender_note
      : '';
    this.reciever_name = this.order_detail.cart_detail.order_details[
      product_index
    ].items[item_index].reciever_note
      ? this.order_detail.cart_detail.order_details[product_index].items[
          item_index
        ].reciever_note
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

  get_order_detail(index) {
    this.order_detail = this.order_list[index];
    this.userId = this.order_detail?.user_id;
    this.isOnlinePaymentPaid =
      this.order_detail?.order_payment_detail?.is_payment_mode_online_payment;
  }

  selected_items_subs = {};
  @ViewChild('sub_items_modal_for_user')
  sub_items_modal_for_user: any;
  open_sub_items_modal_for_user(item) {
    this.selected_items_subs = item;
    this.modalService.open(this.sub_items_modal_for_user, {
      windowClass: 'substitute-modal',
    });
  }

  deliverIn(orderId: any) {
    let deliverIn: any = Number(
      prompt('Enter Deliver In time(In Minutes) you want to extend?', '10')
    );
    if (isNaN(deliverIn)) {
      alert('Invalid time, Enter Deliver In time(In Minutes)!');
      deliverIn = Number(
        prompt('Enter Deliver In time you want to extend?', '10')
      );
    }
    if (!isNaN(deliverIn)) {
      this.orderService
        .setDeliveryIn({ deliverIn: Number(deliverIn), orderId })
        .subscribe({
          next: (res: any) => {
            this.orderDetail();
          },
        });
    }
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
            this.admin_history(this.page);
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

  //For Admin Notes
  assignVehicle(order) {
    if (order) {
      let server_token, vehicle_id, store_id, order_id;
      (store_id = order.store_id),
        (server_token = order.store_detail.server_token);
      vehicle_id = this.selected_vehicle;
      order_id = order._id;
      this.vehicle_data = { store_id, server_token, vehicle_id, order_id };

      this.helper.http
        .post('api/store/create_request', this.vehicle_data)
        .subscribe(
          (res_data: any) => {
            if (res_data.success == true) {
              alert('Vehicle Assign Succesfully');
              this.helper.data.storage = {
                message: this.helper.MESSAGE_CODE[res_data.message],
                class: 'alert-info',
              };
              this.admin_history(this.page);
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

  //onChange Vehicle
  onOptionsSelected(event) {
    const value = event.target.value;
    this.selected_vehicle = value;
  }

  //copy Address
  copyAddress(order) {
    let deliveryAddress;
    let destAddress;
    let checkout_amount;
    let paymentMode;
    let order_id;
    let mobileNumber;
    try {
      destAddress = order?.cart_detail?.destination_addresses[0];
      checkout_amount = order?.order_payment_detail?.checkout_amount;
      order_id = order?.unique_id;
      mobileNumber =
        order?.user_detail.country_phone_code + ' ' + order?.user_detail.phone;
      switch (true) {
        case order?.order_payment_detail?.is_payment_mode_card_on_delivery:
          paymentMode = 'Card on delivery';
          break;
        case order?.order_payment_detail?.is_payment_mode_online_payment:
          paymentMode = 'Online payment';
          break;
        default:
          paymentMode = 'Cash';
          break;
      }
      deliveryAddress = destAddress?.location || ['', ''];
    } catch (error) {
      deliveryAddress = [];
    }
    if (!deliveryAddress.length) {
      alert('Invalid destination address!');
      return;
    }
    const latLong = `${deliveryAddress[0]},${deliveryAddress[1]}`;

    let clipboardData = `Order Id - ${order_id},\n`;
    clipboardData += `Apartment number -  ${destAddress?.appartmentno}\n`;
    clipboardData += `Building name - ${destAddress?.building_no}\n`;
    clipboardData += `Mobile Number - ${mobileNumber}\n`;
    if (destAddress?.note)
      clipboardData += `Note : ${destAddress?.note || ''}\n`;
    clipboardData += `Payment mode : ${paymentMode}\n`;
    clipboardData += `Checkout amount : ${checkout_amount}\n`;
    clipboardData += `Map location: https://www.google.com/maps/place/${latLong}/@${latLong}`;
    navigator.clipboard.writeText(clipboardData);
    this.helper.data.storage = {
      message: 'Copied Successfully!',
      class: 'alert-info',
    };
    this.helper.message();
  }

  shareLocation(order) {
    let deliveryAddress;
    let destAddress;
    let checkout_amount;
    let paymentMode;
    let order_id;
    try {
      destAddress = order?.cart_detail?.destination_addresses[0];
      checkout_amount = order?.order_payment_detail?.checkout_amount;
      order_id = order?.unique_id;
      switch (true) {
        case order?.order_payment_detail?.is_payment_mode_card_on_delivery:
          paymentMode = 'Card on delivery';
          break;
        case order?.order_payment_detail?.is_payment_mode_online_payment:
          paymentMode = 'Online payment';
          break;
        default:
          paymentMode = 'Cash';
          break;
      }
      deliveryAddress = destAddress?.location || ['', ''];
    } catch (error) {
      deliveryAddress = [];
    }
    if (!deliveryAddress.length) {
      alert('Invalid destination address!');
      return;
    }
    const latLong = `${deliveryAddress[0]},${deliveryAddress[1]}`;
    let clipboardData = `Order Id - ${order_id},\n`;
    clipboardData += `Apartment number -  ${destAddress?.appartmentno}\n`;
    clipboardData += `Building name - ${destAddress?.building_no}\n`;
    if (destAddress?.note)
      clipboardData += `Note : ${destAddress?.note || ''}\n`;
    clipboardData += `Payment mode : ${paymentMode}\n`;
    clipboardData += `Checkout amount : ${checkout_amount}\n`;
    clipboardData += `Map location: https://www.google.com/maps/place/${latLong}/@${latLong}`;
    navigator.clipboard.writeText(clipboardData);
    if (this.navigator.share) {
      this.navigator
        .share({
          title: 'Delivery Address',
          url: clipboardData,
        })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    } else {
      // alert('share not supported');
      window.open(
        `https://www.google.com/maps/place/${latLong}/@${latLong}`,
        '_blank'
      );
    }
  }

  //assign delivery boy
  @ViewChild('deliveryBoyModal')
  deliveryBoyModal: any;

  assignDeliveryBoy(order, orderStatus, type, url?) {
    this.modalReference = this.modalService.open(this.deliveryBoyModal, {
      windowClass: 'substitute-modal',
    });
    if (type) {
      this.IsModalFieldsShow = true;
    } else {
      this.IsModalFieldsShow = false;
    }
    this.orderUpdatedStatus = orderStatus;
    this.orderUrl = url;
    this.selectedOrder = order;
    this.setChecked();
  }

  addDeliveryBoy() {
    let new_status = this.orderUpdatedStatus;
    let url = this.orderUrl ? this.orderUrl : '/api/admin/admin_update_order';
    let data = this.selectedOrder;
    if (new_status == this.ORDER_STATE.OREDER_READY) {
      const checkout_amount = this.payload['checkout_amount'];
      const bill_amount = this.payload['bill_amount'];
      const deliver_in = this.payload['deliver_in'];
      const delivery_boy_name = this.payload['delivery_boy_name'];

      if (!checkout_amount) {
        this.toastr.show('Please Enter Customer payable amount');
        return;
      }
      if (!bill_amount) {
        this.toastr.show('Please Enter Billing amount at the store');
        return;
      }

      if (delivery_boy_name) {
        this.selectedDeliveryBoy = delivery_boy_name;
      }
      if (!this.selectedDeliveryBoy) {
        this.toastr.show('Please Select Delivery Boy');
        return;
      }

      var fromData = new FormData();
      fromData.append('reciept', this.reciept_image);
      fromData.append('store_id', data.store_id);
      fromData.append('deliver_in', String(deliver_in));
      fromData.append('order_id', data._id);
      fromData.append('order_status', new_status);
      fromData.append('checkout_amount', String(checkout_amount));
      fromData.append('bill_amount', String(bill_amount));
      fromData.append('delivery_boy_name', this.selectedDeliveryBoy);
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
              var index = this.order_list.findIndex((x) => x._id == data._id);
              this.order_list[index].order_status = data.new_status;
              this.order_list[index].order_payment_detail.checkout_amount =
                checkout_amount;
              this.admin_history(this.page);
              this.modalReference.close();
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
      console.log('data: ', data);
      let payload: any = {
        store_id: data.store_id,
        order_id: data._id,
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
            var index = this.order_list.findIndex((x) => x._id == data._id);
            this.order_list[index].order_status = data.new_status;
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
  }

  radioChecked(list, i) {
    if (typeof list === 'string') {
      this.IsDeliveryShow = true;
    } else {
      this.IsDeliveryShow = false;
      this.selectedDeliveryBoy = list.name;
    }
  }

  get isOtherDBoy() {
    return this.delivery_boy_list.find(
      (item) => item.name === this.selectedOrder?.delivery_boy_name
    );
  }

  setChecked() {
    let isAnyChecked = false;
    let delivery_boy = this.selectedOrder?.delivery_boy_name;
    console.log('delivery_boy: ', delivery_boy);
    this.delivery_boy_list.forEach((dboy) => {
      dboy.checked = dboy.name === delivery_boy ? true : false;
      if (dboy.checked) {
        isAnyChecked = true;
      }
    });
    if (!isAnyChecked) {
      this.IsDeliveryShow = true;
      this.payload.delivery_boy_name = delivery_boy;
    }
  }

  get dboyName() {
    return this.IsDeliveryShow
      ? this.payload.delivery_boy_name
      : this.selectedDeliveryBoy;
  }

  updateDeliveryBody() {
    console.log('this.dboyName: ', this.dboyName);
    console.log('this.selectedOrder: ', this.selectedOrder?._id);
    let order_id = this.selectedOrder?._id;
    if (order_id) {
      const payload = {
        delivery_boy_name: this.dboyName,
        _id: order_id,
      };
      this.orderService.updateDeliveryBoy(payload).subscribe((res: any) => {
        if (res.status) {
          this.toastr.success('updated successfully');
          this.admin_history(this.page);
          this.modalReference.close();
          return;
        }
      });
    }
  }

  switchPayment() {
    if (isNaN(Number(this.onlinePaymentPin))) {
      this.toastr.error('Please Enter Pin in Number : ');
      return;
    }

    if (Number(this.onlinePaymentPin) === this.setting_pin) {
      this.getCardList(this.userId);
    }
  }

  onCardChange(event) {
    const card_id = event.target.value;
    const card = this.card_list.find((o) => o._id === card_id);
    this.instrument_id = card?.instrument_id;
    this.card_id = card?._id;

    if (!this.instrument_id) {
      this.toastr.error('Instrument_id not exist, please select another card!');
    }
  }

  switchToOnline() {
    const cart_id = this.order_detail?.cart_id;
    const order_status = this.order_detail?.order_status;
    const order_payment_id = this.order_detail?.order_payment_id;
    const order_payment_unique_id = this.order_detail?.unique_id;
    const card_id = this.card_id;
    const checkout_amount =
      this.order_detail?.order_payment_detail?.total_delivery_price +
      this.order_detail?.order_payment_detail?.total_order_price;

    const payload = {
      card_id,
      cart_id,
      order_payment_id,
      checkout_amount,
      order_payment_unique_id,
      instrument_id: this.instrument_id,
      order_status,
    };

    if (card_id && checkout_amount && this.instrument_id) {
      this.orderService.deductPaymentByCard(payload).subscribe((res: any) => {
        if (res.success) {
          this.isCardShow = false;
          this.onlinePaymentPin = '';
          this.toastr.success('Switched!');
          this.admin_history(this.page);
        }
      });
    }
  }

  //assign delivery boy
  @ViewChild('paymentCheckOutModal')
  paymentCheckOutModal: any;

  paymentCheckOut() {
    this.modalReference = this.modalService.open(this.paymentCheckOutModal, {});
  }

  checkCurrency(currencyToCheck) {
    return this.threedigitcurrency.indexOf(currencyToCheck) >= 0;
  }

  copyLink() {
    const copyText = (<HTMLInputElement>document.getElementById('myInput'))
      .value;
    navigator.clipboard.writeText(copyText);
  }

  onSubmit() {
    const amount = jQuery('input[name=amount]').val();
    const currency = jQuery('#currency').find(':selected').val();
    const reference = jQuery('input[name=reference]').val();
    const country = jQuery('#country').find(':selected').val();
    const random = (Math.random() + 1).toString(36).substring(6);
    const email = random + '@checkout.com';
    console.log(email);

    if (this.checkCurrency(currency)) {
      this.calculatedAmount = parseFloat(amount.replace(',', '')) * 1000;
    } else {
      this.calculatedAmount = parseFloat(amount.replace(',', '')) * 100;
    }

    this.calculatedAmount = parseFloat(this.calculatedAmount.toFixed());

    const dataObj = {
      amount: this.calculatedAmount,
      currency: currency,
      reference: reference,
      expires_in: 604800,
      billing: {
        address: {
          country: country,
        },
      },
    };

    const dataJson = JSON.stringify(dataObj);
    console.log(dataJson);

    jQuery.ajax({
      url: 'https://api.checkout.com/payment-links',
      beforeSend: function (xhr) {
        xhr.setRequestHeader(
          'Authorization',
          'sk_fda8961e-4193-4f06-a5db-9a9c0fb0519f'
        );
      },
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      processData: false,
      data: dataJson,
      success: function (data) {
        jQuery('#myInput').val(data._links.redirect.href);
      },
      error: function (response) {
        alert('Cannot get data');
        console.log(response);
      },
    });

    /*$.post("getLink.php",
      {
        amount: amount.value,
        reference: reference.value,
        country: country.value,
        currency: currency.value
      },
      function(data,status){
        myInput.value = data;
      });*/
  }

  toggleFilter() {
    this.isShowFilters = !this.isShowFilters;
  }

  toggleDp() {
    this.isShowFilters = !this.isShowFilters;
  }
}
