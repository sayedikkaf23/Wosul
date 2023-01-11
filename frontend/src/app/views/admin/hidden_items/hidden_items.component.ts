import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';

import { Helper } from '../../helper';
import jQuery from 'jquery';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-hidden-items',
  templateUrl: './hidden_items.component.html',
  providers: [Helper],
})
export class HiddenItemsComponent implements OnInit {
  title: any;
  button: any;
  ORDER_STATE: any;
  DATE_FORMAT: any;
  heading_title: any;
  status: any;
  items: any[];
  interval: any;
  search_field: string;
  search_value: string;
  page: number;
  total_page: number;
  total_pages: number[];
  myLoading: boolean = true;

  timezone: string;
  order_detail: any = {};
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
  is_show_specification: boolean = false;

  constructor(public helper: Helper, public vcr: ViewContainerRef) {}
  ngAfterViewInit() {
    jQuery('.chosen-select').chosen({ disable_search: true });
    setTimeout(function () {
      jQuery('.chosen-select').trigger('chosen:updated');
    }, 1000);
  }

  ngOnInit() {
    this.search_field = 'name';
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
    this.items = [];

    this.itemDetail();
    this.admin_history(1);

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

  admin_history(page) {
    this.myLoading = true;
    this.page = page;
    this.helper.http
      .post('/admin/report_hidden_items', {
        search_field: this.search_field,
        search_value: this.search_value,
        page: this.page,
      })
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;
          if (res_data.success == false) {
            this.items = [];
            this.total_pages = [];
          } else {
            this.timezone = res_data.timezone;
            this.items = res_data.items;
            this.total_page = res_data.pages;
            this.total_pages = Array(res_data.pages)
              .fill((x, i) => i)
              .map((x, i) => i + 1);
            for (var i = 0; i < this.items.length; i++) {
              if (!this.items[i].hasOwnProperty('store_detail')) {
                this.items[i]['store_detail'] = { name: '' };
              }
              if (!this.items[i].hasOwnProperty('product_detail')) {
                this.items[i]['product_detail'] = { name: '' };
              }
              if (!this.items[i].hasOwnProperty('category_detail')) {
                this.items[i]['category_detail'] = { name: '' };
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

  itemDetail() {
    this.helper.http
      .post('/admin/report_hidden_items', {
        search_field: this.search_field,
        search_value: this.search_value,
        page: this.page,
      })
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;
          if (res_data.success == false) {
            this.items = [];
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
            this.items = res_data.items;
            for (var i = 0; i < this.items.length; i++) {
              if (!this.items[i].hasOwnProperty('store_detail')) {
                this.items[i]['store_detail'] = { name: '' };
              }
              if (!this.items[i].hasOwnProperty('product_detail')) {
                this.items[i]['product_detail'] = { name: '' };
              }
              if (!this.items[i].hasOwnProperty('category_detail')) {
                this.items[i]['category_detail'] = { name: '' };
              }
            }
          }
        },
        (error: any) => {
          this.helper.http_status(error);
        }
      );
  }

  // item_export_csv
  item_export_csv() {
    this.helper.http
      .post('/admin/report_hidden_items', {
        page: 1,
        search_field: this.search_field,
        search_value: this.search_value,
      })
      .subscribe((res_data: any) => {
        var json2csv = require('json2csv').parse;
        for (var i = 0; i < res_data.items.length; i++) {
          if (!res_data.items[i].hasOwnProperty('store_detail')) {
            res_data.items[i]['store_detail'] = { name: '' };
          }
          if (!res_data.items[i].hasOwnProperty('category_detail')) {
            res_data.items[i]['category_detail'] = { name: '' };
          }
          if (!res_data.items[i].hasOwnProperty('product_detail')) {
            res_data.items[i]['product_detail'] = { name: '' };
          }
        }

        var fieldNames = [
          
          'Item',
          'Store',
          'Category',
          'Sub Category',
          'Quantity',
        ];
        var fields = [
          {
            label : 'Item',
            value : 'name'
          },
          {
            label : 'Store',
            value : 'store_detail.name'
          },
          {
            label : 'Category',
            value : 'category_detail.name'
          },
          {
            label : 'Sub Category',
            value : 'product_detail.name'
          },
          {
            label : 'Quantity',
            value : 'total_quantity'
          },

        ];

        var csv = json2csv(res_data.items,{
          fields: fields,
        });

        var final_csv: any = csv;
        this.helper.downloadFile(final_csv, 'report_hidden_items');
      });
  }
}
