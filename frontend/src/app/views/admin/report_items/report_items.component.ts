import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Helper } from '../../helper';
import jQuery from 'jquery';
import { ReportService } from 'src/app/services/report.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-report-items',
  templateUrl: './report_items.component.html',
  providers: [Helper],
})
export class ReportItemsComponent implements OnInit {
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
  dropdownSettings: IDropdownSettings = {
    singleSelection: true,
    idField: '_id',
    textField: 'name',
    // selectAllText: 'Select All',
    // unSelectAllText: 'UnSelect All',
    itemsShowLimit: 5,
    allowSearchFilter: true,
  };
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
  store_id = { _id: null, name: null };
  store_list = [];
  allReportsData = [];
  is_show_specification: boolean = false;
  columns = [
    {
      label: 'Item Name',
      value: 'name',
    },
    {
      label: 'Store Name',
      value: 'store_name',
    },
    {
      label: 'Description',
      value: 'details',
    },
    {
      label: 'Bar code',
      value: 'unique_id_for_store_data',
    },
    {
      label: 'Price',
      value: 'price',
    },
    {
      label: 'In Stock',
      value: 'is_item_in_stock',
    },
    {
      label: 'Visible In Store',
      value: 'is_visible_in_store',
    },
    {
      label: 'Image',
      value: 'image_url',
    },
  ];

  constructor(
    public helper: Helper,
    public vcr: ViewContainerRef,
    private reportService: ReportService
  ) {}
  ngAfterViewInit() {
    jQuery('.chosen-select').chosen({ disable_search: true });
    setTimeout(function () {
      jQuery('.chosen-select').trigger('chosen:updated');
    }, 1000);
  }

  ngOnInit() {
    this.search_field = 'name';
    this.search_value = '';
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
    this.myLoading = false;

    // this.itemDetail();
    // this.admin_history(1);
    // this.getReports();

    jQuery(document.body)
      .find('#search_field')
      .on('change', (evnt, res_data) => {
        this.search_field = res_data.selected;
      });
    this.getStoreList();
  }

  onItemSelect(item: any) {
    this.store_id = item;
  }

  getStoreList() {
    this.helper.http
      .post('/admin/get_main_store_list', { is_main_store: true })
      .subscribe((res_data: any) => {
        this.store_list = res_data.stores;
      });
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  exportReports() {
    this.myLoading = true;
    this.reportService
      .getReports({
        is_visible_in_store: true,
        store_id: this.store_id?._id,
        type: 'items',
      })
      .subscribe({
        next: (res: any) => {
          this.myLoading = false;
          this.allReportsData = res.data;
          this.item_export_csv();
        },
        error: (err) => {
          this.myLoading = false;
        },
        complete: () => {
          this.myLoading = false;
        },
      });
  }
  activeRoute(routename: string): boolean {
    return this.helper.router.url.indexOf(routename) > -1;
  }

  admin_history(page) {
    this.page = page;
    if (!this.store_id?._id) {
      alert('Select Store First!');
      return;
    }
    this.myLoading = true;
    this.reportService
      .getReports({
        search_field: this.search_field,
        search_value: this.search_value,
        page: this.page,
        store_id: this.store_id?._id,
        type: 'items',
      })
      .subscribe({
        next: (res_data: any) => {
          console.log('res_data: ', res_data);
          this.myLoading = false;
          if (res_data.success) {
            this.items = res_data.data;
          } else {
            this.items = [];
            this.total_pages = [];
          }
        },
        error: (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        },
      });
  }

  itemDetail() {
    this.helper.http
      .post('/admin/report_items', {
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
    const json2csv = require('json2csv').parse;
    var csv = json2csv(this.allReportsData, {
      fields: this.columns,
    });

    var final_csv: any = csv;
    this.helper.downloadFile(final_csv, 'report_items');
  }
}
