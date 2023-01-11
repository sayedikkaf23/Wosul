import { Component, OnInit, ViewContainerRef } from '@angular/core';

import { Helper } from '../../franchise_helper';
import jQuery from 'jquery';

@Component({
  selector: 'app-store_item',
  templateUrl: './store_item.component.html',
  providers: [Helper],
})
export class FranchiseStoreItemComponent implements OnInit {
  title: any;
  button: any;
  heading_title: any;
  public message: string = '';
  public class: string;
  product_list: any[];
  filtered_product_list: any[] = [];
  franchise_id: string;
  store_id: string;
  server_token: string;
  currency: any;
  selected_product: string;
  filter_product_name: String = '';

  myLoading: boolean = true;

  constructor(public helper: Helper, public vcr: ViewContainerRef) {}

  ngAfterViewInit() {
    jQuery('.chosen-select').chosen();
    // setTimeout(function() {
    //     jQuery(".chosen-select").trigger("chosen:updated");
    // }, 1000);
  }

  activeRoute(routename: string): boolean {
    return this.helper.router.url.indexOf(routename) > -1;
  }

  ngOnInit() {
    let token = this.helper.getToken();

    if (!token) {
      this.helper.router.navigate(['franchise/logout']);
    }
    this.helper.message();

    var franchise = JSON.parse(localStorage.getItem('franchise'));
    if (franchise !== null) {
      this.franchise_id = franchise._id;
      this.server_token = franchise.server_token;
    }
    this.store_id = this.helper.router_id.franchise.item_store_id;
    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
    this.selected_product = this.title.all;

    jQuery(document.body)
      .find('#selected_product')
      .on('change', (evnt, res_data) => {
        this.selected_product = res_data.selected;
      });

    this.helper.http
      .post(this.helper.POST_METHOD.GET_FOR_STORE_PRODUCT_ITEM_LIST, {
        store_id: this.store_id,
        franchise_id: this.franchise_id,
        server_token: this.server_token,
      })
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;

          if (res_data.success == false) {
            this.helper.data.storage = {
              message: this.helper.ERROR_CODE[res_data.error_code],
              class: 'alert-danger',
            };

            this.product_list = [];
            this.filtered_product_list = [];
            this.helper.message();
          } else {
            this.currency = res_data.currency;
            this.product_list = res_data.products;
            this.filtered_product_list = res_data.products;
            setTimeout(function () {
              jQuery('.chosen-select').trigger('chosen:updated');
            }, 1000);
          }
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );

    jQuery('#loop').click();

    jQuery(window).resize(function () {
      if (jQuery(window).width() > 992 && jQuery(window).width() < 1300) {
        jQuery('.div1').removeClass('col-md-4');
        jQuery('.div2').removeClass('col-md-8');
        jQuery('.div1').addClass('col-md-12');
        jQuery('.div2').addClass('col-md-12');
      } else {
        jQuery('.div1').removeClass('col-md-12');
        jQuery('.div2').removeClass('col-md-12');
        jQuery('.div1').addClass('col-md-4');
        jQuery('.div2').addClass('col-md-8');
      }

      if (
        (jQuery(window).width() > 772 && jQuery(window).width() < 935) ||
        jQuery(window).width() < 365
      ) {
        jQuery('.div1').removeClass('col-xs-4');
        jQuery('.div2').removeClass('col-xs-8');
        jQuery('.div1').addClass('col-xs-12');
        jQuery('.div2').addClass('col-xs-12');
      } else {
        jQuery('.div1').removeClass('col-xs-12');
        jQuery('.div2').removeClass('col-xs-12');
        jQuery('.div1').addClass('col-xs-4');
        jQuery('.div2').addClass('col-xs-8');
      }
    });

    setTimeout(function () {
      if (jQuery(window).width() > 992 && jQuery(window).width() < 1300) {
        jQuery('.div1').removeClass('col-md-4');
        jQuery('.div2').removeClass('col-md-8');
        jQuery('.div1').addClass('col-md-12');
        jQuery('.div2').addClass('col-md-12');
      } else {
        jQuery('.div1').removeClass('col-md-12');
        jQuery('.div2').removeClass('col-md-12');
        jQuery('.div1').addClass('col-md-4');
        jQuery('.div2').addClass('col-md-8');
      }

      if (
        (jQuery(window).width() > 772 && jQuery(window).width() < 935) ||
        jQuery(window).width() < 365
      ) {
        jQuery('.div1').removeClass('col-xs-4');
        jQuery('.div2').removeClass('col-xs-8');
        jQuery('.div1').addClass('col-xs-12');
        jQuery('.div2').addClass('col-xs-12');
      } else {
        jQuery('.div1').removeClass('col-xs-12');
        jQuery('.div2').removeClass('col-xs-12');
        jQuery('.div1').addClass('col-xs-4');
        jQuery('.div2').addClass('col-xs-8');
      }
    }, 500);
  }
  editItem(id, event) {
    if (event.target.attributes.class != undefined) {
      var value = event.target.attributes.class.value;
      value = value.split(' ');
      if (value[0] !== 'switch') {
        this.helper.router_id.store.item_id = id;
        this.helper.router.navigate(['store/item/edit']);
      }
    } else if (event.target.tagName !== 'SMALL') {
      this.helper.router_id.store.item_id = id;
      this.helper.router.navigate(['store/item/edit']);
    }
  }

  filter_product(data) {
    data = data.replace(/^\s+|\s+$/g, '');
    data = data.replace(/ +(?= )/g, '');
    data = new RegExp(data, 'gi');

    var product_array = [];
    this.product_list.forEach((product) => {
      var item_array = product.items.filter((item_data) => {
        var a = item_data.name.match(data);
        return a !== null;
      });
      if (item_array.length > 0) {
        product_array.push({
          _id: product._id,
          name: product.name,
          store_id: product.store_id,
          unique_id: product.unique_id,
          is_visible_in_store: product.is_visible_in_store,
          items: item_array,
        });
      }
    });
    this.filtered_product_list = product_array;
  }

  onChange(id, event) {
    this.helper.http
      .post(this.helper.POST_METHOD.IS_ITEM_IN_STOCK, {
        item_id: id,
        is_item_in_stock: event,
      })
      .subscribe(
        (res_data: any) => {
          if (res_data.success == false) {
          }
        },
        (error: any) => {
          this.helper.http_status(error);
        }
      );
  }
}
