import { Component, OnInit } from '@angular/core';
import { Helper } from '../../helper';
import jQuery from 'jquery';
 

export interface AddAdmin {
  admin_type: Number;
  store_id? : String;
  username: String;
  password: String;
  email: String;
  urls: String[];
}

@Component({
  selector: 'app-add_admin',
  templateUrl: './add_admin.component.html',
  providers: [Helper],
})
export class AddAdminComponent implements OnInit {
  private add_admin: AddAdmin;
  title: any;
  button: any;
  heading_title: any;
  validation_message: any;
  type: String;
  admin_id: Object;
  admin_exist: any;
  error: any;
  admin_list: any[];
  store_list : any []
  myLoading: boolean = true;
  url_list: any[];
  constructor(public helper: Helper) {}
  ngAfterViewInit() {
    jQuery('#admin_type').chosen({ disable_search: true });
    jQuery('#store').chosen();
    setTimeout(function () {
      
      jQuery('.chosen-select').trigger('chosen:updated');
      jQuery('input').iCheck({
        handle: 'checkbox',
        checkboxClass: 'icheckbox_square-green',
      });
    }, 1000);

  }
  ngOnDestroy() {
    this.helper.router_id.admin.admin_id = '';
  }

  ngOnInit() {
    this.url_list = this.helper.ADMIN_URL;
    this.add_admin = {
      admin_type: 1,
      username: '',
      password: '',
      email: '',
      urls: [],
    };
    this.admin_id = this.helper.router_id.admin.admin_id;
    jQuery(document.body)
    .find('#store')
    .on('change', (evnt, res_data) => {
      console.log('res_data.selected :>> ', res_data.selected);
      this.add_admin.store_id = res_data.selected;
    });
    jQuery(document.body)
      .find('#admin_type')
      .on('change', (evnt, res_data) => {
        this.add_admin.admin_type = res_data.selected;
        if(res_data.selected == 4){
          this.get_store_list('5d6791abc01cf5683d14c418')
        }
        if (res_data.selected == 3 || res_data.selected == 4) {
          this.url_list = this.helper.ADMIN_URL;
          setTimeout(() => {
            jQuery('.icheck').iCheck({
              handle: 'checkbox',
              checkboxClass: 'icheckbox_square-green',
            });

            jQuery(document.body)
              .find('.icheck')
              .on('ifChecked', (event, res_data) => {
                var id = event.target.getAttribute('value');
                this.add_admin.urls.push(id);
              });

            jQuery(document.body)
              .find('.icheck')
              .on('ifUnchecked', (event, res_data) => {
                var id = event.target.getAttribute('value');
                var i = this.add_admin.urls.indexOf(id);
                if (i != -1) {
                  this.add_admin.urls.splice(i, 1);
                }
              });
          }, 1000);
        }
      });



    if (this.admin_id == '') {
      this.type = 'add';
      this.admin_exist = '';
    } else {
      jQuery('#add').hide();
      this.type = 'edit';
      this.helper.http
        .post('/admin/get_detail', { admin_id: this.admin_id })
        .subscribe((res_data: any) => {
          if (res_data.success == false) {
            this.helper.router.navigate(['admin/list']);
          } else {
            this.add_admin.username = res_data.admin.username;
            this.add_admin.email = res_data.admin.email;
            this.add_admin.admin_type = res_data.admin.admin_type;
            this.add_admin.store_id = res_data.admin.store_id;
            this.add_admin.urls = res_data.admin.urls;
            if(this.add_admin.admin_type == 4){
              this.get_store_list('5d6791abc01cf5683d14c418')
            }
            if (this.add_admin.admin_type == 3 || this.add_admin.admin_type == 4) {
              setTimeout(() => {
                jQuery('.icheck').iCheck({
                  handle: 'checkbox',
                  checkboxClass: 'icheckbox_square-green',
                });

                jQuery(document.body)
                  .find('.icheck')
                  .on('ifChecked', (event, res_data) => {
                    var id = event.target.getAttribute('value');
                    this.add_admin.urls.push(id);
                  });

                jQuery(document.body)
                  .find('.icheck')
                  .on('ifUnchecked', (event, res_data) => {
                    var id = event.target.getAttribute('value');
                    var i = this.add_admin.urls.indexOf(id);
                    if (i != -1) {
                      this.add_admin.urls.splice(i, 1);
                    }
                  });
              }, 1000);
            }
          }
        });
    }

    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
    this.validation_message = this.helper.validation_message;
  }
  get_store_list(countryid) {
    this.helper.http
      .post('/admin/get_main_store_list', { is_main_store : true })
      .subscribe((res_data: any) => {
        this.store_list = res_data.stores;
      });
      setTimeout(function () {
        jQuery('#store').trigger('chosen:updated');
      }, 1000);
  }
  AddAdmin(admin_data) {
    
    if (this.type == 'add') {
      this.myLoading = true;
      this.helper.http.post(  '/admin/add', admin_data).subscribe(
        (res_data: any) => {
          this.myLoading = false;
          if (res_data.success == true) {
            this.helper.data.storage = {
              message: this.helper.MESSAGE_CODE[res_data.message],
              class: 'alert-info',
            };
            this.helper.router.navigate(['admin/list']);
          } else {
            this.helper.data.storage = {
              message: this.helper.ERROR_CODE[res_data.error_code],
              class: 'alert-danger',
            };
            this.helper.router.navigate(['admin/list']);
          }
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
    } else {
      this.updateAdmin(admin_data);
    }
  }

  updateAdmin(admin_data) {
    this.myLoading = true;
    this.helper.http.post(  '/admin/update', admin_data).subscribe(
      (res_data: any) => {
        this.myLoading = false;
        if (res_data.success == true) {
          this.helper.data.storage = {
            message: this.helper.MESSAGE_CODE[res_data.message],
            class: 'alert-info',
          };
          this.helper.router.navigate(['admin/list']);
        } else {
          this.helper.data.storage = {
            message: this.helper.ERROR_CODE[res_data.error_code],
            class: 'alert-danger',
          };
          this.helper.router.navigate(['admin/list']);
        }
      },
      (error: any) => {
        this.myLoading = false;
        this.helper.http_status(error);
      }
    );
  }
}
