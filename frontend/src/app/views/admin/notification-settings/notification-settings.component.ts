import jQuery from 'jquery';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Helper } from '../../helper';

@Component({
  selector: 'app-notification-settings',
  templateUrl: './notification-settings.component.html',
  providers: [Helper],
})
export class NotificationSettingsComponent implements OnInit {
  constructor(public helper: Helper) {}
  title: any;
  button: any;
  heading_title: any;
  validation_message: any;
  DATE_FORMAT: any;
  myLoading: Boolean = false;
  setting_detail: any;
  set_user_notification = {
    type: 'user',
  };
  set_cart_notification = {
    type: 'cart',
  };
  set_wallet_notification = {
    type: 'wallet',
  };
  set_step_notification: any = {
    type: 'step',
    selected: '0',
  };
  walletData = new FormData();
  userData = new FormData();
  cartData = new FormData();
  ngAfterViewInit() {
    jQuery('.chosen-select').chosen({ disable_search: true });
    setTimeout(function () {
      jQuery('.chosen-select').trigger('chosen:updated');
    }, 1000);
  }

  ngOnInit() {
    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
    this.validation_message = this.helper.validation_message;
    this.DATE_FORMAT = this.helper.DATE_FORMAT;
    this.get_setting();
    jQuery(document.body)
      .find('#search_field')
      .on('change', (evnt, res_data) => {
        console.log('res_data select :>> ', res_data);
        this.set_step_notif_form(res_data.selected - 1);
        this.set_step_notification.selected = Number(res_data.selected) - 1;
      });
  }

  cart_notification(e: NgForm) {
    console.log(this.set_cart_notification);
    this.cartData.append('type', this.set_cart_notification.type);
    this.cartData.append(
      'cart_interval',
      this.set_cart_notification['cart_interval']
    );
    this.cartData.append(
      'cart_message',
      this.set_cart_notification['cart_message']
    );
    this.cartData.append(
      'cart_heading',
      this.set_cart_notification['cart_heading']
    );
    this.myLoading = true;
    this.helper.http
      .post('/admin/notification_settings', this.cartData)
      .subscribe((resp: any) => {
        console.log('server resp >>', resp);
        if (resp.success) {
          this.get_setting();
          this.myLoading = false;
        } else {
        }
      });
  }
  user_notification(e: NgForm) {
    console.log(this.set_user_notification);
    this.userData.append('type', this.set_user_notification.type);
    this.userData.append(
      'user_interval',
      this.set_user_notification['user_interval']
    );
    this.userData.append(
      'user_message',
      this.set_user_notification['user_message']
    );
    this.userData.append(
      'user_heading',
      this.set_user_notification['user_heading']
    );
    this.myLoading = true;
    this.helper.http
      .post('/admin/notification_settings', this.userData)
      .subscribe((resp: any) => {
        console.log('server resp >>', resp);
        if (resp.success) {
          this.get_setting();
          this.myLoading = false;
        } else {
        }
      });
  }
  wallet_notification(e: NgForm) {
    console.log(this.set_wallet_notification);
    this.myLoading = true;
    this.walletData.append('type', this.set_wallet_notification.type);
    this.walletData.append('title', this.set_wallet_notification['title']);
    this.walletData.append('body', this.set_wallet_notification['body']);
    this.walletData.append(
      'is_send_wallet_notification',
      this.set_wallet_notification['is_send_wallet_notification']
    );
    this.walletData.append(
      'interval',
      this.set_wallet_notification['interval']
    );
    this.walletData.append('time', this.set_wallet_notification['time']);
    // this.walletData.append('count', this.set_wallet_notification['count'])
    this.helper.http
      .post('/admin/notification_settings', this.walletData)
      .subscribe((resp: any) => {
        if (resp.success) {
          this.get_setting();
          this.myLoading = false;
          this.helper.data.storage = {
            message: resp.message || 'Successfully Updated',
            class: 'alert-info',
          };
          this.helper.message();
        } else {
          this.myLoading = false;
          this.helper.data.storage = {
            message: resp.message || 'Somthing went Wrong',
            class: 'alert-danger',
          };
          this.helper.message();
        }
      });
  }
  step_notification() {
    const formData = new FormData();
    console.log('form: ', this.set_step_notification);
    const {
      type,
      interval,
      title,
      body,
      time,
      is_send_wallet_notification,
      img_url,
      selected,
    } = this.set_step_notification;

    formData.append('selected', selected);
    formData.append('type', type);
    formData.append('interval', interval);
    formData.append('body', body);
    formData.append('title', title);
    formData.append('is_send_notification', is_send_wallet_notification);
    formData.append('time', time);
    formData.append('img_url', img_url);

    this.myLoading = true;
    this.helper.http
      .post('/admin/notification_settings', formData)
      .subscribe((resp: any) => {
        console.log('server resp >>', resp);
        if (resp.success) {
          this.get_setting();
        }
        this.myLoading = false;
      });
  }
  image_update($event, type) {
    // console.log('$event :>> ', $event);
    const files = $event.target.files || $event.srcElement.files;
    const image_url = files[0];
    console.log('files :>> ', files);
    if (files.length != 0) {
      if (image_url.size < 950000) {
        var reader = new FileReader();
        reader.onload = (e: any) => {
          if (type == 'user') {
            this.userData = new FormData();
            this.userData.append('image_url', image_url);
            this.set_user_notification['image_url'] = e.target.result;
          } else if (type == 'cart') {
            this.cartData = new FormData();
            this.cartData.append('image_url', image_url);
            this.set_cart_notification['image_url'] = e.target.result;
          } else if (type == 'wallet') {
            this.walletData = new FormData();
            this.walletData.append('image_url', image_url);
            this.set_wallet_notification['image_url'] = e.target.result;
          } else if (type == 'step') {
            this.set_step_notification.img_url = image_url;
            this.set_step_notification['image_url'] = e.target.result;
          }
        };
        reader.readAsDataURL(image_url);
      } else {
        console.log('image size is too large :>> ');
        this.helper.data.storage = {
          message: 'Image size must be less than 1 MB',
          class: 'alert-danger',
        };
        this.helper.message();
      }
    }
  }

  get_setting() {
    this.helper.http
      .post('/api/admin/get_setting_detail', {})
      .subscribe((resp: any) => {
        if (resp.success) {
          this.setting_detail = resp.setting;
          this.set_step_notif_form(this.set_step_notification.selected);
          this.set_wallet_notification['title'] =
            resp.setting.welcome_wallet_message_title;
          this.set_wallet_notification['body'] =
            resp.setting.welcome_wallet_message_body;
          this.set_wallet_notification['interval'] =
            resp.setting.wallet_notification_interval;
          this.set_wallet_notification['time'] =
            resp.setting.welcome_wallet_notification_time;
          this.set_wallet_notification['count'] =
            resp.setting.welcome_wallet_notification_count;
          this.set_wallet_notification['is_send_wallet_notification'] =
            resp.setting.is_send_wallet_notification;
          this.set_wallet_notification['image_url'] =
            resp.setting.wallet_notification_img_url || '';

          this.set_cart_notification['cart_message'] =
            resp.setting.cart_notification_message;
          this.set_cart_notification['cart_heading'] =
            resp.setting.cart_notification_message_heading;
          this.set_cart_notification['cart_interval'] =
            resp.setting.cart_notification_interval;
          this.set_cart_notification['image_url'] =
            resp.setting.cart_notification_img_url || '';

          this.set_user_notification['user_message'] =
            resp.setting.new_user_notification_message;
          this.set_user_notification['user_heading'] =
            resp.setting.new_user_notification_message_heading;
          this.set_user_notification['user_interval'] =
            resp.setting.user_notification_interval;
          this.set_user_notification['image_url'] =
            resp.setting.user_notification_img_url || '';
        }
      });
  }
  set_step_notif_form(key) {
    this.set_step_notification['title'] =
      this.setting_detail.step_notification[Number(key)].title;
    this.set_step_notification['body'] =
      this.setting_detail.step_notification[Number(key)].body;
    this.set_step_notification['interval'] =
      this.setting_detail.step_notification[Number(key)].interval;
    this.set_step_notification['time'] =
      this.setting_detail.step_notification[Number(key)].time;
    // this.set_step_notification['count'] =  this.setting_detail.step_notification[Number(key)].count
    this.set_step_notification['is_send_wallet_notification'] =
      this.setting_detail.step_notification[Number(key)].is_send_notification;
    this.set_step_notification['image_url'] =
      this.setting_detail.step_notification[Number(key)].img_url || '';
  }
}
