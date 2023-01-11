import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
declare var c3: any;
import { Helper } from '../../helper';
import jQuery from 'jquery';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
declare var Notification: any, sprd: any;
declare var swal: any;

export interface List {
  total_users: Number;
  total_providers: Number;
  total_store: Number;
  total_countries: Number;
  total_cities: Number;
}

export interface OrderDetail {
  completed_order: Number;
  total_item_sold: Number;
  total_payments: Number;
  promo_payment: Number;
  cash_payment: Number;
  wallet_payment: Number;
  other_payment: Number;
  admin_earning: Number;
  order_payment: Number;
  delivery_payment: Number;
  store_earning: Number;
  provider_earning: Number;
  admin_earn_per: Number;
  store_earn_per: Number;
  provider_earn_per: Number;
  store_payment_pre_earning: Number;
  provider_payment_pre_earning: Number;
  yeep_earning: Number;
}

export interface OrderDetail1 {
  total_orders: Number;
  total_deliveries: Number;
  cancelled_order: Number;
}

export interface StoreSetting {
  store_id: Object;
  server_token: String;
  social_id: any[];
  login_by: String;
  store_time: any[];
  is_business: Boolean;
  is_visible: Boolean;
  is_use_item_tax: Boolean;
  item_tax: Number;
  store_open_time: any;
  store_close_time: any;
  old_password: String;
  free_delivery_for_above_order_price: number;
  free_delivery_within_radius: number;
  is_store_pay_delivery_fees: Boolean;
  delivery_time: Number;
  delivery_time_max: Number;
  price_rating: Number;
  admin_profit_mode_on_store: Number;
  admin_profit_value_on_store: Number;
  lang: string;
  famous_for: any[];
  is_order_cancellation_charge_apply: Boolean;
  order_cancellation_charge_for_above_order_price: number;
  order_cancellation_charge_type: number;
  order_cancellation_charge_value: number;
  max_item_quantity_add_by_user: number;
  schedule_order_create_after_minute: number;
  is_provide_delivery_anywhere: Boolean;
  delivery_radius: number;
  is_ask_estimated_time_for_ready_order: Boolean;
  is_taking_schedule_order: Boolean;
  inform_schedule_order_before_min: number;
  min_order_price: number;
  is_store_busy: Boolean;
  is_provide_pickup_delivery: Boolean;
  auto_complete_order: Number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  providers: [Helper],
})
export class DashboardComponent implements OnInit {
  @ViewChild('order_detail_modal')
  order_detail_modal: NgbModal;
  public order_detail: OrderDetail;
  public order_detail1: OrderDetail1;
  public store_setting: StoreSetting | any;
  public list: List;
  country_list: any[] = [];
  selected_country: string = 'all';
  myLoading: Boolean = false;
  start_date: any = '';
  end_date: any = '';
  date_error: number = 0;
  validation_message: any;
  heading_title: any;
  title: any;
  button: any;
  startDate: any;
  endDate: any;
  no_of_record;
  no_of_item: Number;
  no_of_user: Number;
  top_user_list: any[] = [];
  top_item_list: any[] = [];
  admin_detail: any = {};
  cartDetails: any = {};

  /*For Store Seeting */
  store_list: any[];
  selectedStore: any;
  store_id = { _id: null, name: null }; //for getting store data in separate columns
  edit: Boolean = false;
  type: string = '';
  @ViewChild('oldPasswordModal')
  old_password_modal: any;
  @ViewChild('myModal')
  modal: any;
  selected_store_time_array: any[] = [];
  store_time_millisecond_array: any[] = [];
  curren_selected_day: number = 0;
  is_store_open_full_time: Boolean = false;
  is_store_open: Boolean = false;
  store_open_time_error: number;
  store_close_time_error: number;
  store_time_add: Boolean;
  famous_for: any[] = [];
  isSettingShow: boolean = false;
  dropdownSettings: IDropdownSettings = {
    singleSelection: true,
    idField: '_id',
    textField: 'display',
    // selectAllText: 'Select All',
    // unSelectAllText: 'UnSelect All',
    itemsShowLimit: 5,
    allowSearchFilter: true,
    closeDropDownOnSelection: true,
  };

  //////// for pie chart ////////
  public pieChartLabels: string[] = [
    'Other Payment',
    'Cash Payment',
    'Promo',
    'Wallet',
  ];
  public pieChartData: number[] = [0, 0, 0, 0];
  public pieChartType: string = 'pie';
  public pieChartLegend: boolean = false;

  public pieChartColors: Array<any> = [
    {
      backgroundColor: ['#de404c', '#e56671', '#d3d3d3', '#bababa'],
    },
  ];
  ///////////////////////////

  /////////// for line chart ///////////
  public lineChartData: Array<any> = [
    { data: [], label: 'Total' },
    { data: [], label: 'Admin Earn' },
    { data: [], label: 'Admin Paid' },
    { data: [], label: 'Paid Deliveryman' },
    { data: [], label: 'Paid Store' },
  ];
  public lineChartLabels: Array<any> = [];
  public lineChartOptions: any = {
    responsive: true,
    labels: {
      fontSize: '15px',
    },
  };
  public lineChartColors: Array<any> = [
    {
      backgroundColor: 'rgba(241, 190, 186, 0.50)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: '#cc212e',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#cc212e',
    },
    {
      backgroundColor: 'rgba(241, 241, 241, 0.50)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)',
    },
    {
      backgroundColor: 'rgba(241, 241, 241, 0.50)',
      borderColor: 'red',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)',
    },
    {
      backgroundColor: 'rgba(241, 241, 241, 0.50)',
      borderColor: 'blue',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)',
    },
    {
      backgroundColor: 'rgba(241, 241, 241, 0.50)',
      borderColor: 'green',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)',
    },
  ];
  public lineChartLegend: boolean = true;
  public lineChartType: string = 'line';

  ////////////////////////

  ////// for bar chart //////////////

  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
  };
  public barChartLabels: string[] = [];
  public barChartType: string = 'bar';
  public barChartLegend: boolean = true;

  public barChartData: any[] = [
    { data: [], label: 'Total orders' },
    { data: [], label: 'Total Deliveries' },
    { data: [], label: 'Completed Order' },
    { data: [], label: 'Rejected By Store' },
    { data: [], label: 'Cancelled By User' },
  ];

  public barChartColors: Array<any> = [
    {
      backgroundColor: '#f1beba',
      borderColor: '#f1beba',
    },
    {
      backgroundColor: 'black',
      borderColor: 'black',
    },
    {
      backgroundColor: 'red',
      borderColor: 'red',
    },
    {
      backgroundColor: 'green',
      borderColor: 'green',
    },
    {
      backgroundColor: 'blue',
      borderColor: 'blue',
    },
  ];

  ////////////////////////

  constructor(
    public helper: Helper,
    public vcr: ViewContainerRef,
    private modalService: NgbModal,
    private activeModal: NgbActiveModal
  ) {}

  ngAfterViewInit() {
    jQuery('.chosen-select').chosen();
    setTimeout(function () {
      jQuery('.chosen-select').trigger('chosen:updated');
    }, 1000);

    jQuery('.clock-picker').clockpicker({
      default: 'now',
      align: 'right',
    });
  }

  ngOnInit() {
    this.helper.message();
    //this.change_day(0);
    this.validation_message = this.helper.validation_message;
    this.heading_title = this.helper.heading_title;
    this.title = this.helper.title;
    this.button = this.helper.button;
    this.no_of_item = null;
    this.no_of_user = null;
    this.order_detail = {
      completed_order: 0,
      total_item_sold: 0,
      total_payments: 0,
      promo_payment: 0,
      cash_payment: 0,
      wallet_payment: 0,
      other_payment: 0,
      admin_earning: 0,
      order_payment: 0,
      delivery_payment: 0,
      store_earning: 0,
      provider_earning: 0,
      admin_earn_per: 0,
      store_earn_per: 0,
      provider_earn_per: 0,
      store_payment_pre_earning: 0,
      provider_payment_pre_earning: 0,
      yeep_earning: 0,
    };
    this.order_detail1 = {
      total_orders: 0,
      total_deliveries: 0,
      cancelled_order: 0,
    };

    this.list = {
      total_users: 0,
      total_providers: 0,
      total_store: 0,
      total_countries: 0,
      total_cities: 0,
    };

    this.store_setting = {
      store_id: '',
      server_token: '',
      social_id: [],
      login_by: '',
      store_time: [],
      famous_for: [],
      is_business: true,
      is_visible: true,
      is_use_item_tax: false,
      item_tax: null,
      old_password: '',
      store_open_time: '',
      store_close_time: '',
      is_store_pay_delivery_fees: false,
      free_delivery_for_above_order_price: null,
      free_delivery_within_radius: null,
      delivery_time: null,
      delivery_time_max: null,
      price_rating: null,
      admin_profit_mode_on_store: null,
      admin_profit_value_on_store: null,
      lang: '',
      is_store_busy: false,

      is_order_cancellation_charge_apply: false,
      order_cancellation_charge_for_above_order_price: 0,
      order_cancellation_charge_type: 1,
      order_cancellation_charge_value: 0,
      max_item_quantity_add_by_user: 0,
      schedule_order_create_after_minute: 0,
      is_provide_delivery_anywhere: false,
      delivery_radius: 0,
      is_taking_schedule_order: false,
      is_ask_estimated_time_for_ready_order: false,
      inform_schedule_order_before_min: 0,
      min_order_price: 0,
      is_provide_pickup_delivery: false,
    };
    this.store_time_add = true;

    this.checkAdminTyp();
    this.helper.http
      .get('api/admin/get_country_list')

      .subscribe(
        (res_data: any) => {
          this.country_list = res_data.countries;
        },
        (error: any) => {}
      );
    jQuery(document.body)
      .find('#selected_country')
      .on('change', (evnt, res_data) => {
        this.selected_country = res_data.selected;
        this.order_details();
      });

    this.helper.http
      .post('/admin/dashboard/last_fifteen_day_order_detail', {})
      .subscribe((res_data: any) => {
        if (res_data.success) {
          let labels: string[] = [];
          res_data.array.forEach((order_data) => {
            labels.push(order_data._id);
            this.barChartData[0].data.push(order_data.total_orders);
            this.barChartData[1].data.push(order_data.total_deliveries);
            this.barChartData[2].data.push(order_data.completed_order);
            this.barChartData[3].data.push(order_data.rejected_by_store);
            this.barChartData[4].data.push(order_data.cancelled_by_user);
          });
          this.barChartLabels = labels;
        }
      });

    jQuery('#open').on('change', (event, res_data) => {
      this.store_open_time_error = 0;
      this.store_close_time_error = 0;
      var open = (<any>jQuery('#open')).val();
      var close = (<any>jQuery('#close')).val();
      this.store_setting.store_open_time = open;

      var open_date = new Date(Date.now());
      open = open.split(':');
      open_date.setHours(open[0], open[1], 0, 0);
      open = open_date.getTime();

      var close_date = new Date(Date.now());
      close = close.split(':');
      close_date.setHours(close[0], close[1], 0, 0);
      close = close_date.getTime();

      if (open >= close) {
        this.store_open_time_error = 1;
      } else {
        this.store_open_time_error = 0;
      }

      for (var i in this.store_time_millisecond_array) {
        var open_time = this.store_time_millisecond_array[i].store_open_time;
        var close_time = this.store_time_millisecond_array[i].store_close_time;

        if (open_time <= open && open <= close_time) {
          this.store_open_time_error = 2;
        } else if (open <= open_time && close_time <= close) {
          this.store_open_time_error = 2;
        }
      }
    });

    jQuery('#close').on('change', (event, res_data) => {
      this.store_close_time_error = 0;
      this.store_open_time_error = 0;
      var open = (<any>jQuery('#open')).val();
      var close = (<any>jQuery('#close')).val();
      this.store_setting.store_close_time = close;
      var open_date = new Date(Date.now());
      open = open.split(':');
      open_date.setHours(open[0], open[1], 0, 0);
      open = open_date.getTime();

      var close_date = new Date(Date.now());
      close = close.split(':');
      close_date.setHours(close[0], close[1], 0, 0);
      close = close_date.getTime();

      if (open >= close) {
        this.store_close_time_error = 1;
      } else {
        this.store_close_time_error = 0;
      }

      for (var i in this.store_time_millisecond_array) {
        let open_time = this.store_time_millisecond_array[i].store_open_time;
        let close_time = this.store_time_millisecond_array[i].store_close_time;

        if (open_time <= close && close <= close_time) {
          this.store_close_time_error = 2;
        } else if (open <= open_time && close_time <= close) {
          this.store_close_time_error = 2;
        }
      }
    });

    // this.order_details();
    this.top_user_and_item('user');
    this.top_user_and_item('item');
    this.notification_permission();
    this.getCarts();
    this.get_store_list('5d6791abc01cf5683d14c418');
  }

  get_store_list(countryid) {
    this.helper.http
      .post('/admin/get_store_list_for_country', { country_id: countryid })
      .subscribe((res_data: any) => {
        this.store_list = res_data.stores_all.map(function (store) {
          store.display = store.name + ' ' + store.email;
          return store;
        });
        //  console.log('Stores',this.store_list);
      });
  }

  onItemSelect(item: any) {
    this.store_id = item;
    let store = this.store_list.filter((x) => x._id === item._id);
    this.getStoreData(item._id, store[0]?.server_token);
  }

  getStoreData(store_id, server_token) {
    this.store_setting.store_id = store_id;
    this.store_setting.server_token = server_token;
    var language = JSON.parse(localStorage.getItem('language'));
    if (language == '' || language == undefined) {
      language = 'en';
    }
    this.helper.http
      .post('/api/store/get_store_data', {
        store_id: this.store_setting.store_id,
        server_token: this.store_setting.server_token,
      })
      .subscribe(
        (res_data: any) => {
          if (res_data.success == false) {
            this.helper.data.storage = {
              code: res_data.error_code,
              message: this.helper.ERROR_CODE[res_data.error_code],
              class: 'alert-danger',
            };
          } else {
            this.isSettingShow = true;
            this.famous_for =
              res_data.store_detail.delivery_details.famous_products_tags;
            var store = res_data.store_detail;
            this.store_setting.store_id = store._id;
            this.store_setting.server_token = store.server_token;
            this.store_setting.social_id = store.social_ids;
            this.store_setting.login_by = store.login_by;
            this.store_setting.store_time = store.store_time;
            this.store_setting.is_business = store.is_business;
            this.store_setting.is_visible = store.is_visible;
            this.store_setting.is_store_busy = store.is_store_busy;
            this.store_setting.item_tax = store.item_tax;
            this.store_setting.is_store_pay_delivery_fees =
              store.is_store_pay_delivery_fees;
            this.store_setting.free_delivery_for_above_order_price =
              store.free_delivery_for_above_order_price;
            this.store_setting.free_delivery_within_radius =
              store.free_delivery_within_radius;
            this.store_setting.delivery_time = store.delivery_time;
            this.store_setting.delivery_time_max = store.delivery_time_max;
            this.store_setting.price_rating = store.price_rating;
            this.store_setting.admin_profit_mode_on_store =
              store.admin_profit_mode_on_store;
            this.store_setting.admin_profit_value_on_store =
              store.admin_profit_value_on_store;
            this.store_setting.famous_for = store.famous_products_tags;
            this.store_setting.is_order_cancellation_charge_apply =
              store.is_order_cancellation_charge_apply;
            this.store_setting.order_cancellation_charge_for_above_order_price =
              store.order_cancellation_charge_for_above_order_price;
            this.store_setting.order_cancellation_charge_type =
              store.order_cancellation_charge_type;
            this.store_setting.order_cancellation_charge_value =
              store.order_cancellation_charge_value;

            this.store_setting.max_item_quantity_add_by_user =
              store.max_item_quantity_add_by_user;
            this.store_setting.schedule_order_create_after_minute =
              store.schedule_order_create_after_minute;
            this.store_setting.is_provide_delivery_anywhere =
              store.is_provide_delivery_anywhere;
            this.store_setting.delivery_radius = store.delivery_radius;
            this.store_setting.is_delivery_region_selected =
              store.is_delivery_region_selected;
            this.store_setting.delivery_regions = store.delivery_regions;
            this.store_setting.radius_regions = store.radius_regions || [];
            this.store_setting.ask_password_timer = store.ask_password_timer;
            this.store_setting.store_sequence = store.store_sequence;
            this.store_setting.under_item_price = store.under_item_price;
            this.store_setting.free_delivery_text = store.free_delivery_text;
            this.store_setting.paid_delivery_text = store.paid_delivery_text;
            this.store_setting.is_show_user_info = store.is_show_user_info;

            console.log('After gettin data from DB in init');
            console.log(store.radius_regions);
            this.store_setting.is_taking_schedule_order =
              store.is_taking_schedule_order;
            this.store_setting.is_ask_estimated_time_for_ready_order =
              store.is_ask_estimated_time_for_ready_order;
            this.store_setting.inform_schedule_order_before_min =
              store.inform_schedule_order_before_min;
            this.store_setting.min_order_price = store.min_order_price;
            this.store_setting.is_provide_pickup_delivery =
              store.is_provide_pickup_delivery;
            this.helper.router_id.admin.store_location = store.location;
            this.store_setting.min_order_for_loyalty =
              store.min_order_for_loyalty;
            this.store_setting.max_loyalty_point_user_redeem =
              store.max_loyalty_point_user_redeem;

            this.change_day(0, 'Sun');

            this.store_setting.famous_for.forEach(function (famous) {
              famous = famous.replace(/[\s]/g, '');
              setTimeout(() => {
                jQuery('#icheck' + famous).iCheck('check');
              }, 400);
            });
          }
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
  }

  updateStoreTime(store_data) {
    // if(this.store_setting.social_id.length == 0){
    //     this.type = "time"
    //     this.old_password_modal.open();
    // } else {
    this.updateStoreTimeService();
    // }
  }

  remove_store_time(store_time) {
    if (!this.is_store_open_full_time && this.edit) {
      swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      })
        .then(() => {
          var i = this.selected_store_time_array.indexOf(store_time);
          if (i != -1) {
            this.selected_store_time_array.splice(i, 1);
            this.store_time_millisecond_array.splice(i, 1);
            // this.updateStoreTime()
          }
        })
        .catch(swal.noop);
    }
  }

  updateStoreTimeService() {
    this.myLoading = true;
    this.helper.http
      .post('/api/store/update_store_time', {
        store_time: this.store_setting.store_time,
        store_id: this.store_setting.store_id,
        server_token: this.store_setting.server_token,
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
            var store = JSON.parse(localStorage.getItem('store'));
          } else {
            this.edit = false;
            localStorage.setItem('store', JSON.stringify(res_data.store));
            this.helper.data.storage = {
              message: this.helper.MESSAGE_CODE[res_data.message],
              class: 'alert-info',
            };
            this.helper.message();
          }
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
  }

  change_day(selected_day, day_name) {
    this.curren_selected_day = selected_day;
    let index = this.store_setting.store_time.findIndex(
      (x) => x.day == selected_day
    );
    this.store_setting.store_time[index].day_name = day_name;
    this.is_store_open_full_time =
      this.store_setting.store_time[index].is_store_open_full_time;
    this.is_store_open = this.store_setting.store_time[index].is_store_open;
    this.selected_store_time_array =
      this.store_setting.store_time[index].day_time;
    this.store_time_millisecond_array = [];
    this.selected_store_time_array.forEach((time) => {
      var open_date = new Date(Date.now());
      var open_time = time.store_open_time;
      open_time = open_time.split(':');
      open_date.setHours(open_time[0], open_time[1], 0, 0);

      var close_date = new Date(Date.now());
      var close_time = time.store_close_time;
      close_time = close_time.split(':');
      close_date.setHours(close_time[0], close_time[1], 0, 0);

      this.store_time_millisecond_array.push({
        store_open_time: open_date.getTime(),
        store_close_time: close_date.getTime(),
      });
    });
  }

  store_full_time_open(event) {
    let index = this.store_setting.store_time.findIndex(
      (x) => x.day == this.curren_selected_day
    );
    this.store_setting.store_time[index].is_store_open_full_time = event;
    if (event) {
      this.is_store_open = event;
      this.store_setting.store_time[index].is_store_open = event;
    }
  }

  store_open(event) {
    let index = this.store_setting.store_time.findIndex(
      (x) => x.day == this.curren_selected_day
    );
    this.store_setting.store_time[index].is_store_open = event;
  }

  open_add_time_modal() {
    this.modalService.open(this.modal);
    this.store_setting.store_open_time = '';
    this.store_setting.store_close_time = '';
    this.store_close_time_error = 0;
    this.store_open_time_error = 0;
  }

  add_store_time() {
    console.log(' this.store_setting :>> ', this.store_setting);
    this.store_time_add = false;
    var open_time = this.store_setting.store_open_time;
    var close_time = this.store_setting.store_close_time;
    this.selected_store_time_array.push({
      store_open_time: `${
        open_time.hour < 10 ? `0${open_time.hour}` : `${open_time.hour}`
      }:${
        open_time.minute < 10 ? `0${open_time.minute}` : `${open_time.minute}`
      }`,
      store_close_time: `${
        close_time.hour < 10 ? `0${close_time.hour}` : `${close_time.hour}`
      }:${
        close_time.minute < 10
          ? `0${close_time.minute}`
          : `${close_time.minute}`
      }`,
    });

    var open_date = new Date(Date.now());
    // open_time = open_time.split(':');
    open_date.setHours(open_time.hour, open_time.minute, 0, 0);

    var close_date = new Date(Date.now());
    // close_time = close_time.split(':');
    close_date.setHours(close_time.hour, close_time.minute, 0, 0);
    this.store_time_millisecond_array.push({
      store_open_time: open_date.getTime(),
      store_close_time: close_date.getTime(),
    });
    this.selected_store_time_array.sort(this.sortStoreTime);
    // this.updateStoreTime();
    this.activeModal.close();
  }

  sortStoreTime(a, b) {
    if (a.store_open_time < b.store_open_time) return -1;
    if (a.store_open_time > b.store_open_time) return 1;
    return 0;
  }

  old_password_update() {
    if (this.store_setting.old_password) {
      this.activeModal.close();
      this.helper.http
        .post('/api/store/verify_password', {
          store_id: this.store_setting.store_id,
          old_password: this.store_setting.old_password,
        })
        .subscribe((res_data: any) => {
          console.log('res_data: ', res_data);
        });
    }
  }

  UpdateSetting(store_data) {
    if (this.store_setting.social_id.length == 0) {
      this.type = 'settingdata';
      this.modalService.open(this.old_password_modal);
    } else {
      this.UpdateSettingData(this.store_setting);
    }
  }

  UpdateSettingData(store_data) {
    // this.helper.json_log(this.store_setting.old_password);
    this.myLoading = true;
    store_data.famous_products_tags = this.store_setting.famous_for;
    store_data.old_password = this.store_setting.old_password;
    store_data.new_password = '';
    this.helper.http.post('/api/store/update', store_data).subscribe(
      (res_data: any) => {
        this.myLoading = false;
        if (res_data.success == false) {
          this.helper.data.storage = {
            code: res_data.error_code,
            message: this.helper.ERROR_CODE[res_data.error_code],
            class: 'alert-danger',
          };
          this.helper.message();
          var store = JSON.parse(localStorage.getItem('store'));

          this.store_setting.is_business = store.is_business;
          this.store_setting.is_store_busy = store.is_store_busy;
          this.store_setting.item_tax = store.item_tax;
          this.store_setting.is_use_item_tax = store.is_use_item_tax;
          this.store_setting.free_delivery_for_above_order_price =
            store.free_delivery_for_above_order_price;
          this.store_setting.free_delivery_within_radius =
            store.free_delivery_within_radius;
          this.store_setting.delivery_time = store.delivery_time;
          this.store_setting.delivery_time_max = store.delivery_time_max;
          this.store_setting.price_rating = store.price_rating;
          this.store_setting.old_password = '';

          this.store_setting.is_order_cancellation_charge_apply =
            store.is_order_cancellation_charge_apply;
          this.store_setting.order_cancellation_charge_for_above_order_price =
            store.order_cancellation_charge_for_above_order_price;
          this.store_setting.order_cancellation_charge_type =
            store.order_cancellation_charge_type;
          this.store_setting.order_cancellation_charge_value =
            store.order_cancellation_charge_value;
          this.store_setting.max_item_quantity_add_by_user =
            store.max_item_quantity_add_by_user;
          this.store_setting.schedule_order_create_after_minute =
            store.schedule_order_create_after_minute;
          this.store_setting.is_provide_delivery_anywhere =
            store.is_provide_delivery_anywhere;
          this.store_setting.delivery_radius = store.delivery_radius;
          this.store_setting.is_taking_schedule_order =
            store.is_taking_schedule_order;
          this.store_setting.is_ask_estimated_time_for_ready_order =
            store.is_ask_estimated_time_for_ready_order;
          this.store_setting.inform_schedule_order_before_min =
            store.inform_schedule_order_before_min;
          this.store_setting.famous_for = store.famous_products_tags;
          this.store_setting.min_order_price = store.min_order_price;
          this.store_setting.is_provide_pickup_delivery =
            store.is_provide_pickup_delivery;

          setTimeout(function () {
            jQuery('.chosen-select').trigger('chosen:updated');
            jQuery('.icheck').iCheck('uncheck');
          }, 400);
          this.store_setting.famous_for.forEach(function (famous) {
            setTimeout(() => {
              jQuery('#icheck' + famous).iCheck('check');
            }, 500);
          });
        } else {
          this.helper.data.storage = {
            message: this.helper.MESSAGE_CODE[res_data.message],
            class: 'alert-info',
          };
          this.helper.message();
          this.store_setting.old_password = '';
          localStorage.setItem('store', JSON.stringify(res_data.store));
        }
      },
      (error: any) => {
        this.myLoading = false;
        this.helper.http_status(error);
      }
    );
  }

  openCartDetailsModal(cart: any) {
    this.cartDetails = cart;
    this.modalService.open(this.order_detail_modal, { size: 'xl' });
  }

  getTotalItemCount(order_details = []) {
    let count = 0;
    order_details.forEach((det) => {
      if (Array.isArray(det.items)) {
        det.items.forEach((item) => {
          count++;
        });
      }
    });
    return count;
  }

  monthlyPaymentDetail() {
    let chart: any;
    chart = c3.generate({
      bindto: '#bar_chart_group',
      data: {
        x: 'x',
        columns: [['x'], ['Other'], ['Wallet'], ['Promo'], ['Cash']],
        type: 'bar',
        groups: [['Other', 'Wallet', 'Promo', 'Cash']],
      },
      legend: {
        position: 'right',
      },
      axis: {
        x: {
          type: 'category', // this needed to load string x value
        },
      },
      grid: {
        y: {
          lines: [{ value: 0 }],
        },
      },
    });
    this.helper.http
      .post('/admin/dashboard/monthly_payment_detail', {
        admin_type: this.admin_detail.admin_type,
        main_store_id: this.admin_detail.store_id,
      })
      .subscribe((res_data: any) => {
        var label = ['x'];
        var other = ['Other'];
        var wallet = ['Wallet'];
        var promo = ['Promo'];
        var cash = ['Cash'];

        res_data.array.forEach((payment_data) => {
          label.push(payment_data._id);
          promo.push(payment_data.promo_payment.toFixed(2));
          wallet.push(payment_data.wallet_payment.toFixed(2));
          other.push(payment_data.other_payment.toFixed(2));
          cash.push(payment_data.cash_payment.toFixed(2));
        });
        chart.load({
          columns: [label, other, wallet, promo, cash],
        });
      });
  }
  sixMonthPaymentDetail() {
    this.helper.http
      .post('/admin/dashboard/last_six_month_payment_detail', {
        admin_type: this.admin_detail.admin_type,
        main_store_id: this.admin_detail.store_id,
      })
      .subscribe((res_data: any) => {
        if (res_data.success) {
          this.pieChartData = [
            res_data.order_detail.total_other_payment.toFixed(2),
            res_data.order_detail.total_cash_payment.toFixed(2),
            res_data.order_detail.total_promo_payment.toFixed(2),
            res_data.order_detail.total_wallet_payment.toFixed(2),
          ];
        }
      });
  }
  sixMonthEarningDetail() {
    this.helper.http
      .post('/admin/dashboard/last_six_month_earning_detail', {
        admin_type: this.admin_detail.admin_type,
        main_store_id: this.admin_detail.store_id,
      })
      .subscribe((res_data: any) => {
        if (res_data.success) {
          let labels: string[] = [];
          res_data.array.forEach((order_data) => {
            labels.push(order_data._id);
            this.lineChartData[0].data.push(order_data.total.toFixed(2));
            this.lineChartData[1].data.push(
              order_data.admin_earning.toFixed(2)
            );
            this.lineChartData[2].data.push(order_data.admin_paid.toFixed(2));
            this.lineChartData[3].data.push(
              order_data.paid_deliveryman.toFixed(2)
            );
            this.lineChartData[4].data.push(order_data.paid_store.toFixed(2));
          });
          this.lineChartLabels = labels;
        }
      });
  }
  countryChart() {
    let country_chart = c3.generate({
      bindto: '#country_chart',
      data: {
        x: 'x',
        columns: [['x']],
      },
      legend: {
        position: 'right',
      },
      axis: {
        x: {
          type: 'category', // this needed to load string x value
        },
      },
    });

    this.helper.http
      .post('/admin/dashboard/country_chart', {
        admin_type: this.admin_detail.admin_type,
        main_store_id: this.admin_detail.store_id,
      })
      .subscribe((res_data: any) => {
        var label = ['x'];
        var array = [];

        res_data.array.forEach((month_data, index) => {
          array[index] = [month_data._id];
          month_data.total.forEach((country_data) => {
            let a = label.findIndex((x) => x == country_data.country_name);
            if (a == -1) {
              label.push(country_data.country_name);
            }
            var country_index = label.indexOf(country_data.country_name);
            array[index][country_index] = country_data.total.toFixed(2);
          });
        });
        array.unshift(label);
        array.forEach((data, index) => {
          if (data.length != 1) {
          } else {
            array[index].length = label.length;
            array[index].fill(0, 1);
          }
        });

        country_chart.load({
          columns: array,
        });
      });
  }
  date_filter() {
    if (this.start_date === '') {
      this.date_error = 1;
    } else if (this.end_date === '') {
      this.date_error = 2;
    } else {
      this.date_error = 0;
      this.order_details();
    }
  }
  checkAdminTyp() {
    let admin_id = localStorage.getItem('admin_id');
    let admin_token = localStorage.getItem('admin_token');
    this.helper.http
      .post('/admin/check_auth', {
        admin_id: admin_id,
        admin_token: admin_token,
      })
      .subscribe((data: any) => {
        if (data.success) {
          this.admin_detail = data.admin;
          this.order_details();
          this.sixMonthEarningDetail();
          this.sixMonthPaymentDetail();
          this.monthlyPaymentDetail();
          this.countryChart();
        } else {
          console.log('data :>> ', data);
        }
      });
  }
  order_details() {
    this.myLoading = true;
    this.helper.http
      .post('/admin/dashboard/order_detail', {
        country_id: this.selected_country,
        start_date: this.start_date,
        end_date: this.end_date,
        admin_type: this.admin_detail.admin_type,
        main_store_id: this.admin_detail.store_id,
      })
      .subscribe((res_data: any) => {
        if (res_data.success) {
          this.order_detail = res_data.order_detail;
          this.order_detail1 = res_data.order_detail1;
          this.list = res_data.list;
        } else {
          this.order_detail = {
            completed_order: 0,
            total_item_sold: 0,
            total_payments: 0,
            promo_payment: 0,
            cash_payment: 0,
            wallet_payment: 0,
            other_payment: 0,
            admin_earning: 0,
            order_payment: 0,
            delivery_payment: 0,
            store_earning: 0,
            provider_earning: 0,
            admin_earn_per: 0,
            store_earn_per: 0,
            provider_earn_per: 0,
            store_payment_pre_earning: 0,
            provider_payment_pre_earning: 0,
            yeep_earning: 0,
          };
          this.order_detail1 = {
            total_orders: 0,
            total_deliveries: 0,
            cancelled_order: 0,
          };

          this.list = res_data.list;
        }

        ////////// for radar chart 1 //////////

        let chart1 = c3.generate({
          bindto: '#a',
          data: {
            columns: [
              ['Admin Earn', this.order_detail.admin_earn_per.toFixed(2)],
            ],
            type: 'gauge',
          },
          legend: {
            show: true,
          },
          gauge: {
            label: {
              show: false, // to turn off the min/max labels.
            },
            width: 30, // for adjusting arc thickness
          },
          color: {
            pattern: ['#1e1e1e'], // the three color levels for the percentage values.
          },
        });
        ////////////////////////

        ////////// for radar chart 2 //////////
        let chart21 = c3.generate({
          bindto: '#b1',
          data: {
            columns: [
              ['Store Earning', this.order_detail.store_earn_per.toFixed(2)],
            ],
            type: 'gauge',
          },
          legend: {
            show: true,
          },
          gauge: {
            label: {
              show: false, // to turn off the min/max labels.
            },
            width: 30, // for adjusting arc thickness
          },
          color: {
            pattern: ['#1e1e1e'],
          },
        });

        let chart22 = c3.generate({
          bindto: '#b2',
          data: {
            columns: [['pre1', this.order_detail.yeep_earning.toFixed(2)]],
            type: 'gauge',
          },
          legend: {
            show: true,
          },
          gauge: {
            label: {
              show: false, // to turn off the min/max labels.
            },
            width: 10, // for adjusting arc thickness
          },
          color: {
            pattern: ['#bc1a2b'], // the three color levels for the percentage values.
          },
          size: {
            height: 100,
          },
        });
        let chartQ1 = c3.generate({
          bindto: '#q1',
          data: {
            columns: [
              ['Store Earning', this.order_detail.store_earn_per.toFixed(2)],
            ],
            type: 'gauge',
          },
          legend: {
            show: false,
          },
          gauge: {
            label: {
              show: false, // to turn off the min/max labels.
            },
            width: 30, // for adjusting arc thickness
          },
          color: {
            pattern: ['#1e1e1e'],
          },
        });
        let chartQ2 = c3.generate({
          bindto: '#q2',
          data: {
            columns: [['pre', this.order_detail.yeep_earning.toFixed(2)]],
            type: 'gauge',
          },
          legend: {
            show: false,
          },
          gauge: {
            label: {
              show: false, // to turn off the min/max labels.
            },
            width: 10, // for adjusting arc thickness
          },
          color: {
            pattern: ['#bc1a2b'], // the three color levels for the percentage values.
          },
          size: {
            height: 100,
          },
        });
        //////////////////////////////

        ////////// for radar chart 3 //////////
        let chart31 = c3.generate({
          bindto: '#c1',
          data: {
            columns: [
              [
                'Provider Earning',
                this.order_detail.provider_earn_per.toFixed(2),
              ],
            ],
            type: 'gauge',
          },
          legend: {
            show: true,
          },
          gauge: {
            label: {
              show: false, // to turn off the min/max labels.
            },
            width: 30, // for adjusting arc thickness
          },
          color: {
            pattern: ['#1e1e1e'], // the three color levels for the percentage values.
          },
        });

        let chart32 = c3.generate({
          bindto: '#c2',
          data: {
            columns: [
              [
                'pre',
                this.order_detail.provider_payment_pre_earning.toFixed(2),
              ],
            ],
            type: 'gauge',
          },
          legend: {
            show: true,
          },
          gauge: {
            label: {
              show: false, // to turn off the min/max labels.
            },
            width: 10, // for adjusting arc thickness
          },
          color: {
            pattern: ['#bc1a2b'],
          },
          size: {
            height: 100,
          },
        });
        //////////////////////

        this.myLoading = false;
      });
  }

  notification_permission() {
    if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(function (permission) {});
    }
  }
  top_user_and_item(type, no_of_record?) {
    var total_record = null;
    if (no_of_record) {
      total_record = no_of_record;
    }
    this.helper.http
      .post('/admin/dashboard/top_user_and_item', {
        type: type,
        no_of_record: total_record,
        start_date: '',
        end_date: '',
      })
      .subscribe((res_data: any) => {
        if (res_data.success) {
          if (type == 'user') {
            this.top_user_list = res_data.data;
            this.no_of_user = null;
          } else {
            this.top_item_list = res_data.data;
            this.no_of_item = null;
          }
        }
      });
  }
  carts = [];
  getCarts() {
    console.log('this.startDate: ', this.startDate);
    console.log('this.endDate: ', this.endDate);
    this.helper.http
      .post('/admin/dashboard/get_carts', {
        start_date: this.startDate,
        end_date: this.endDate,
      })
      .subscribe((res: any) => {
        if (res.status) {
          console.log('res: ', res);
          this.carts = res.carts.map((cart: any) => {
            let totalItemCount = 0;
            let userName = 'NA';
            const totalCartPrice = cart?.total_cart_price;
            const updatedAt = cart?.updated_at;
            const { order_details = [], destination_addresses: adr = [] } =
              cart;
            order_details.forEach((item) => {
              item.items.forEach((i) => {
                totalItemCount++;
              });
            });
            adr.forEach((addr) => {
              userName = addr?.user_details?.name || userName;
            });
            if ((!userName || userName === 'NA') && cart?.user_id?.first_name) {
              userName = `${cart?.user_id?.first_name} ${cart?.user_id?.last_name}`;
            }
            return {
              ...cart,
              userName,
              totalCartPrice,
              totalItemCount,
              updatedAt,
            };
          });
        }
      });
  }
}
