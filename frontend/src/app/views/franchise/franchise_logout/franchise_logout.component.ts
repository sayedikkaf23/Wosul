import { Component, OnInit } from '@angular/core';
import { Helper } from '../../franchise_helper';

@Component({
  selector: 'app-franchise_logout',
  template: '',
  providers: [Helper],
})
export class FranchiseLogoutComponent implements OnInit {
  myLoading: boolean = true;
  constructor(public helper: Helper) {}

  ngOnInit() {
    var franchise = JSON.parse(localStorage.getItem('franchise'));
    if (franchise !== null) {
      this.helper.http
        .post(this.helper.POST_METHOD.LOGOUT, { franchise_id: franchise._id })
        .subscribe(
          (res_data: any) => {
            this.myLoading = false;
            this.helper.removeToken();
            localStorage.removeItem('franchise');
            this.helper.router.navigate(['franchise/login']);
          },
          (error: any) => {
            this.myLoading = false;
            this.helper.http_status(error);
          }
        );
    } else {
      this.myLoading = false;
      this.helper.removeToken();
      localStorage.removeItem('franchise');
      this.helper.router.navigate(['franchise/login']);
    }
  }
}
