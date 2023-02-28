import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ToastrService } from 'ngx-toastr';

import { Helper } from 'src/app/views/helper';
import jQuery from 'jquery';
import { AuthService } from 'src/app/services/auth.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-admin-store-list',
  templateUrl: './admin-store-list.component.html',
  styleUrls: ['./admin-store-list.component.css'],
  //encapsulation: ViewEncapsulation.None,
})
export class AdminStoreListComponent implements OnInit {
  @Input() store_list: any = [];
  @Input() total_pages: number[];
  @Input() total_page: number;

  document_full_image: any;
  dropdownList = [];
  selectedItems = [];
  dropdownSettings: IDropdownSettings;
  selected_document_index: number;
  //store_list: any;
  title: any;
  image_error;
  button: any;
  heading_title: any;
  tags: any = '';
  sort_field: string;
  sort_store: number;
  search_field: string;
  search_value: string;
  page: number;

  // total_page: number;
  // total_pages: number[];

  store_page_type: number;
  store_id: Object;
  type: any;
  wallet: number;
  content: string;
  public message: string = '';
  public class: string;
  myLoading: boolean = true;
  deleted_image_url: any[] = [];
  store_detail: any = {};
  is_edit: boolean = false;
  formData = new FormData();
  selected_tab: number = 1;
  number_of_rec: number = 10;
  document_list: any[] = [];
  edit_document: any[] = [];
  old_image_url: string = '';
  error_message: number = 0;
  private documentlist: Document;
  referral_history: any[] = [];
  review_list: any[] = [];
  bank_detail_list: any[] = [];
  new_image_array: any[] = [];
  image_setting: any;

  constructor(
    public helper: Helper,
    public vcr: ViewContainerRef,
    private storeService: StoreService,
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

  ngOnInit() {
    const bodyElement = document.body;
    bodyElement.classList.remove('add-order-page');

    this.authService.isHeaderShow = true;
    this.store_page_type = 1;
    this.sort_field = 'unique_id';
    this.sort_store = -1;
    this.search_field = 'name';
    this.search_value = '';
    this.page = 1;
    this.helper.message();
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
    this.title = this.helper.title;

    if (this.store_list?.length) {
      this.get_store_detail(this.store_list[0]?._id);
    }
  }

  get_store_detail(id) {
    this.selected_tab = 1;
    let index = this.store_list.findIndex((store) => store._id == id);
    this.store_detail = JSON.parse(JSON.stringify(this.store_list[index]));
    localStorage.setItem('store', JSON.stringify(this.store_detail));
    this.selectedItems = this.store_detail.sub_stores;
    if (!this.store_detail.is_store_can_add_provider) {
      this.store_detail.is_store_can_add_provider = false;
    }
    if (!this.store_detail.is_store_can_complete_order) {
      this.store_detail.is_store_can_complete_order = false;
    }
  }

  filter(page) {
    this.page = page;
    this.storeService
      .storeListSearchSort({
        sort_field: this.sort_field,
        sort_store: this.sort_store,
        store_page_type: this.store_page_type,
        number_of_rec: this.number_of_rec,
        search_field: this.search_field,
        search_value: this.search_value,
        page: this.page,
      })
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;
          if (res_data.success == false) {
            this.store_list = [];
            this.total_pages = [];
            this.store_detail = {};
          } else {
            this.store_list = res_data.stores;
            this.total_page = res_data.pages;
            this.total_pages = Array(res_data.pages)
              .fill((x, i) => i)
              .map((x, i) => i + 1);
            if (this.store_list.length > 0) {
              this.get_store_detail(this.store_list[0]._id);
            } else {
              this.store_detail = {};
            }
          }
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
  }

  store_export_csv(store_page_type) {
    this.storeService
      .storeListSearchSort({
        sort_field: this.sort_field,
        sort_store: this.sort_store,
        store_page_type: this.store_page_type,
        search_field: this.search_field,
        search_value: this.search_value,
      })
      .subscribe((res_data: any) => {
        var json2csv = require('json2csv').parse;
        res_data.stores.forEach((store, index) => {
          store.city_name = store.city_details.city_name;
          store.delivery_name = store.delivery_details.delivery_name;
        });

        var fieldNames = [
          'Unique ID',
          'First Name',
          'Last Name',
          'City',
          'Delivery',
          'Device Type',
          'Referral Code',
          'Email',
          'Country Phone Code',
          'Phone',
          'App Version',
          'Wallet',
          'Wallet Currency Code',
          'Address',
          'Approved',
          'Business',
          'Email Verify',
          'Phone Number Verify',
          'Document Uploaded',
          'Location',
        ];
        var fields = [
          'unique_id',
          'name',
          'city_name',
          'delivery_name',
          'device_type',
          'referral_code',
          'email',
          'country_phone_code',
          'phone',
          'app_version',
          'wallet',
          'wallet_currency_code',
          'address',
          'is_approved',
          'is_business',
          'is_email_verified',
          'is_phone_number_verified',
          'is_document_uploaded',
          'location',
        ];

        var csv = json2csv(res_data.stores, {
          fields: fields,
          fieldNames: fieldNames,
        });

        var final_csv: any = csv;
        this.helper.downloadFile(final_csv);
      });
  }

  ngOnDestroy() {
    this.authService.isHeaderShow = false;
  }
}
