import { Component, OnInit } from '@angular/core';
import { Helper } from '../../helper';

@Component({
  selector: 'app-view_bank_detail',
  templateUrl: './view_bank_detail.component.html',
  providers: [Helper],
})
export class ViewBankDetailComponent implements OnInit {
  title: any;
  button: any;
  heading_title: any;
  provider_id: Object;
  bank_detail: any[];

  bank_name: String;
  bank_branch: String;
  bank_account_number: String;
  bank_account_holder_name: String;
  bank_beneficiary_address: String;
  bank_unique_code: String;
  bank_swift_code: String;

  created_at: any;
  updated_at: any;
  myLoading: boolean = true;

  constructor(public helper: Helper) {}

  ngOnInit() {
    this.provider_id = this.helper.router_id.admin.view_provider_bank_detail_id;

    this.helper.http
      .post('/admin/get_bank_detail', { provider_id: this.provider_id })
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;

          if (res_data.success == false) {
            this.helper.router.navigate(['admin/provider/view_bank_detail']);
          } else {
            this.bank_name = res_data.bank_detail.bank_name;
            this.created_at = res_data.bank_detail.created_at;
            this.updated_at = res_data.bank_detail.updated_at;
            this.bank_branch = res_data.bank_detail.bank_branch;
            this.bank_account_number = res_data.bank_detail.bank_account_number;
            this.bank_account_holder_name =
              res_data.bank_detail.bank_account_holder_name;
            this.bank_beneficiary_address =
              res_data.bank_detail.bank_beneficiary_address;
            this.bank_unique_code = res_data.bank_detail.bank_unique_code;
            this.bank_swift_code = res_data.bank_detail.bank_swift_code;
          }
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
  }
}
