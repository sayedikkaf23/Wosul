import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Helper } from '../../helper';
import jQuery from 'jquery';

@Component({
  selector: 'app-promo_code',
  templateUrl: './promo_code.component.html',
  providers: [Helper],
})
export class PromoCodeComponent implements OnInit {
  promo_code_list: any[];
  title: any;
  button: any;
  heading_title: any;
  ADMIN_DATA_ID: any;
  sort_field: string;
  sort_promo_code: number;
  search_field: string;
  search_value: string;
  page: number;
  total_page: number;
  total_pages: number[];
  promo_id: Object;
  state: Boolean;
  public message: string = '';
  public class: string;
  myLoading: boolean = true;
  max_loyalty_per_order_to_redeem;
  is_amount_per_loyalty_to_redeem;
  is_amount_per_loyalty_to_add_for_order;
  constructor(public helper: Helper, public vcr: ViewContainerRef) {}
  ngAfterViewInit() {
    jQuery('.chosen-select').chosen({ disable_search: true });
    setTimeout(function () {
      jQuery('.chosen-select').trigger('chosen:updated');
    }, 1000);
  }

  ngOnInit() {
    this.helper.message();
    this.sort_field = 'unique_id';
    this.sort_promo_code = -1;
    this.search_field = 'promo_code_name';
    this.search_value = '';
    this.page = 1;
    this.loyaltyPointSettings('GET');
    this.filter(this.page);
    this.title = this.helper.title;
    this.button = this.helper.button;
    this.ADMIN_DATA_ID = this.helper.ADMIN_DATA_ID;
    this.heading_title = this.helper.heading_title;
    this.title = this.helper.title;
    this.promo_code_list = [];
    this.state = true;
    jQuery(document.body)
      .find('#sort_field')
      .on('change', (evnt, res_data) => {
        this.sort_field = res_data.selected;
      });
    jQuery(document.body)
      .find('#sort_promo_code')
      .on('change', (evnt, res_data) => {
        this.sort_promo_code = res_data.selected;
      });
    jQuery(document.body)
      .find('#search_field')
      .on('change', (evnt, res_data) => {
        this.search_field = res_data.selected;
      });
  }

  filter(page) {
    this.page = page;
    this.helper.http
      .post('/admin/promo_code_list', {
        sort_field: this.sort_field,
        sort_promo_code: this.sort_promo_code,
        search_field: this.search_field,
        search_value: this.search_value,
        page: this.page,
      })
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;
          if (res_data.success == false) {
            this.promo_code_list = [];
            this.total_pages = [];
          } else {
            this.promo_code_list = res_data.promo_codes;
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
  loyaltyPointSettings(type) {
    this.myLoading = true;
    let apiData = {
      type: type,
      max_loyalty_per_order_to_redeem: this.max_loyalty_per_order_to_redeem,
      is_amount_per_loyalty_to_redeem: this.is_amount_per_loyalty_to_redeem,
      is_amount_per_loyalty_to_add_for_order:
        this.is_amount_per_loyalty_to_add_for_order,
    };
    this.helper.http
      .post('/admin/update_settings', apiData)
      .subscribe((res_data: any) => {
        if (res_data.success) {
          this.max_loyalty_per_order_to_redeem =
            res_data.data.max_loyalty_per_order_to_redeem;
          this.is_amount_per_loyalty_to_redeem =
            res_data.data.is_amount_per_loyalty_to_redeem;
          this.is_amount_per_loyalty_to_add_for_order =
            res_data.data.is_amount_per_loyalty_to_add_for_order;
          this.myLoading = false;
        } else {
          this.myLoading = false;
        }
      });
  }
  promocode_active_deactive(state, promo_id) {
    this.helper.http
      .post('/admin/promocode_active_deactive', {
        promo_id: promo_id,
        state: state,
      })
      .subscribe((res_data: any) => {
        if (res_data.success == true) {
          this.helper.data.storage = {
            message: this.helper.MESSAGE_CODE[res_data.message],
            class: 'alert-info',
          };

          var index = this.promo_code_list.findIndex((x) => x._id == promo_id);
          this.promo_code_list[index].is_active = state;

          this.helper.router.navigate(['admin/promotions']);
        }
      });
  }
  editPromo(id) {
    this.helper.router_id.admin.promo_id = id;
    this.helper.router.navigate(['admin/promo/edit']);
  }

  viewPromoUses(id) {
    this.helper.router_id.admin.promo_uses_id = id;
    this.helper.router.navigate(['admin/view_promo_uses']);
  }

  activeRoute(routename: string): boolean {
    return this.helper.router.url.indexOf(routename) > -1;
  }
}
