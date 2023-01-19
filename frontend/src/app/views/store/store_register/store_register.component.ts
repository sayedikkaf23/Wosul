import { Component, ViewChild, ViewContainerRef } from '@angular/core';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Helper } from '../../store_helper';
import jQuery from 'jquery';
import {
  FacebookService,
  InitParams,
  LoginResponse,
  LoginOptions,
} from 'ngx-facebook';
import { UtilsHelperService } from 'src/app/services/utils-helper.service';
declare var gapi;
export interface StoreRegister {
  name: String;
  email: String;
  password: String;
  social_unique_id: string;
  login_by: any;
  confirm_password: String;
  website_url: String;
  slogan: String;
  country_id: Object;
  city_id: Object;
  address: String;
  country_phone_code: String;
  phone: Number;
  store_delivery_id: Object;
  latitude: any;
  longitude: any;
  image_url: String;
  referral_code: String;
  is_email_verified: any;
  is_phone_number_verified: any;
}

@Component({
  selector: 'store_register',
  templateUrl: 'store_register.template.html',
  styleUrls: ['./store_register.component.css'],
  providers: [Helper, FacebookService],
})
export class store_registerComponent {
  @ViewChild('myModal')
  modal: any;
  phoneCode: any = '+971';
  public store_register: StoreRegister;
  title: any;
  button: any;
  code: any;
  image_url: string;
  minimum_phone_number_length: number;
  maximum_phone_number_length: number;
  country_list: any[];
  city_list: any[];
  delivery_list: any[];
  country_phone_code_list: any[];
  setting_data: any;
  otp_for_email: number;
  otp_for_sms: number;
  stor_data: any;
  store_data: any;
  opt_error_message: number;
  is_referral: Boolean = true;
  is_country_referral: Boolean = true;
  referral_code: string = '';
  is_referral_apply: Boolean = false;
  validation_message: any;
  is_eye_icon_show: Boolean = false;
  password = 'password';
  error_message: any = '';
  is_show_error_message: Boolean = false;

  myLoading: boolean = true;
  constructor(
    public helper: Helper,
    private fb: FacebookService,
    public vcr: ViewContainerRef,
    public utils: UtilsHelperService,
    private modalService: NgbModal,
    private activeModal: NgbActiveModal
  ) {
    let initParams: InitParams = {
      appId: '601526146700337',
      xfbml: true,
      version: 'v2.10',
    };

    fb.init(initParams);
  }

  ngAfterViewInit() {
    jQuery('.chosen-select').chosen();
    setTimeout(function () {
      jQuery('input').iCheck({
        handle: 'checkbox',
        checkboxClass: 'icheckbox_square-green',
      });
    }, 1000);
  }

  ngOnInit() {
    let token = this.helper.getToken();
    if (token) {
      this.helper.data.storage = {
        message: 999,
        class: 'alert-info',
      };

      this.helper.router.navigate(['store/product']);
    }
    this.helper.message();

    this.title = this.helper.title;
    this.button = this.helper.button;
    this.validation_message = this.helper.validation_message;

    this.store_register = {
      name: '',
      email: '',
      password: '',
      social_unique_id: '',
      login_by: this.title.manual,
      confirm_password: '',
      website_url: '',
      slogan: '',
      country_id: '',
      city_id: '',
      address: '',
      country_phone_code: '',
      phone: null,
      store_delivery_id: '',
      latitude: null,
      longitude: null,
      image_url: './default.png',
      referral_code: '',
      is_phone_number_verified: false,
      is_email_verified: false,
    };
    this.helper.http.get(this.helper.GET_METHOD.GET_COUNTRY_LIST).subscribe(
      (res_data: any) => {
        this.country_list = res_data.countries;
        setTimeout(function () {
          jQuery('.chosen-select').trigger('chosen:updated');
        }, 1000);
      },
      (error: any) => {
        this.helper.http_status(error);
      }
    );
    this.helper.http
      .post(this.helper.POST_METHOD.GET_SETTING_DETAIL, {})
      .subscribe(
        (res_data: any) => {
          console.log('res_data: ', res_data);
          this.myLoading = false;
          this.setting_data = res_data.setting;

          if (res_data.setting.is_referral_to_store == false) {
            this.is_referral = false;
          }
          if (
            res_data.setting.is_show_optional_field_in_store_register == false
          ) {
            jQuery('#Optiona_field').css('display', 'none');
          }
          if (!this.setting_data.is_store_login_by_social) {
            jQuery('#social').hide();
          }
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
    this.city_list = [];
    this.minimum_phone_number_length = 10;
    this.maximum_phone_number_length = 10;
    this.delivery_list = [];

    jQuery(document.body)
      .find('#country')
      .on('change', (evnt, res_data) => {
        this.get_city_list(res_data.selected);
      });

    jQuery(document.body)
      .find('#city')
      .on('change', (evnt, res_data) => {
        this.get_delivery_list(res_data.selected);
      });

    jQuery(document.body)
      .find('#delivery')
      .on('change', (evnt, res_data) => {
        this.store_register.store_delivery_id = res_data.selected;
      });

    // this.setAddressEvent('AE');
  }
  public formData = new FormData();

  image_update($event) {
    const files = $event.target.files || $event.srcElement.files;
    const image_url = files[0];

    if (
      image_url.type == 'image/jpeg' ||
      image_url.type == 'image/jpg' ||
      image_url.type == 'image/png'
    ) {
      this.formData = new FormData();
      this.image_url = image_url;
      var reader = new FileReader();

      reader.onload = (e: any) => {
        this.store_register.image_url = e.target.result;
      };
      reader.readAsDataURL(image_url);
    }
  }

  google_register() {
    gapi.load('auth2', () => {
      let auth2 = gapi.auth2.init({
        client_id:
          '158878420608-hnbb58d42ojl3sjdel3hmh7fq9tuhajk.apps.googleusercontent.com',
        fetch_basic_profile: true,
        scope: 'profile',
      });

      auth2.signIn().then(() => {
        this.myLoading = true;
        if (auth2.isSignedIn.get()) {
          let profile = auth2.currentUser.get().getBasicProfile();

          this.store_register.name = profile.getName();
          this.store_register.social_unique_id = profile.getId();
          this.store_register.login_by = this.title.social;
          this.store_register.email = profile.getEmail();
          this.store_register.password = '123456';
          this.store_register.confirm_password = '123456';
          let image_url = profile.getImageUrl();
          this.generate_file(image_url);
        }
      });
    });
    var interval = setInterval(function () {
      // clearInterval(interval)
    }, 1000);
  }

  facebook_register() {
    const loginOptions: LoginOptions = {
      enable_profile_selector: true,
      return_scopes: true,
      scope: 'public_profile,email',
    };

    this.fb
      .login(loginOptions)
      .then((response: LoginResponse) => {
        this.myLoading = true;
        this.fb
          .api('/me?fields=id,name,email')
          .then((res: any) => {
            this.store_register.name = res.name;
            this.store_register.social_unique_id = res.id;
            this.store_register.login_by = this.title.social;
            this.store_register.email = res.email;
            this.store_register.password = '123456';
            this.store_register.confirm_password = '123456';
            let image_url =
              'https://graph.facebook.com/' +
              res.id +
              '/picture?width=250&height=250';

            this.generate_file(image_url);
          })
          .catch((error: any) => console.error(error));
      })
      .catch((error: any) => console.error(error));
  }

  generate_file(image_url) {
    var getFileBlob = function (url, cb) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.responseType = 'blob';
      xhr.addEventListener('load', function () {
        cb(xhr.response);
      });
      xhr.send();
    };

    var blobToFile = function (blob, name) {
      blob.lastModifiedDate = new Date();
      blob.name = 'profile';
      return blob;
    };

    var getFileObject = function (filePathOrUrl, cb) {
      getFileBlob(filePathOrUrl, function (blob) {
        cb(blobToFile(blob, image_url));
      });
    };

    getFileObject(image_url, (fileObject) => {
      var reader = new FileReader();
      this.image_url = fileObject;
      reader.onload = (e: any) => {
        this.store_register.image_url = e.target.result;
      };
      reader.readAsDataURL(fileObject);
      this.myLoading = false;
    });
  }

  check_referral() {
    this.myLoading = true;
    this.helper.http
      .post(this.helper.POST_METHOD.CHECK_REFERRAL, {
        country_id: this.store_register.country_id,
        referral_code: this.referral_code,
        type: 2,
      })
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;
          if (res_data.success) {
            this.is_referral_apply = true;
            this.store_register.referral_code = this.referral_code;
            jQuery('#basic-addon2').hide();
          } else {
            this.is_referral_apply = false;
            this.referral_code = '';
            jQuery('#basic-addon2').show();
          }
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
  }

  get_city_list(countryid) {
    this.is_referral_apply = false;
    this.store_register.referral_code = '';
    this.referral_code = '';
    jQuery('#basic-addon2').show();

    this.store_register.phone = null;
    this.store_register.country_id = countryid;
    this.delivery_list = [];
    this.store_register.store_delivery_id = '';
    this.store_register.city_id = '';
    this.myLoading = true;
    this.helper.http
      .post(this.helper.POST_METHOD.GET_CITY_LIST, { country_id: countryid })
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;
          if (res_data.success) {
            this.store_register.country_phone_code =
              res_data.country_phone_code;
            this.city_list = res_data.cities;
            this.minimum_phone_number_length =
              res_data.minimum_phone_number_length;
            this.maximum_phone_number_length =
              res_data.maximum_phone_number_length;
            this.is_country_referral = res_data.is_referral_store;
            var country_code = res_data.country_code;

            var autocompleteElm = <HTMLInputElement>(
              document.getElementById('address')
            );
            let autocomplete = new google.maps.places.Autocomplete(
              autocompleteElm,
              { componentRestrictions: { country: country_code } }
            );

            autocomplete.addListener('place_changed', () => {
              let place = autocomplete.getPlace();
              if (place.geometry.location) {
                let lat = place.geometry.location.lat();
                let lng = place.geometry.location.lng();
                this.store_register.address = place.formatted_address;
                this.store_register.latitude = lat;
                this.store_register.longitude = lng;
              }
            });
          } else {
            if (res_data.error_code !== 801) {
              this.store_register.country_phone_code =
                res_data.country_phone_code;
              this.minimum_phone_number_length =
                res_data.minimum_phone_number_length;
              this.maximum_phone_number_length =
                res_data.maximum_phone_number_length;
              this.is_country_referral = res_data.is_referral_store;
              let country_code = res_data.country_code;

              this.setAddressEvent(country_code);
            } else {
              this.store_register.country_phone_code = '';
            }
            this.city_list = [];
          }
          setTimeout(function () {
            jQuery('#city').trigger('chosen:updated');
          }, 1000);
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
    setInterval(function () {}, 100);
  }

  get_delivery_list(cityid) {
    this.myLoading = true;
    this.store_register.city_id = cityid;
    this.store_register.store_delivery_id = '';
    this.helper.http
      .post(this.helper.POST_METHOD.GET_DELIVERY_LIST_FOR_CITY, {
        city_id: cityid,
      })
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;
          if (res_data.success) {
            this.delivery_list = res_data.deliveries;
          } else {
            this.delivery_list = [];
          }
          setTimeout(function () {
            jQuery('#delivery').trigger('chosen:updated');
          }, 1000);
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
  }

  setAddressEvent(country_code) {
    let autocompleteElm = <HTMLInputElement>document.getElementById('address');
    console.log('autocompleteElm: ', autocompleteElm);
    let autocomplete = new google.maps.places.Autocomplete(autocompleteElm, {
      componentRestrictions: { country: country_code },
    });

    autocomplete.addListener('place_changed', () => {
      var place = autocomplete.getPlace();
      var lat = place.geometry.location.lat();
      var lng = place.geometry.location.lng();
      this.store_register.address = place.formatted_address;
      this.store_register.latitude = lat;
      this.store_register.longitude = lng;
    });
  }

  togglePassword() {
    this.is_eye_icon_show = !this.is_eye_icon_show;
  }

  blank_address() {
    this.store_register.latitude = null;
    this.store_register.longitude = null;
    this.store_register.address = '';
  }

  storeRegister(stordata) {
    this.register(stordata);
    return;

    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

    // if (
    //   this.store_register.latitude == null ||
    //   this.store_register.longitude == null
    // ) {
    //   this.store_register.address = '';
    // } else {
    if (
      reg.test(stordata.email.trim()) &&
      stordata.password
      // .trim()
      //  === stordata.confirm_password.trim()
    ) {
      this.myLoading = true;
      this.stor_data = stordata;
      // if (
      //   this.setting_data.is_store_sms_verification == true ||
      //   this.setting_data.is_store_mail_verification == true
      // ) {
      this.helper.http
        .post(this.helper.POST_METHOD.ADMIN_OTP_VERIFICATION, {
          type: 2,
          email: stordata.email,
          country_phone_code: stordata.country_phone_code,
          phone: stordata.phone,
        })
        .subscribe(
          (res_data: any) => {
            this.myLoading = false;
            if (res_data.success == true) {
              this.helper.string_log('email', res_data.otp_for_email);
              this.helper.string_log('sms', res_data.otp_for_sms);
              this.modalService.open(this.modal);
              this.otp_for_email = res_data.otp_for_email;
              this.otp_for_sms = res_data.otp_for_sms;
              if (this.setting_data.is_store_sms_verification == false) {
                jQuery('#otp_for_sms').css('display', 'none');
              }

              if (this.setting_data.is_store_mail_verification == false) {
                jQuery('#otp_for_email').css('display', 'none');
              }
            } else {
              this.helper.data.storage = {
                code: res_data.error_code,
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
      // } else {
      this.register(stordata);
      // }
    }
    // }
  }

  otp_var(otp) {
    if (otp.sms_otp == undefined) {
      if (otp.email_otp == this.otp_for_email) {
        this.store_register.is_email_verified = true;
        this.register(this.stor_data);
      } else {
        this.opt_error_message = 1;
      }
    } else if (otp.email_otp == undefined) {
      if (otp.sms_otp == this.otp_for_sms) {
        this.store_register.is_phone_number_verified = true;
        this.register(this.stor_data);
      } else {
        this.opt_error_message = 2;
      }
    } else {
      if (
        otp.sms_otp == this.otp_for_sms &&
        otp.email_otp == this.otp_for_email
      ) {
        this.store_register.is_email_verified = true;
        this.store_register.is_phone_number_verified = true;
        this.register(this.stor_data);
      } else {
        this.opt_error_message = 3;
      }
    }
  }

  register(store_data) {
    if (this.store_register.login_by == this.title.social) {
      this.store_register.password = '';
      this.store_register.confirm_password = '';
    }
    this.myLoading = true;

    store_data.country_id = '5d6791abc01cf5683d14c418';
    store_data.city_id = '5e63564145b47f5e7e315c2c';
    store_data.country_phone_code = '+971';
    store_data.store_delivery_id = '5d9f4b3f37ec2d0e12ecbc4d';

    this.formData.append('image_url', this.image_url);
    this.formData.append('phone', store_data.phone.trim());
    this.formData.append('password', this.store_register.password.trim());
    this.formData.append('country_id', store_data.country_id);
    this.formData.append('city_id', store_data.city_id);
    this.formData.append('social_id', this.store_register.social_unique_id);
    this.formData.append('login_by', this.store_register.login_by);
    this.formData.append('store_delivery_id', store_data.store_delivery_id);
    this.formData.append('country_phone_code', store_data.country_phone_code);
    this.formData.append('name', store_data.name.trim());
    this.formData.append('email', store_data.email.trim());
    this.formData.append('address', store_data.address.trim());
    this.formData.append('latitude', this.store_register.latitude);
    this.formData.append('longitude', this.store_register.longitude);
    // this.formData.append('website_url', store_data.website_url.trim());
    this.formData.append('slogan', store_data.slogan);
    this.formData.append(
      'referral_code',
      this.store_register.referral_code.trim()
    );
    this.formData.append(
      'is_phone_number_verified',
      this.store_register.is_phone_number_verified
    );
    this.formData.append(
      'is_email_verified',
      this.store_register.is_email_verified
    );

    this.helper.http
      .post(this.helper.POST_METHOD.REGISTER, this.formData)
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;
          if (res_data.success == false) {
            // this.helper.data.storage = {
            //   message: this.helper.ERROR_CODE[res_data.error_code],
            //   class: 'alert-danger',
            // };
            this.error_message =
              this.helper.ERROR_CODE[res_data.error_code] ||
              'Something went wrong';
            this.is_show_error_message = true;
            this.helper.message();
            this.formData = new FormData();
            if (this.store_register.login_by == this.title.social) {
              this.store_register.password = '123456';
              this.store_register.confirm_password = '123456';
            }
          } else {
            //                                this.helper.data.storage = {
            //                                                    "message": this.helper.MESSAGE_CODE[res_data.messag                e],
            //                                                    "class": "alert-info"
            //                                }
            //                                this.helper.router.navigate(['store/login']);

            this.store_data = res_data;
            this.helper.setToken(this.store_data.store.server_token);
            this.helper.user_cart.name = this.store_data.store.name;
            this.helper.user_cart.image = this.store_data.store.image_url;
            localStorage.setItem(
              'store',
              JSON.stringify(this.store_data.store)
            );
            this.helper.data.storage = {
              message: this.helper.MESSAGE_CODE[this.store_data.message],
              class: 'alert-info',
            };
            this.helper.user_cart.cart_data.cart_id = null;
            this.helper.user_cart.cart_unique_token = this.utils.uuid4();

            if (this.store_data.store.is_document_uploaded) {
              this.helper.router.navigate(['store/order']);
            } else {
              this.helper.router.navigate(['store/upload_document']);
            }
          }
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
  }
}
