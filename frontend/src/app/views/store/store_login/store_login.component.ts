import {
  Component,
  ViewContainerRef,
  OnInit,
  ViewChild,
  NgZone,
} from '@angular/core';
import { Helper } from '../../store_helper';

import jQuery from 'jquery';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  FacebookService,
  InitParams,
  LoginResponse,
  LoginOptions,
} from 'ngx-facebook';
import { UtilsHelperService } from 'src/app/services/utils-helper.service';
import { AuthService } from 'src/app/services/auth.service';
declare var gapi;

export interface StoreLogin {
  email: String;
  password: String;
  login_by: String;
  social_id: String;
}

@Component({
  selector: 'store_login',
  templateUrl: 'store_login.template.html',
  styleUrls: ['./store_login.component.css'],
  providers: [Helper, FacebookService],
})
export class store_loginComponent implements OnInit {
  @ViewChild('myModal')
  modal: any;

  private store_login: StoreLogin;
  title: any;
  button: any;
  setting_data: any;
  email_placeholder: Number = 1;
  email_or_phone_error: Boolean = false;
  otp_for_email: number;
  otp_for_sms: number;
  store_data: any;
  opt_error_message: number = 0;
  validation_message: any;
  myLoading: boolean = true;
  is_eye_icon_show: Boolean = false;
  constructor(
    public helper: Helper,
    private fb: FacebookService,
    public vcr: ViewContainerRef,
    private utils: UtilsHelperService,
    private modalService: NgbModal,
    private activeModal: NgbActiveModal,
    private auth: AuthService
  ) {
    let initParams: InitParams = {
      appId: '601526146700337',
      xfbml: true,
      version: 'v2.10',
    };

    fb.init(initParams);
  }

  ngOnInit() {
    let token = this.helper.getToken();
    if (token) {
      this.helper.router.navigate(['store/create_order']);
    }

    this.title = this.helper.title;
    this.button = this.helper.button;
    this.validation_message = this.helper.validation_message;

    this.helper.message();
    this.store_login = {
      email: '',
      password: '',
      login_by: this.title.manual,
      social_id: '',
    };

    this.auth.getSettingDetail({}).subscribe((res_data: any) => {
      this.myLoading = false;
      this.setting_data = res_data.setting;

      if (
        this.setting_data.is_store_login_by_phone == true &&
        this.setting_data.is_store_login_by_email == true
      ) {
        this.email_placeholder = 1;
      } else if (this.setting_data.is_store_login_by_phone == true) {
        this.email_placeholder = 2;
      } else if (this.setting_data.is_store_login_by_email == true) {
        this.email_placeholder = 3;
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
    // this.helper.http
    //   .post(this.helper.POST_METHOD.GET_SETTING_DETAIL, {})
    //   .subscribe(
    //     (res_data: any) => {
    //       this.myLoading = false;
    //       this.setting_data = res_data.setting;

    //       if (
    //         this.setting_data.is_store_login_by_phone == true &&
    //         this.setting_data.is_store_login_by_email == true
    //       ) {
    //         this.email_placeholder = 1;
    //       } else if (this.setting_data.is_store_login_by_phone == true) {
    //         this.email_placeholder = 2;
    //       } else if (this.setting_data.is_store_login_by_email == true) {
    //         this.email_placeholder = 3;
    //       }

    //       if (!this.setting_data.is_store_login_by_social) {
    //         jQuery('#social').hide();
    //       }
    //     },
    //     (error: any) => {
    //       this.myLoading = false;
    //       this.helper.http_status(error);
    //     }
    //   );
  }

  togglePassword() {
    this.is_eye_icon_show = !this.is_eye_icon_show;
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
        if (auth2.isSignedIn.get()) {
          let profile = auth2.currentUser.get().getBasicProfile();

          this.store_login.social_id = profile.getId();
          this.store_login.login_by = this.title.social;
          this.myLoading = true;
          this.storeLogin1(this.store_login);
        }
      });
    });
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
            this.store_login.social_id = res.id;
            this.store_login.login_by = this.title.social;
            this.store_login.email = '';
            this.store_login.password = '';
            this.storeLogin1(this.store_login);
          })
          .catch((error: any) => console.error(error));
      })
      .catch((error: any) => console.error(error));
  }

  storeLogin(logindata) {
    this.store_login.social_id = '';
    this.store_login.login_by = this.title.manual;

    logindata.email = logindata.email.trim();
    if (this.email_placeholder == 1) {
      var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
      if (!isNaN(logindata.email) || reg.test(logindata.email)) {
        this.email_or_phone_error = false;
        this.storeLogin1(this.store_login);
      } else {
        this.email_or_phone_error = true;
      }
    } else {
      this.email_or_phone_error = false;
      this.storeLogin1(this.store_login);
    }
  }

  storeLogin1(logindata) {
    this.auth.storeLogin(logindata).subscribe(
      (res_data: any) => {
        this.myLoading = false;
        if (res_data.success == false) {
          this.helper.data.storage = {
            code: res_data.error_code,
            message: this.helper.ERROR_CODE[res_data.error_code],
            class: 'alert-danger',
          };
          this.helper.message();
        } else {
          this.store_data = res_data;

          this.auth.setStoreToken(this.store_data.token);
          
          if (
            this.setting_data.is_store_sms_verification == true &&
            this.store_data.store.is_phone_number_verified == false &&
            this.setting_data.is_store_mail_verification == true &&
            this.store_data.store.is_email_verified == false
          ) {
            var otp_json = {
              type: 2,
              email: this.store_data.store.email,
              phone: this.store_data.store.phone,
            };
            this.generate_otp(otp_json);
          } else if (
            this.setting_data.is_store_sms_verification == true &&
            this.store_data.store.is_phone_number_verified == false
          ) {
            this.generate_otp({
              type: 2,
              phone: this.store_data.store.phone,
            });
          } else if (
            this.setting_data.is_store_mail_verification == true &&
            this.store_data.store.is_email_verified == false
          ) {
            this.generate_otp({
              type: 2,
              email: this.store_data.store.email,
            });
          } else {
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
            this.helper.router.navigate(['store/create_order']);
            // if (this.store_data.store.is_document_uploaded) {
            //   this.helper.router.navigate(['store/create_order']);
            // } else {
            //   this.helper.router.navigate(['store/upload_document']);
            // }
          }
        }
      },
      (error: any) => {
        this.myLoading = false;
        this.helper.http_status(error);
      }
    );
    // this.helper.http.post(this.helper.POST_METHOD.LOGIN, logindata).subscribe(
    //   (res_data: any) => {
    //     this.myLoading = false;
    //     if (res_data.success == false) {
    //       this.helper.data.storage = {
    //         code: res_data.error_code,
    //         message: this.helper.ERROR_CODE[res_data.error_code],
    //         class: 'alert-danger',
    //       };
    //       this.helper.message();
    //     } else {
    //       this.store_data = res_data;

    //       this.auth.setStoreToken(this.store_data.token);
          
    //       if (
    //         this.setting_data.is_store_sms_verification == true &&
    //         this.store_data.store.is_phone_number_verified == false &&
    //         this.setting_data.is_store_mail_verification == true &&
    //         this.store_data.store.is_email_verified == false
    //       ) {
    //         var otp_json = {
    //           type: 2,
    //           email: this.store_data.store.email,
    //           phone: this.store_data.store.phone,
    //         };
    //         this.generate_otp(otp_json);
    //       } else if (
    //         this.setting_data.is_store_sms_verification == true &&
    //         this.store_data.store.is_phone_number_verified == false
    //       ) {
    //         this.generate_otp({
    //           type: 2,
    //           phone: this.store_data.store.phone,
    //         });
    //       } else if (
    //         this.setting_data.is_store_mail_verification == true &&
    //         this.store_data.store.is_email_verified == false
    //       ) {
    //         this.generate_otp({
    //           type: 2,
    //           email: this.store_data.store.email,
    //         });
    //       } else {
    //         this.helper.setToken(this.store_data.store.server_token);
    //         this.helper.user_cart.name = this.store_data.store.name;
    //         this.helper.user_cart.image = this.store_data.store.image_url;
    //         localStorage.setItem(
    //           'store',
    //           JSON.stringify(this.store_data.store)
    //         );
    //         this.helper.data.storage = {
    //           message: this.helper.MESSAGE_CODE[this.store_data.message],
    //           class: 'alert-info',
    //         };
    //         this.helper.user_cart.cart_data.cart_id = null;
    //         this.helper.user_cart.cart_unique_token = this.utils.uuid4();
    //         this.helper.router.navigate(['store/create_order']);
    //         // if (this.store_data.store.is_document_uploaded) {
    //         //   this.helper.router.navigate(['store/create_order']);
    //         // } else {
    //         //   this.helper.router.navigate(['store/upload_document']);
    //         // }
    //       }
    //     }
    //   },
    //   (error: any) => {
    //     this.myLoading = false;
    //     this.helper.http_status(error);
    //   }
    // );
  }

  generate_otp(otp_json) {
    this.myLoading = true;
    this.helper.http
      .post(this.helper.POST_METHOD.ADMIN_OTP_VERIFICATION, otp_json)
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;
          if (res_data.success == true) {
            this.helper.string_log('email', res_data.otp_for_email);
            this.helper.string_log('sms', res_data.otp_for_sms);
            this.modalService.open(this.modal);
            this.otp_for_email = res_data.otp_for_email;
            this.otp_for_sms = res_data.otp_for_sms;

            if (
              this.store_data.store.is_phone_number_verified == true ||
              this.setting_data.is_store_sms_verification == false
            ) {
              jQuery('#otp_for_sms').css('display', 'none');
            }

            if (
              this.store_data.store.is_email_verified == true ||
              this.setting_data.is_store_mail_verification == false
            ) {
              jQuery('#otp_for_email').css('display', 'none');
            }
          } else {
            this.helper.data.storage = {
              message: this.helper.ERROR_CODE[this.store_data.error_code],
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

  otp_var(otp) {
    if (otp.sms_otp == undefined) {
      if (otp.email_otp == this.otp_for_email) {
        this.otp_verified({
          store_id: this.store_data.store._id,
          email: this.store_data.store.email,
          server_token: this.store_data.store.server_token,
          is_email_verified: true,
        });
      } else {
        this.opt_error_message = 1;
      }
    } else if (otp.email_otp == undefined) {
      if (otp.sms_otp == this.otp_for_sms) {
        this.otp_verified({
          store_id: this.store_data.store._id,
          phone: this.store_data.store.phone,
          server_token: this.store_data.store.server_token,
          is_phone_number_verified: true,
        });
      } else {
        this.opt_error_message = 2;
      }
    } else {
      if (
        otp.sms_otp == this.otp_for_sms &&
        otp.email_otp == this.otp_for_email
      ) {
        this.otp_verified({
          store_id: this.store_data.store._id,
          email: this.store_data.store.email,
          phone: this.store_data.store.phone,
          server_token: this.store_data.store.server_token,
          is_email_verified: true,
          is_phone_number_verified: true,
        });
      } else {
        this.opt_error_message = 3;
      }
    }
  }

  otp_verified(otp_verified_json) {
    this.activeModal.close();
    this.myLoading = true;
    this.helper.http
      .post(this.helper.POST_METHOD.OTP_VERIFICATION, otp_verified_json)
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;
          if (res_data.success == true) {
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
            this.helper.router.navigate(['store/order']);
          } else {
            this.helper.data.storage = {
              code: res_data.error_code,
              message: this.helper.ERROR_CODE[res_data.error_code],
              class: 'alert-danger',
            };
          }
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
  }
}
