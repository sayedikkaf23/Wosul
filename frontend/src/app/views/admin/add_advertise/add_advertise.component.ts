import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { Helper } from '../../helper';
import jQuery from 'jquery';
import { ImageCropperComponent, CropperSettings } from 'ngx-img-cropper';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

export interface AddAdvertise {
  city_id: Object;
  country_id: Object;
  //city_unique_id: Number,
  //country_unique_id: Number,
  ads_type: Number;
  ads_for: Number;
  is_ads_visible: Boolean;
  is_ads_approve_by_admin: Boolean;
  is_ads_have_expiry_date: Boolean;
  expiry_date: any;
  is_ads_redirect_to_store: Boolean;
  store_id: any;
  //image_for_banner: any,
  //image_for_fullscreen: any,
  image_url: any;
  country_name: String;
  city_name: String;
  store_email: String;
  ads_detail: String;
  in_app_notification: Boolean;
  store_delivery_id: String;
}
export interface imageSetting {
  image_ratio: number;
  image_ratio_full: number;

  image_min_width_full: number;
  image_max_width_full: number;
  image_min_height_full: number;
  image_max_height_full: number;

  image_min_width: number;
  image_max_width: number;
  image_min_height: number;
  image_max_height: number;
  image_type: any[];
}

@Component({
  selector: 'app-add_advertise',
  templateUrl: './add_advertise.component.html',
  providers: [Helper],
})
export class AddAdvertiseComponent implements OnInit {
  @ViewChild('image_crop_modal')
  image_crop_modal: any;
  @ViewChild('cropper', undefined)
  cropper: ImageCropperComponent;

  @ViewChild('image_crop_modal_full')
  image_crop_modal_full: any;
  @ViewChild('cropper_full', undefined)
  cropper_full: ImageCropperComponent;

  private add_advertise: AddAdvertise;
  public image_setting: imageSetting;
  title: any;
  button: any;
  heading_title: any;
  validation_message: any;
  type: String;
  country_list: any[];
  city_list: any[];
  store_list: any[];
  delivery_list: any[];
  advertise_id: Object;
  advertise_exist: any;
  error: any;
  advertise_list: any[];
  myLoading: boolean = false;
  image_error: string = '';
  //image_note: string = '';
  //image_note_ratio: string = '';

  data: any;
  data_full: any;
  cropperSettings: CropperSettings;
  cropperSettingsFull: CropperSettings;
  web_image = false;
  full_image = false;

  constructor(
    public helper: Helper,
    vcr: ViewContainerRef,
    private modalService: NgbModal,
    private activeModal: NgbActiveModal
  ) {
    this.cropperSettings = new CropperSettings();
    this.cropperSettings.canvasWidth = 400;
    this.cropperSettings.canvasHeight = 400;
    this.cropperSettings.noFileInput = true;
    this.cropperSettings.preserveSize = true;
    this.cropperSettings.height = 200;
    this.cropperSettings.width =
      this.cropperSettings.height * this.helper.image_ratio.ADS_BANNER_IMAGE;

    this.data = {};

    this.cropperSettingsFull = new CropperSettings();
    this.cropperSettingsFull.canvasWidth = 400;
    this.cropperSettingsFull.canvasHeight = 400;
    this.cropperSettingsFull.noFileInput = true;
    this.cropperSettingsFull.preserveSize = true;
    this.cropperSettingsFull.height = 200;
    this.cropperSettingsFull.width =
      this.cropperSettingsFull.height * this.helper.image_ratio.ADS_FULL_IMAGE;

    this.data_full = {};
  }

  ngAfterViewInit() {
    jQuery('#country').chosen();
    jQuery('#city').chosen();
    jQuery('#store').chosen();
    jQuery('#delivery').chosen();
    jQuery('#ads_type').chosen({ disable_search: true });
    jQuery('#ads_for').chosen({ disable_search: true });
    setTimeout(function () {
      jQuery('.chosen-select').trigger('chosen:updated');
    }, 1000);
  }
  ngOnDestroy() {
    this.helper.router_id.admin.advertise_id = '';
  }

  ngOnInit() {
    this.add_advertise = {
      city_id: '',
      country_id: '',
      country_name: '',
      city_name: '',
      store_email: '',
      //city_unique_id: null,
      //country_unique_id: null,
      ads_type: 1,
      ads_for: null,
      is_ads_visible: false,
      is_ads_approve_by_admin: false,
      is_ads_have_expiry_date: true,
      in_app_notification: false,
      expiry_date: null,
      is_ads_redirect_to_store: true,
      store_id: '',
      ads_detail: '',
      //image_for_banner: "./plus_box.png",
      //image_for_fullscreen: "./plus_box.png",
      image_url: './plus_box.png',
      store_delivery_id: '',
    };

    this.image_setting = {
      image_ratio: 1,
      image_ratio_full: 1,
      image_min_width: 100,
      image_max_width: 100,
      image_min_height: 100,
      image_max_height: 100,
      image_min_width_full: 100,
      image_max_width_full: 100,
      image_min_height_full: 100,
      image_max_height_full: 100,
      image_type: [],
    };

    this.advertise_id = this.helper.router_id.admin.advertise_id;

    this.helper.http
      .get('/admin/get_server_country_list')
      .subscribe((res_data: any) => {
        this.country_list = res_data.countries;
      });
    jQuery(document.body)
      .find('#country')
      .on('change', (evnt, res_data) => {
        this.get_city_list(res_data.selected);
        this.get_store_list(res_data.selected);
        this.get_delivery_list();
      });

    jQuery(document.body)
      .find('#city')
      .on('change', (evnt, res_data) => {
        this.add_advertise.city_id = res_data.selected;
        this.get_store_list_for_city(res_data.selected);
      });

    jQuery(document.body)
      .find('#ads_type')
      .on('change', (evnt, res_data) => {
        this.add_advertise.ads_type = res_data.selected;
        this.get_image_setting_detail(res_data.selected);
      });

    jQuery(document.body)
      .find('#ads_for')
      .on('change', (evnt, res_data) => {
        this.add_advertise.ads_for = res_data.selected;
      });

    jQuery(document.body)
      .find('#store')
      .on('change', (evnt, res_data) => {
        console.log('res_data.selected :>> ', res_data.selected);
        this.add_advertise.store_id = res_data.selected;
      });
    jQuery(document.body)
      .find('#delivery')
      .on('change', (evnt, res_data) => {
        console.log('res_data.selected :>> ', res_data.selected);
        this.add_advertise.store_delivery_id = res_data.selected;
      });
    this.helper.http.post('/api/admin/get_image_setting', {}).subscribe(
      (res_data: any) => {
        this.image_setting.image_ratio =
          res_data.image_setting.ads_banner_image_ratio;
        this.image_setting.image_min_width =
          res_data.image_setting.ads_banner_image_min_width;
        this.image_setting.image_max_width =
          res_data.image_setting.ads_banner_image_max_width;
        this.image_setting.image_min_height =
          res_data.image_setting.ads_banner_image_min_height;
        this.image_setting.image_max_height =
          res_data.image_setting.ads_banner_image_max_height;
        this.image_setting.image_type = res_data.image_setting.image_type;

        this.image_setting.image_ratio_full =
          res_data.image_setting.ads_fullscreen_image_ratio;
        this.image_setting.image_min_width_full =
          res_data.image_setting.ads_fullscreen_image_min_width;
        this.image_setting.image_max_width_full =
          res_data.image_setting.ads_fullscreen_image_max_width;
        this.image_setting.image_min_height_full =
          res_data.image_setting.ads_fullscreen_image_min_height;
        this.image_setting.image_max_height_full =
          res_data.image_setting.ads_fullscreen_image_max_height;
        this.image_setting.image_type = res_data.image_setting.image_type;

        setTimeout(() => {
          this.cropperSettings.width =
            this.cropperSettings.height *
            res_data.image_setting.ads_banner_image_ratio;
          this.cropperSettingsFull.width =
            this.cropperSettingsFull.height *
            res_data.image_setting.ads_fullscreen_image_ratio;
        }, 1000);

        //this.image_note = "Upload image size within width x height (min " + this.image_setting.image_min_width + "x" + this.image_setting.image_min_height + " and max " + this.image_setting.image_max_width + "x" + this.image_setting.image_max_height + ")"

        //this.image_note_ratio = "Image ratio should be "+ this.image_setting.image_ratio + " and upload only " + this.image_setting.image_type + " file"
      },
      (error: any) => {
        this.myLoading = false;
        this.helper.http_status(error);
      }
    );

    if (this.advertise_id == '') {
      this.type = 'add';
      this.helper.http.get('/admin/advertise_list').subscribe(
        (res: any) => (this.advertise_list = res),
        (error) => (this.error = error)
      );

      this.advertise_exist = '';
    } else {
      jQuery('.add').hide();
      this.type = 'edit';
      this.helper.http
        .post('/admin/get_advertise_detail', {
          advertise_id: this.advertise_id,
        })
        .subscribe((res_data: any) => {
          if (res_data.success == false) {
            this.helper.router.navigate(['admin/advertise']);
          } else {
            this.add_advertise.city_id = res_data.advertise.city_id;
            this.add_advertise.country_id = res_data.advertise.country_id;
            this.get_store_list_for_city(this.add_advertise.city_id);
            this.get_delivery_list();
            this.add_advertise.country_name =
              res_data.advertise.country_details.country_name;
            if (res_data.advertise.city_details.length > 0) {
              this.add_advertise.city_name =
                res_data.advertise.city_details[0].city_name;
            } else {
              this.add_advertise.city_name = 'All';
            }
            this.add_advertise.ads_type = res_data.advertise.ads_type;
            this.add_advertise.ads_for = res_data.advertise.ads_for;

            this.add_advertise.store_id = res_data.advertise.store_id;
            this.add_advertise.store_delivery_id =
              res_data.advertise.store_delivery_id;
            this.add_advertise.ads_detail = res_data.advertise.ads_detail;
            this.add_advertise.in_app_notification =
              res_data.advertise.in_app_notification;

            this.add_advertise.is_ads_visible =
              res_data.advertise.is_ads_visible;
            this.add_advertise.is_ads_approve_by_admin =
              res_data.advertise.is_ads_approve_by_admin;

            this.add_advertise.is_ads_have_expiry_date =
              res_data.advertise.is_ads_have_expiry_date;

            if (res_data.advertise.expiry_date != null) {
              var date = new Date(res_data.advertise.expiry_date);
              this.add_advertise.expiry_date = {
                date: {
                  year: date.getFullYear(),
                  month: date.getMonth() + 1,
                  day: date.getDate(),
                },
                formatted:
                  date.getMonth() +
                  1 +
                  '-' +
                  date.getDate() +
                  '-' +
                  date.getFullYear(),
              };
            }

            this.add_advertise.is_ads_redirect_to_store =
              res_data.advertise.is_ads_redirect_to_store;

            if (res_data.advertise.store_details.length > 0) {
              this.add_advertise.store_email =
                res_data.advertise.store_details[0].email;
            }

            this.add_advertise.image_url = res_data.advertise.image_url;
          }
        });
    }

    //this.image_note = "";
    //this.image_note_ratio = "";
    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
    this.validation_message = this.helper.validation_message;
    this.myLoading = false;
  }

  get_city_list(countryid) {
    this.myLoading = true;
    this.add_advertise.country_id = countryid;
    this.helper.http
      .post('/api/admin/get_city_list', { country_id: countryid })
      .subscribe((res_data: any) => {
        this.city_list = res_data.cities;
        this.myLoading = false;
      });
    setTimeout(function () {
      jQuery('#city').trigger('chosen:updated');
    }, 1000);
  }
  get_store_list(countryid) {
    this.myLoading = true;
    this.add_advertise.country_id = countryid;
    this.helper.http
      .post('/admin/get_store_list_for_country', { country_id: countryid })
      .subscribe((res_data: any) => {
        console.log('res_data.stores_all :>> ');
        this.store_list = res_data.stores_all;
        setTimeout(() => {
          jQuery('#store').trigger('chosen:updated');
        }, 1000);
        this.myLoading = false;
      });
    // setTimeout(function () {
    // }, 1000);
  }
  get_delivery_list() {
    this.helper.http.get('/admin/delivery_list').subscribe((res_data: any) => {
      if (res_data.success) {
        this.delivery_list = res_data.deliveries;
        setTimeout(function () {
          jQuery('#delivery').trigger('chosen:updated');
        }, 1000);
      }
    });
  }

  get_store_list_for_city(city_id) {
    this.myLoading = true;
    this.add_advertise.city_id = city_id;
    this.helper.http
      .post('/admin/get_store_list_for_city', { city_id: city_id })
      .subscribe((res_data: any) => {
        this.store_list = res_data.stores;
        setTimeout(function () {
          jQuery('#store').trigger('chosen:updated');
        }, 1000);
        this.myLoading = false;
      });
  }

  get_image_setting_detail(ads_type) {
    this.add_advertise.ads_type = ads_type;
    this.helper.http.post('/api/admin/get_image_setting', {}).subscribe(
      (res_data: any) => {
        if (this.add_advertise.ads_type == 1) {
          this.image_setting.image_ratio =
            res_data.image_setting.ads_banner_image_ratio;
          this.image_setting.image_min_width =
            res_data.image_setting.ads_banner_image_min_width;
          this.image_setting.image_max_width =
            res_data.image_setting.ads_banner_image_max_width;
          this.image_setting.image_min_height =
            res_data.image_setting.ads_banner_image_min_height;
          this.image_setting.image_max_height =
            res_data.image_setting.ads_banner_image_max_height;
          this.image_setting.image_type = res_data.image_setting.image_type;

          setTimeout(() => {
            this.cropperSettings.width =
              this.cropperSettings.height *
              res_data.image_setting.delivery_image_ratio;
          }, 1000);
          //this.image_note = "Upload image size within width x height (min " + this.image_setting.image_min_width + "x" + this.image_setting.image_min_height + " and max " + this.image_setting.image_max_width + "x" + this.image_setting.image_max_height + ")"

          //this.image_note_ratio = "Image ratio should be "+ this.image_setting.image_ratio + " and upload only " + this.image_setting.image_type + " file"
        } else if (this.add_advertise.ads_type == 2) {
          this.image_setting.image_ratio_full =
            res_data.image_setting.ads_fullscreen_image_ratio;
          this.image_setting.image_min_width_full =
            res_data.image_setting.ads_fullscreen_image_min_width;
          this.image_setting.image_max_width_full =
            res_data.image_setting.ads_fullscreen_image_max_width;
          this.image_setting.image_min_height_full =
            res_data.image_setting.ads_fullscreen_image_min_height;
          this.image_setting.image_max_height_full =
            res_data.image_setting.ads_fullscreen_image_max_height;
          this.image_setting.image_type = res_data.image_setting.image_type;

          setTimeout(() => {
            this.cropperSettingsFull.width =
              this.cropperSettingsFull.height *
              res_data.image_setting.ads_fullscreen_image_ratio;
          }, 1000);

          //this.image_note = "Upload image size within width x height (min " + this.image_setting.image_min_width + "x" + this.image_setting.image_min_height + " and max " + this.image_setting.image_max_width + "x" + this.image_setting.image_max_height + ")"

          //this.image_note_ratio = "Image ratio should be "+ this.image_setting.image_ratio + " and upload only " + this.image_setting.image_type + " file"
        }
      },
      (error: any) => {
        this.myLoading = false;
        this.helper.http_status(error);
      }
    );
  }

  public formData = new FormData();

  web_image_update($event) {
    this.web_image = true;
    this.image_error = '';
    const files = $event.target.files || $event.srcElement.files;
    const image_url = files[0];
    var index = this.image_setting.image_type.indexOf(image_url.type);
    if (index !== -1) {
      var reader = new FileReader();
      reader.onload = (e: any) => {
        var new_image = new Image();
        new_image.src = e.target.result;
        // this.cropper.setImage(new_image);
        this.add_advertise.image_url = e.target.result;
        this.formData.set('image_url', image_url);
        // new_image.onload = () => {
        //     if (new_image.width >= this.image_setting.image_min_width && new_image.width <= this.image_setting.image_max_width &&
        //         new_image.height >= this.image_setting.image_min_height && new_image.height <= this.image_setting.image_max_height) {

        //         if (new_image.width == (new_image.height * this.image_setting.image_ratio)) {
        //             this.add_advertise.image_url = e.target.result;
        //             this.formData.set('image_url', image_url)
        //         } else {
        //             this.image_crop_modal.open();
        //             this.image_error = this.title.ads_image_ratio_error;
        //         }
        //     } else {
        //         this.image_error = this.title.ads_image_size_error;
        //         this.image_crop_modal.open();
        //     }
        // }
      };
      reader.readAsDataURL(image_url);
    } else {
      jQuery('#remove').click();
      this.image_error = this.title.ads_image_extension_error;
    }
  }

  crop($event) {
    this.image_error = '';
    function dataURLtoFile(dataurl, filename) {
      var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    }
    let image_type = this.image_setting.image_type;
    image_type = image_type[0].split('/');
    var image_url = dataURLtoFile(
      this.cropper.image.image,
      'image.' + image_type[0]
    );

    var reader = new FileReader();
    reader.onload = (e: any) => {
      var new_image = new Image();
      new_image.src = e.target.result;

      new_image.onload = () => {
        if (
          new_image.width >= this.image_setting.image_min_width &&
          new_image.width <= this.image_setting.image_max_width &&
          new_image.height >= this.image_setting.image_min_height &&
          new_image.height <= this.image_setting.image_max_height
        ) {
          this.add_advertise.image_url = e.target.result;
          this.formData.set('image_url', image_url);
          this.activeModal.close();
        } else {
          this.image_error = this.title.ads_image_size_error;
        }
      };
    };
    reader.readAsDataURL(image_url);
  }

  full_image_update($event) {
    this.full_image = true;
    this.image_error = '';
    const files = $event.target.files || $event.srcElement.files;
    const image_url = files[0];
    var index = this.image_setting.image_type.indexOf(image_url.type);
    if (index !== -1) {
      var reader = new FileReader();
      reader.onload = (e: any) => {
        var new_image = new Image();
        new_image.src = e.target.result;
        this.cropper_full.setImage(new_image);
        new_image.onload = () => {
          if (
            new_image.width >= this.image_setting.image_min_width_full &&
            new_image.width <= this.image_setting.image_max_width_full &&
            new_image.height >= this.image_setting.image_min_height_full &&
            new_image.height <= this.image_setting.image_max_height_full
          ) {
            if (
              new_image.width ==
              new_image.height * this.image_setting.image_ratio_full
            ) {
              this.add_advertise.image_url = e.target.result;
              this.formData.set('image_url', image_url);
            } else {
              this.modalService.open(this.image_crop_modal_full);
              this.image_error = this.title.ads_image_ratio_error;
            }
          } else {
            this.image_error = this.title.ads_image_size_error;
            this.modalService.open(this.image_crop_modal_full);
          }
        };
      };
      reader.readAsDataURL(image_url);
    } else {
      jQuery('#remove').click();
      this.image_error = this.title.ads_image_extension_error;
    }
  }

  cropFull($event) {
    this.image_error = '';
    function dataURLtoFile(dataurl, filename) {
      var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    }
    let image_type = this.image_setting.image_type;
    image_type = image_type[0].split('/');
    var image_url = dataURLtoFile(
      this.cropper_full.image.image,
      'image.' + image_type[0]
    );

    var reader = new FileReader();
    reader.onload = (e: any) => {
      var new_image = new Image();
      new_image.src = e.target.result;

      new_image.onload = () => {
        if (
          new_image.width >= this.image_setting.image_min_width_full &&
          new_image.width <= this.image_setting.image_max_width_full &&
          new_image.height >= this.image_setting.image_min_height_full &&
          new_image.height <= this.image_setting.image_max_height_full
        ) {
          this.add_advertise.image_url = e.target.result;
          this.formData.set('image_url', image_url);
          this.activeModal.close();
        } else {
          this.image_error = this.title.ads_image_size_error;
        }
      };
    };
    reader.readAsDataURL(image_url);
  }

  AddAdvertisement(advertise_data) {
    if (this.type == 'add') {
      this.myLoading = true;

      this.formData.set('country_id', advertise_data.country_id);
      this.formData.set('ads_detail', advertise_data.ads_detail);

      this.formData.set('city_id', advertise_data.city_id);
      // this.formData.set("ads_type", advertise_data.ads_type);
      this.formData.set('ads_for', advertise_data.ads_for);
      this.formData.set('is_ads_visible', advertise_data.is_ads_visible);
      this.formData.set(
        'is_ads_approve_by_admin',
        advertise_data.is_ads_approve_by_admin
      );

      this.formData.set(
        'is_ads_have_expiry_date',
        advertise_data.is_ads_have_expiry_date
      );

      if (this.add_advertise.is_ads_have_expiry_date == true) {
        if (!this.add_advertise?.expiry_date?.formatted) {
          alert('Select Expiry Date or Uncheck the Expiry Date flag!');
          this.myLoading = false;
          return;
        } else {
          this.formData.set(
            'expiry_date',
            this.add_advertise.expiry_date.formatted
          );
        }
      }
      this.formData.set(
        'is_ads_redirect_to_store',
        advertise_data.is_ads_redirect_to_store
      );
      this.formData.set('store_delivery_id', advertise_data.store_delivery_id);
      if (this.add_advertise.is_ads_redirect_to_store == true) {
        this.formData.set('store_id', this.add_advertise.store_id);
      }
      this.formData.set(
        'in_app_notification',
        advertise_data.in_app_notification
      );

      this.helper.http
        .post(
          `/admin/add_advertise?store_id=${this.add_advertise.store_id}`,
          this.formData
        )
        .subscribe(
          (res_data: any) => {
            if (res_data.success == true) {
              this.myLoading = false;
              this.helper.data.storage = {
                message: this.helper.MESSAGE_CODE[res_data.message],
                class: 'alert-info',
              };
              this.helper.router.navigate(['admin/advertise']);
            } else {
              this.myLoading = false;
              this.helper.data.storage = {
                message: res_data.message,
                class: 'alert-danger',
              };
            }
            this.helper.message();
          },
          (error: any) => {
            this.myLoading = false;
            this.helper.http_status(error);
          }
        );
    } else {
      this.updateAdvertise(advertise_data);
    }
  }

  updateAdvertise(advertise_data) {
    this.myLoading = true;
    this.formData.set('country_id', advertise_data.country_id);
    this.formData.set('ads_detail', advertise_data.ads_detail);
    this.formData.set('city_id', advertise_data.city_id);
    //

    this.formData.set('ads_for', advertise_data.ads_for);
    this.formData.set('is_ads_visible', advertise_data.is_ads_visible);
    this.formData.set(
      'is_ads_approve_by_admin',
      advertise_data.is_ads_approve_by_admin
    );

    this.formData.set(
      'is_ads_have_expiry_date',
      advertise_data.is_ads_have_expiry_date
    );

    if (this.add_advertise.is_ads_have_expiry_date == true) {
      if (!this.add_advertise?.expiry_date?.formatted) {
        alert('Select Expiry Date or Uncheck the Expiry Date flag!');
        this.myLoading = false;
        return;
      } else {
        this.formData.set(
          'expiry_date',
          this.add_advertise.expiry_date.formatted
        );
      }
    }
    this.formData.set(
      'is_ads_redirect_to_store',
      advertise_data.is_ads_redirect_to_store
    );

    if (this.add_advertise.is_ads_redirect_to_store == true) {
      this.formData.set('store_id', this.add_advertise.store_id);
    }
    this.formData.set('advertise_id', advertise_data.advertise_id);
    this.formData.set('store_delivery_id', advertise_data.store_delivery_id);
    this.formData.set(
      'in_app_notification',
      advertise_data.in_app_notification
    );

    this.helper.http.post('/admin/update_advertise', this.formData).subscribe(
      (res_data: any) => {
        this.myLoading = false;
        if (res_data.success == true) {
          this.helper.data.storage = {
            message: this.helper.MESSAGE_CODE[res_data.message],
            class: 'alert-info',
          };
          this.helper.router.navigate(['admin/advertise']);
        } else {
          this.helper.router.navigate(['admin/advertise']);
        }
      },
      (error: any) => {
        this.myLoading = false;
        this.helper.http_status(error);
      }
    );
  }
}
