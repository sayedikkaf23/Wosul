import { OnInit, Component, ViewContainerRef } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { AuthService } from 'src/app/services/auth.service';

import { Helper } from '../../helper';

@Component({
  selector: 'admin_login',
  templateUrl: 'admin_login.template.html',
  styleUrls: ['./admin_login.component.css'],
  providers: [Helper],
})
export class admin_loginComponent implements OnInit {
  title: any;
  button: any;

  myLoading: boolean = true;
  is_eye_icon_show: Boolean = false;
  constructor(
    public helper: Helper,
    public vcr: ViewContainerRef,
    private swPush: SwPush,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.helper.message();
    this.title = this.helper.title;
    this.button = this.helper.button;
  }

  check_verify(logindata) {
    this.helper.http.post('/login', logindata).subscribe(
      (res_data: any) => {
        this.myLoading = false;
        if (res_data.success == true) {
          this.auth.setAuthStorage(res_data);
          // localStorage.setItem('admin_id', res_data.admin_data._id);
          // localStorage.setItem('admin_token', res_data.admin_data.server_token);
          this.subToNotification(res_data.admin_data._id);
          this.helper.data.storage = {
            message: this.helper.MESSAGE_CODE[res_data.message],
            class: 'alert-info',
          };
          this.helper.router.navigate(['admin/dashboard']);
        } else {
          this.helper.data.storage = {
            code: res_data.error_code,
            message: this.helper.ERROR_CODE[res_data.error_code],
            class: 'alert-danger',
          };
          this.helper.message();
          this.helper.router.navigate(['admin/login']);
        }
      },
      (error: any) => {
        this.myLoading = false;
        this.helper.http_status(error);
      }
    );
  }

  readonly VAPID_PUBLIC_KEY =
    'BIhgIFptceIR6rslMhr4COrEofQ4Gkr7iDq2MR4727vJQBr5uAL3tI76h7Wg2sEl3sttfDqGLz64rO4VI1x9nKM';
  subToNotification(admin_id) {
    console.log('subToNotification :>> ');
    this.swPush
      .requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY,
      })
      .then((sub) => {
        console.log('sub :>> ', JSON.stringify(sub.toJSON()));
        console.log('auth :>> ', sub.getKey('auth'));
        console.log('p256dh :>> ', sub.getKey('p256dh'));
        let apiData = {
          subscription: JSON.stringify(sub.toJSON()),
          admin_id: admin_id,
        };
        this.helper.http
          .post('/admin/add_update_subscription', apiData)
          .subscribe((result: any) => {
            if (result.success) {
              console.log('successfuly subscribed to push notification :>> ');
            } else {
              console.log('Could not subscribe :>> ');
            }
          });
      })
      .catch((err) =>
        console.error('Could not subscribe to notifications', err)
      );
  }

  togglePassword() {
    this.is_eye_icon_show = !this.is_eye_icon_show;
  }
}
