import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Helper } from '../../helper';
import jQuery from 'jquery';

export interface UpdateSms {
  sms_unique_title: String;
  sms_content: String;
  is_send: Boolean;
}

export interface SmsConfiguration {
  // sms_auth_id: String,
  // sms_auth_token: String,
  // sms_number: String,
  name: String;
  sender_id: String;
  sms_api_key: String;
}

@Component({
  selector: 'app-sms',
  templateUrl: './sms.component.html',
  providers: [Helper],
})
export class SmsComponent implements OnInit {
  private update_sms: UpdateSms;
  private sms_configuration: SmsConfiguration;
  title: any;
  button: any;
  heading_title: any;
  sms_id: Object;
  sms_list: any[];
  error: any;

  constructor(public helper: Helper, public vcr: ViewContainerRef) {}
  ngAfterViewInit() {
    jQuery('#sms').chosen();
    setTimeout(function () {
      jQuery('.chosen-select').trigger('chosen:updated');

      jQuery('input').iCheck({
        handle: 'checkbox',
        checkboxClass: 'icheckbox_square-green',
      });
    }, 1000);
  }
  ngOnDestroy() {
    this.helper.router_id.admin.sms_id = '';
  }

  ngOnInit() {
    // debugger;
    this.sms_configuration = {
      name: '',
      sms_api_key: '',
      sender_id: '',
    };
    this.update_sms = {
      sms_unique_title: '',
      sms_content: '',
      is_send: true,
    };
    this.helper.http
      .post('/admin/get_sms_gateway_detail', {})
      .subscribe((res_data: any) => {
        (this.sms_configuration.sms_api_key =
          res_data.sms_gateway_detail.sms_api_key),
          (this.sms_configuration.sender_id =
            res_data.sms_gateway_detail.sender_id),
          (this.sms_configuration.name = res_data.sms_gateway_detail.name);

        // this.sms_configuration.sms_auth_id = res_data.sms_gateway_detail.sms_auth_id,
        // this.sms_configuration.sms_auth_token = res_data.sms_gateway_detail.sms_auth_token,
        // this.sms_configuration.sms_number = res_data.sms_gateway_detail.sms_number
        // this.sms_configuration.name = res_data.sms_gateway_detail.name
      });
    this.sms_id = this.helper.router_id.admin.sms_id;
    this.helper.http.get('/admin/sms_list').subscribe((res: any) => {
      this.sms_list = res.sms_details;
    });
    jQuery(document.body)
      .find('#sms')
      .on('change', (evnt, res_data) => {
        this.update_sms.sms_unique_title = res_data.selected;
        this.sms_id = res_data.selected;
        this.helper.http
          .post('/admin/get_sms_detail', { sms_id: res_data.selected })
          .subscribe((res_data: any) => {
            if (res_data.success == false) {
              this.helper.data.storage = {
                code: res_data.error_code,
                message: this.helper.ERROR_CODE[res_data.error_code],
                class: 'alert-danger',
              };
              this.helper.message();

              this.helper.router.navigate(['admin/sms']);
            } else {
              this.update_sms.sms_unique_title =
                res_data.sms_detail.sms_unique_title;
              this.update_sms.sms_content = res_data.sms_detail.sms_content;
              this.update_sms.is_send = res_data.sms_detail.is_send;
            }
          });
      });

    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
  }

  SmsConfiguration(smsconfigurationdata) {
    debugger;
    this.helper.http
      .post('/admin/update_sms_configuration', smsconfigurationdata)
      .subscribe((res_data: any) => {
        console.log(res_data.success);
        if (res_data.success == true) {
          this.helper.data.storage = {
            message: this.helper.MESSAGE_CODE[res_data.message],
            class: 'alert-info',
          };
          this.helper.message();
          this.helper.router.navigate(['admin/sms']);
        } else {
          this.helper.data.storage = {
            message: this.helper.ERROR_CODE[res_data.error_code],
            class: 'alert-danger',
          };
          this.helper.message();
          this.helper.router.navigate(['admin/sms']);
        }
      });
  }

  UpdateSms(sms_data) {
    this.helper.http
      .post('/admin/update_sms', sms_data)
      .subscribe((res_data: any) => {
        if (res_data.success == true) {
          this.helper.data.storage = {
            message: this.helper.MESSAGE_CODE[res_data.message],
            class: 'alert-info',
          };
          this.helper.message();
          this.helper.router.navigate(['admin/sms']);
        } else {
          this.helper.data.storage = {
            code: res_data.error_code,
            message: this.helper.ERROR_CODE[res_data.error_code],
            class: 'alert-danger',
          };
          this.helper.message();
          this.helper.router.navigate(['admin/sms']);
        }
      });
  }
}
