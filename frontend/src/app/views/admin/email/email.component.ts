import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Helper } from '../../helper';
import jQuery from 'jquery';

export interface UpdateEmail {
  email_unique_title: String;
  email_title: String;
  email_content: String;
  email_admin_info: String;
  is_send: Boolean;
}

export interface EmailConfiguration {
  email: String;
  password: String;
}

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  providers: [Helper],
})
export class EmailComponent implements OnInit {
  public update_email: UpdateEmail;
  private email_configuration: EmailConfiguration;
  title: any;
  button: any;
  heading_title: any;
  email_id: Object;
  email_list: any[];
  error: any;

  constructor(public helper: Helper, public vcr: ViewContainerRef) {}

  ngAfterViewInit() {
    //jQuery("#email_content").summernote();
    jQuery('#email').chosen();
    setTimeout(function () {
      jQuery('.chosen-select').trigger('chosen:updated');
      jQuery('input').iCheck({
        handle: 'checkbox',
        checkboxClass: 'icheckbox_square-green',
      });
    }, 1000);
  }
  ngOnDestroy() {
    this.helper.router_id.admin.email_id = '';
  }

  ngOnInit() {
    this.email_configuration = {
      email: '',
      password: '',
    };

    this.update_email = {
      email_unique_title: '',
      email_title: '',
      email_content: '',
      email_admin_info: '',
      is_send: true,
    };

    this.helper.http
      .post('/api/admin/get_setting_detail_for_mail_config', {})
      .subscribe((res_data: any) => {
        (this.email_configuration.email = res_data.setting.email),
          (this.email_configuration.password = res_data.setting.password);
      });

    this.email_id = this.helper.router_id.admin.email_id;
    this.helper.http.get('/admin/email_list').subscribe((res: any) => {
      this.email_list = res.email_details;
    });
    jQuery(document.body)
      .find('#email')
      .on('change', (evnt, res_data) => {
        this.update_email.email_unique_title = res_data.selected;
        this.email_id = res_data.selected;
        this.helper.http
          .post('/admin/get_email_detail', { email_id: res_data.selected })
          .subscribe((res_data: any) => {
            if (res_data.success == false) {
              this.helper.data.storage = {
                code: res_data.error_code,
                message: this.helper.ERROR_CODE[res_data.error_code],
                class: 'alert-danger',
              };
              this.helper.message();

              this.helper.router.navigate(['admin/email']);
            } else {
              this.update_email.email_title = res_data.email_detail.email_title;
              this.update_email.email_unique_title =
                res_data.email_detail.email_unique_title;

              this.update_email.email_admin_info =
                res_data.email_detail.email_admin_info;
              this.update_email.email_content =
                res_data.email_detail.email_content;
              console.log(this.update_email.email_content);
              this.update_email.is_send = res_data.email_detail.is_send;
            }
          });
      });

    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
  }

  EmailConfiguration(emailconfigurationdata) {
    this.helper.http
      .post('/admin/update_email_configuration', emailconfigurationdata)
      .subscribe((res_data: any) => {
        console.log(res_data.success);
        if (res_data.success == true) {
          this.helper.data.storage = {
            message: this.helper.MESSAGE_CODE[res_data.message],
            class: 'alert-info',
          };
          this.helper.message();
          this.helper.router.navigate(['admin/email']);
        } else {
          this.helper.data.storage = {
            message: this.helper.ERROR_CODE[res_data.error_code],
            class: 'alert-danger',
          };
          this.helper.message();
          this.helper.router.navigate(['admin/email']);
        }
      });
  }

  UpdateEmail(email_data) {
    this.helper.http
      .post('/admin/update_email', email_data)
      .subscribe((res_data: any) => {
        console.log(email_data);
        if (res_data.success == true) {
          this.helper.data.storage = {
            message: this.helper.MESSAGE_CODE[res_data.message],
            class: 'alert-info',
          };
          this.helper.message();
          this.helper.router.navigate(['admin/email']);
        } else {
          this.helper.data.storage = {
            code: res_data.error_code,
            message: this.helper.ERROR_CODE[res_data.error_code],
            class: 'alert-danger',
          };
          this.helper.message();

          this.helper.router.navigate(['admin/email']);
        }
      });
  }
}
