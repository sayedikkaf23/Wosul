import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Helper } from '../../helper';
import jQuery from 'jquery';
 

export interface AddDetail {
  country_id: Object;
  city_id: Object;
  store_delivery_id: Object;
  type: number;
}

export interface AddStoreData {
  present_store_id: Object;
  new_store_id: Object;
  api: number;
}

export interface AddProVehicleData {
  provider_id: Object;
}

@Component({
  selector: 'app-add_detail',
  templateUrl: './add_detail.component.html',
  providers: [Helper],
})
export class AddDetailComponent implements OnInit {
  public add_detail: AddDetail;
  private add_store_data: AddStoreData;
  private add_provider_vehicle_data: AddProVehicleData;

  title: any;
  button: any;
  heading_title: any;
  validation_message: any;
  country_list: any[];
  provider_list: any[];
  city_list: any[];
  delivery_list: any[];
  item_list: any[];
  item_ids: any[] = [];
  provider: any;
  store: any;
  user: any;
  user_email: String = '';
  provider_email: String = '';
  store_email: String = '';
  store_list: any[];
  new_store_list: any[];
  myLoading: boolean = true;

  constructor(public helper: Helper, public vcr: ViewContainerRef) {}

  ngAfterViewInit() {
    jQuery('#country').chosen();
    jQuery('#city').chosen();
    jQuery('#store_delivery_id').chosen();
    jQuery('#type').chosen({ disable_search: true });
    jQuery('#present_store_id').chosen();
    jQuery('#new_store_id').chosen();
    jQuery('#api').chosen({ disable_search: true });
    jQuery('#provider_id').chosen();
    jQuery('.chosen-select').trigger('chosen:updated');
  }

  ngOnInit() {
    this.add_detail = {
      country_id: '',
      city_id: '',
      store_delivery_id: '',
      type: null,
    };
    this.add_store_data = {
      present_store_id: '',
      new_store_id: '',
      api: null,
    };

    this.add_provider_vehicle_data = {
      provider_id: '',
    };

    this.helper.http
      .get('api/admin/get_country_list')

      .subscribe((res_data: any) => {
        this.country_list = res_data.countries;
        setTimeout(function () {
          jQuery('.chosen-select').trigger('chosen:updated');
        }, 1000);
      });

    this.helper.http
      .get('admin/get_store_list')

      .subscribe((res_data: any) => {
        // this.store_list = res_data.stores;
        this.store_list = [];

        res_data.stores.forEach((store) => {
          console.log('store.is_master' + store.is_master);

          if (store.is_master) {
            console.log('inside');
            this.store_list.push(store);
          }
        });

        this.new_store_list = res_data.stores;
        setTimeout(function () {
          jQuery('.chosen-select').trigger('chosen:updated');
        }, 1000);
      });

    this.helper.http
      .get('api/admin/get_delivery_list')

      .subscribe((res_data: any) => {
        this.delivery_list = res_data.deliveries;
        setTimeout(function () {
          jQuery('.chosen-select').trigger('chosen:updated');
        }, 1000);
      });

    jQuery(document.body)
      .find('#country')
      .on('change', (evnt, res_data) => {
        this.get_city_list(res_data.selected);
      });

    jQuery(document.body)
      .find('#city')
      .on('change', (evnt, res_data) => {
        this.add_detail.city_id = res_data.selected;
      });

    jQuery(document.body)
      .find('#type')
      .on('change', (evnt, res_data) => {
        this.add_detail.type = res_data.selected;
        console.log(this.add_detail.type);
      });

    this.helper.http
      .get('admin/get_providers')

      .subscribe((res_data: any) => {
        this.provider_list = res_data.providers;
        setTimeout(function () {
          jQuery('#provider_id').trigger('chosen:updated');
        }, 1000);
      });

    jQuery(document.body)
      .find('#provider_id')
      .on('change', (evnt, res_data) => {
        this.add_provider_vehicle_data.provider_id = res_data.selected;
      });

    jQuery(document.body)
      .find('#store_delivery_id')
      .on('change', (evnt, res_data) => {
        this.add_detail.store_delivery_id = res_data.selected;
      });

    jQuery(document.body)
      .find('#new_store_id')
      .on('change', (evnt, res_data) => {
        this.add_store_data.new_store_id = res_data.selected;
      });

    jQuery(document.body)
      .find('#present_store_id')
      .on('change', (evnt, res_data) => {
        this.add_store_data.present_store_id = res_data.selected;
        this.get_store_products();
        this.get_new_store_list();
      });
    jQuery(document.body)
      .find('#api')
      .on('change', (evnt, res_data) => {
        this.add_store_data.api = res_data.selected;
      });

    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
    this.title = this.helper.title;
    this.validation_message = this.helper.validation_message;
  }

  get_new_store_list() {
    this.helper.http
      .get('admin/get_store_list')

      .subscribe((res_data: any) => {
        this.new_store_list = res_data.stores;
      });
    setTimeout(function () {
      jQuery('#new_store_id').trigger('chosen:updated');
    }, 1000);
  }
  get_store_products() {
    this.helper.http
      .post('admin/get_store_items', {
        store_id: this.add_store_data.present_store_id,
      })

      .subscribe((res_data: any) => {
        this.item_list = res_data.items;
      });
  }

  checkbox_change(id) {
    console.log(id);
    var i = this.item_ids.indexOf(id);
    if (i != -1) {
      this.item_ids.splice(i, 1);
    } else {
      this.item_ids.push(id);
    }
    console.log(this.item_ids);
  }

  get_city_list(countryid) {
    this.add_detail.country_id = countryid;
    this.helper.http
      .post('/api/admin/get_city_list', { country_id: countryid })
      .subscribe((res_data: any) => {
        this.city_list = res_data.cities;
      });
    setTimeout(function () {
      jQuery('#city').trigger('chosen:updated');
    }, 1000);
  }

  addstore(add_detail_data) {
    console.log('addstore');

    this.helper.http.post(  '/admin/add_new_store', add_detail_data).subscribe(
      (res_data: any) => {
        this.myLoading = false;

        if (res_data.success == true) {
          this.helper.data.storage = {
            message: this.helper.MESSAGE_CODE[res_data.message],
            class: 'alert-info',
          };

          this.store = res_data.store;
          this.store_email = res_data.store.email;
          this.new_store_list.push(res_data.store);

          this.helper.router.navigate(['admin/add_detail']);
          this.helper.message();
        } else {
          this.helper.data.storage = {
            message: this.helper.ERROR_CODE[res_data.error_code],
            class: 'alert-danger',
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

  add_user(add_detail_data) {
    console.log('add_user');
    this.helper.http.post(  '/admin/add_new_user', add_detail_data).subscribe(
      (res_data: any) => {
        this.myLoading = false;

        if (res_data.success == true) {
          this.helper.data.storage = {
            message: this.helper.MESSAGE_CODE[res_data.message],
            class: 'alert-info',
          };

          this.user = res_data.user;
          this.user_email = res_data.user.email;
          this.helper.router.navigate(['admin/add_detail']);
          this.helper.message();
        } else {
          this.helper.data.storage = {
            message: this.helper.ERROR_CODE[res_data.error_code],
            class: 'alert-danger',
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

  add_provider(add_detail_data) {
    console.log('add_provider');

    this.helper.http.post(  '/admin/add_new_provider', add_detail_data).subscribe(
      (res_data: any) => {
        this.myLoading = false;

        if (res_data.success == true) {
          this.helper.data.storage = {
            message: this.helper.MESSAGE_CODE[res_data.message],
            class: 'alert-info',
          };
          this.provider = res_data.provider;
          this.provider_email = res_data.provider.email;
          this.helper.router.navigate(['admin/add_detail']);
          this.helper.message();

          this.AddProviderVehicleData(res_data.provider._id);
        } else {
          this.helper.data.storage = {
            message: this.helper.ERROR_CODE[res_data.error_code],
            class: 'alert-danger',
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

  AddDetail(add_detail_data) {
    this.myLoading = true;
    if (this.add_detail.type == 2) {
      this.addstore(add_detail_data);
    } else if (this.add_detail.type == 7) {
      this.add_user(add_detail_data);
    } else if (this.add_detail.type == 8) {
      this.myLoading = true;
      this.add_provider(add_detail_data);
    } else {
      this.addstore(add_detail_data);
      this.add_user(add_detail_data);
      this.add_provider(add_detail_data);
    }
  }

  AddStoreData(add_store_data) {
    add_store_data.item_ids = this.item_ids;
    this.myLoading = true;
    this.helper.http.post(  '/updateDatabaseTable', add_store_data).subscribe(
      (res_data: any) => {
        this.myLoading = false;
        if (res_data.success == true) {
          this.helper.data.storage = {
            message: this.helper.MESSAGE_CODE[res_data.message],
            class: 'alert-info',
          };

          this.helper.message();
          setTimeout(() => {
            this.helper.http
              .post('/updateItemNewTable', add_store_data)
              .subscribe(
                (res_data: any) => {
                  this.myLoading = false;
                  if (res_data.success == true) {
                    this.helper.data.storage = {
                      message: this.helper.MESSAGE_CODE[res_data.message],
                      class: 'alert-info',
                    };
                    this.helper.router.navigate(['admin/add_detail']);
                    this.helper.message();
                  } else {
                    this.helper.data.storage = {
                      message: this.helper.ERROR_CODE[res_data.error_code],
                      class: 'alert-danger',
                    };
                    this.helper.message();
                  }
                },
                (error: any) => {
                  this.myLoading = false;
                  this.helper.http_status(error);
                }
              );
          }, 5000);
        } else {
          this.helper.data.storage = {
            message: this.helper.ERROR_CODE[res_data.error_code],
            class: 'alert-danger',
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

  AddProviderVehicleData(providerid) {
    this.myLoading = true;
    this.helper.http
      .post('/admin/add_provider_vehicle_data', { provider_id: providerid })
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;
          if (res_data.success == true) {
            this.helper.data.storage = {
              message: this.helper.MESSAGE_CODE[res_data.message],
              class: 'alert-info',
            };
            this.helper.router.navigate(['admin/add_detail']);
            this.helper.message();
          } else {
            this.helper.data.storage = {
              message: this.helper.ERROR_CODE[res_data.error_code],
              class: 'alert-danger',
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
}
