import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Helper } from '../../helper';
declare var swal: any;

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  providers: [Helper],
})
export class AdminComponent implements OnInit {
  admin_list: any[];
  title: any;
  button: any;
  heading_title: any;
  public message: string;
  public class: string;
  myLoading: boolean = true;
  is_show_time_sheet: boolean = false;
  constructor(public helper: Helper, public vcr: ViewContainerRef) {}

  activeRoute(routename: string): boolean {
    return this.helper.router.url.indexOf(routename) > -1;
  }

  ngOnInit() {
    this.helper.message();
    this.helper.http.get('admin/lists').subscribe(
      (data: any) => {
        this.myLoading = false;

        if (data.success == false) {
          this.admin_list = [];
        } else {
          this.admin_list = data.admins;
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

    if (localStorage.getItem('admin_id') == '5d67831bfd0bf2957275876a') {
      this.is_show_time_sheet = true;
    }
  }

  editAdmin(id) {
    this.helper.router_id.admin.admin_id = id;
    this.helper.router.navigate(['admin/edit']);
  }

  deleteAdmin(id, admin_index) {
    swal({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    })
      .then(() => {
        this.helper.http
          .post('/admin/delete', { admin_id: id })

          .subscribe((res_data: any) => {
            if (res_data.success == true) {
              this.helper.data.storage = {
                message: this.helper.MESSAGE_CODE[res_data.message],
                class: 'alert-info',
              };

              this.helper.message();
              this.admin_list.splice(admin_index, 1);
            } else {
              this.helper.data.storage = {
                code: res_data.error_code,
                message: this.helper.ERROR_CODE[res_data.error_code],
                class: 'alert-danger',
              };
            }
          });
        swal('Deleted!', 'Your file has been deleted.', 'success');
      })
      .catch(swal.noop);
  }

  time_sheet_export_csv(id, index) {
    this.helper.http
      .post('api/admin/get_time_sheet_data', { admin_id: id })
      .subscribe((res_data: any) => {
        if (res_data.success) {
          const admin = this.admin_list.filter((admin) => admin._id === id);
          var json2csv = require('json2csv').parse;
          res_data.time_sheets.forEach((time_sheet, index) => {
            time_sheet.admin_name = admin[0].username;
            var duration = new Date();
            duration = new Date();
            duration = new Date(duration.setHours(0, 0, 0));
            duration = new Date(duration.getTime() + time_sheet.duration);
            time_sheet.duration = duration.toLocaleTimeString();
            time_sheet.created_at = new Date(
              time_sheet.created_at
            ).toLocaleTimeString();
            time_sheet.updated_at = new Date(
              time_sheet.updated_at
            ).toLocaleTimeString();
          });
          var fieldNames = [
            'Admin Name',
            'Date',
            'Start At',
            'Duration',
            'End At',
          ];
          var fields = [
            'admin_name',
            'date',
            'created_at',
            'duration',
            'updated_at',
          ];

          var csv = json2csv( res_data.time_sheets, { fields: fields});

          var final_csv: any = csv;
          this.helper.downloadFile(final_csv);
        }
      });
  }
}
