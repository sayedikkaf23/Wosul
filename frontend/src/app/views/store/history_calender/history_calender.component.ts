import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';

import { Helper } from '../../store_helper';
import jQuery from 'jquery';
import { DatePipe } from '@angular/common';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
} from 'date-fns';

import { Subject } from 'rxjs/Subject';
// import {
//   CalendarEvent,
//   DateFormatterParams,
//   CalendarDateFormatter,
// } from 'angular-calendar';
import { CustomDateFormatter } from './custom-date-formatter.provider';

const colors: any = {
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
};

@Component({
  selector: 'app-history_calender',
  templateUrl: './history_calender.component.html',
  providers: [
    Helper,
    // {
    //   provide: CalendarDateFormatter,
    //   useClass: CustomDateFormatter,
    // },
  ],
})
export class HistoryCalenderComponent implements OnInit {
  constructor(public helper: Helper, public vcr: ViewContainerRef) {}
  view: string = 'month';
  viewDate: Date = new Date();
  activeDayIsOpen: boolean = false;
  refresh: Subject<any> = new Subject();

  store_id: Object;
  server_token: String;

  type: number = 1;
  myLoading: boolean = false;
  interval: any;
  order_list: any[] = [];
  delivery_list: any[] = [];
  completed_order_list: any[] = [];
  filtered_order_list: any[] = [];
  events: any[] = [];
  selected_date: any = new Date();
  day_wise_request_list: any[] = [];

  ngOnInit() {
    let token = this.helper.getToken();
    if (!token) {
      this.helper.router.navigate(['store/logout']);
    }
    jQuery('#type').chosen();
    setTimeout(() => {
      jQuery('#type').trigger('chosen:updated');
    });

    this.helper.message();
    var store = JSON.parse(localStorage.getItem('store'));
    if (store !== null) {
      this.store_id = store._id;
      this.server_token = store.server_token;
    }
    jQuery(document.body)
      .find('#type')
      .on('change', (evnt, res_data) => {
        this.type = res_data.selected;
        this.order_filter();
      });
    this.myLoading = true;
    this.get_order_list();
    this.get_delivery_list();
    this.get_completed_order_list();
    // this.interval=setInterval(()=>{
    //     this.get_order_list();
    // },60000);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  get_order_list() {
    this.helper.http
      .post('', { store_id: this.store_id, server_token: this.server_token })
      .subscribe((res_data: any) => {
        this.myLoading = false;
        this.order_list = res_data.order_list;
        this.order_filter();
      });
  }
  get_delivery_list() {
    this.helper.http
      .post('', { store_id: this.store_id, server_token: this.server_token })
      .subscribe((res_data: any) => {
        this.myLoading = false;
        this.delivery_list = res_data.delivery_list;
      });
  }
  get_completed_order_list() {
    this.helper.http
      .post('', { store_id: this.store_id, server_token: this.server_token })
      .subscribe((res_data: any) => {
        this.myLoading = false;
        this.completed_order_list = res_data.completed_order_list;
      });
  }

  order_filter() {
    this.events = [];
    this.filtered_order_list = [];
    if (this.type == 4) {
      this.completed_order_list.forEach((order) => {
        this.filtered_order_list.push(order);
        this.events.push({
          start: startOfDay(new Date(order.created_at)),
          title: order._id,
          color: colors.blue,
        });
      });
    } else if (this.type == 3) {
      this.delivery_list.forEach((order) => {
        this.filtered_order_list.push(order);
        this.events.push({
          start: startOfDay(new Date(order.created_at)),
          title: order._id,
          color: colors.blue,
        });
      });
    } else {
      this.order_list.forEach((order) => {
        if (this.type == 1 && order.order_status == 1) {
          this.filtered_order_list.push(order);
          this.events.push({
            start: startOfDay(new Date(order.created_at)),
            title: order._id,
            color: colors.blue,
          });
        } else {
          this.filtered_order_list.push(order);
          this.events.push({
            start: startOfDay(new Date(order.created_at)),
            title: order._id,
            color: colors.blue,
          });
        }
      });
    }
    this.set_selected_date_request();
    this.refresh.next();
  }

  dayClicked(day) {
    this.selected_date = new Date(day.date);
    this.set_selected_date_request();
  }

  set_selected_date_request() {
    this.day_wise_request_list = [];
    this.filtered_order_list.forEach((request) => {
      let request_date;
      if (this.type == 1 || this.type == 2) {
        request_date = new Date(request.created_at);
      } else if (this.type == 3 || this.type == 4) {
        request_date = new Date(request.request_time);
      }

      if (
        this.selected_date.getFullYear() == request_date.getFullYear() &&
        this.selected_date.getMonth() == request_date.getMonth() &&
        this.selected_date.getDate() == request_date.getDate()
      ) {
        this.day_wise_request_list.push(request);
      }
    });
  }
}
