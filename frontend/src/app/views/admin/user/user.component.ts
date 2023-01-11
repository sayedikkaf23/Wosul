import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Helper } from '../../helper';
import jQuery from 'jquery';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
 

export interface Document {
  unique_code: string;
  expired_date: any;
  image_url: '';
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  providers: [Helper],
})
export class UserComponent implements OnInit {
  @ViewChild('myModal')
  modal: any;
  @ViewChild('mysmsModal')
  sms_modal: any;
  @ViewChild('mynotificationModal')
  notification_modal: any;
  @ViewChild('document_full_image')
  document_full_image: any;

  user_list: any;
  title: any;
  button: any;
  heading_title: any;
  search_field: string;
  search_value: string;
  page: number;
  number_of_rec: number = 10;
  total_page: number;
  total_pages: number[];

  user_page_type: number;
  user_id: Object;
  type: any;
  wallet: number;
  is_payment_max: number;
  content: string;
  notification_message: string;
  message_heading: string;
  amount: number;
  public message: string = '';
  public class: string;
  myLoading: boolean = true;
  user_detail: any = {};
  is_edit: boolean = false;
  formData = new FormData();
  selected_tab: number = 1;

  document_list: any[] = [];
  edit_document: any[] = [];
  old_image_url: string = '';
  error_message: number = 0;
  private documentlist: Document;
  referral_history: any[] = [];
  review_list: any[] = [];
  selected_document_index: number;

  constructor(
    public helper: Helper,
    public vcr: ViewContainerRef,
    private modalService: NgbModal,
    private activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
    jQuery('.chosen-select').chosen({ disable_search: true });
    setTimeout(function () {
      jQuery('.chosen-select').trigger('chosen:updated');
    }, 1000);

    this.documentlist = {
      unique_code: '',
      expired_date: null,
      image_url: '',
    };

    this.helper.message();
    this.search_field = 'first_name';
    this.search_value = '';
    this.page = 1;

    if (this.helper.route.snapshot.url[1].path == 'users') {
      this.user_page_type = 1;
    } else if (this.helper.route.snapshot.url[1].path == 'declined_user') {
      this.user_page_type = 2;
    }
    this.user_id = '';
    this.filter(this.page);

    this.type = 7;
    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
    this.user_list = [];

    jQuery(document.body)
      .find('#search_field')
      .on('change', (evnt, res_data) => {
        this.search_field = res_data.selected;
      });
    jQuery(document.body)
      .find('#number_of_rec')
      .on('change', (evnt, res_data) => {
        this.number_of_rec = res_data.selected;
        this.filter(1);
      });
  }

  change_page_type(user_page_type) {
    this.user_page_type = user_page_type;
    this.filter(1);
  }

  filter(page) {
    this.page = page;
    this.helper.http
      .post('/admin/user_list_search_sort', {
        user_page_type: this.user_page_type,
        number_of_rec: this.number_of_rec,
        search_field: this.search_field,
        search_value: this.search_value,
        page: this.page,
      })
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;
          if (res_data.success == false) {
            this.user_list = [];
            this.total_pages = [];
            this.user_detail = {};
          } else {
            this.user_list = res_data.users;
            this.total_page = res_data.pages;
            this.total_pages = Array(res_data.pages)
              .fill((x, i) => i)
              .map((x, i) => i + 1);
            if (this.user_list.length > 0) {
              this.get_user_detail(this.user_list[0]._id);
            } else {
              this.user_detail = {};
            }
          }
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
  }

  get_user_detail(id) {
    this.selected_tab = 1;
    let index = this.user_list.findIndex((user) => user._id == id);
    this.user_detail = JSON.parse(JSON.stringify(this.user_list[index]));
  }

  change_image($event) {
    const files = $event.target.files || $event.srcElement.files;
    const image_url = files[0];

    if (
      image_url.type == 'image/jpeg' ||
      image_url.type == 'image/jpg' ||
      image_url.type == 'image/png'
    ) {
      this.formData = new FormData();
      this.formData.append('image_url', image_url);

      var reader = new FileReader();

      reader.onload = (e: any) => {
        this.user_detail.image_url = e.target.result;
      };
      reader.readAsDataURL(image_url);
    }
  }

  update_user_detail() {
    this.formData.append('user_id', this.user_detail._id);
    this.formData.append('phone', this.user_detail.phone);
    this.formData.append('email', this.user_detail.email);
    this.formData.append('first_name', this.user_detail.first_name);
    this.formData.append('last_name', this.user_detail.last_name);
    this.formData.append('city', this.user_detail.city);
    this.helper.http
      .post('/admin/update_user', this.formData)

      .subscribe((res_data: any) => {
        this.myLoading = false;
        this.formData = new FormData();
        if (res_data.success == false) {
          this.helper.data.storage = {
            code: res_data.error_code,
            message: this.helper.ERROR_CODE[res_data.error_code],
            class: 'alert-danger',
          };
        } else {
          let user_index = this.user_list.findIndex(
            (x) => x._id == this.user_detail._id
          );
          this.user_list[user_index] = JSON.parse(
            JSON.stringify(this.user_detail)
          );

          this.is_edit = false;
          this.helper.data.storage = {
            message: this.helper.MESSAGE_CODE[res_data.message],
            class: 'alert-info',
          };
        }
        this.helper.message();
      });
  }

  open_modal(type, id) {
    this.user_id = id;
    this.type = type;
    this.modalService.open(this.modal);
    this.wallet = null;
    this.is_payment_max = null;
  }

  AddWallet(add_wallet_data) {
    this.helper.http
      .post('/admin/add_wallet', add_wallet_data)
      .subscribe((res_data: any) => {
        console.log(add_wallet_data);
        if (res_data.success == true) {
          this.helper.data.storage = {
            message: this.helper.MESSAGE_CODE[res_data.message],
            class: 'alert-info',
          };
          this.modalService.dismissAll();
          this.helper.message();
          var index = this.user_list.findIndex(
            (x) => x._id == add_wallet_data.user_id
          );
          this.user_list[index].wallet =
            this.user_list[index].wallet +
            +Number(add_wallet_data.wallet).toFixed(2);
        } else {
          this.helper.data.storage = {
            code: res_data.error_code,
            message: this.helper.ERROR_CODE[res_data.error_code],
            class: 'alert-danger',
          };
          this.helper.message();
        }
      });
  }

  open_sms_modal(type, id) {
    this.user_id = id;
    this.type = type;
    this.modalService.open(this.sms_modal);
    this.content = '';
  }
  SendSms(sms_data) {
    this.helper.http
      .post('/admin/send_sms', sms_data)
      .subscribe((res_data: any) => {
        if (res_data.success == true) {
          this.helper.data.storage = {
            message: this.helper.MESSAGE_CODE[res_data.message],
            class: 'alert-info',
          };
          this.modalService.dismissAll();
          this.helper.message();
        } else {
          this.helper.data.storage = {
            code: res_data.error_code,
            message: this.helper.ERROR_CODE[res_data.error_code],
            class: 'alert-danger',
          };
          this.helper.message();
        }
      });
  }

  open_notification_modal(type, id) {
    this.user_id = id;
    this.type = type;
    this.modalService.open(this.notification_modal);
    this.content = '';
    this.notification_message = '';
    this.message_heading = '';
  }
  SendNotification(notification_data) {
    this.helper.http
      .post('/admin/send_notification', notification_data)
      .subscribe((res_data: any) => {
        if (res_data.success == true) {
          this.helper.data.storage = {
            message: this.helper.MESSAGE_CODE[res_data.message],
            class: 'alert-info',
          };
          this.modalService.dismissAll();
          this.helper.message();
        } else {
          this.helper.data.storage = {
            code: res_data.error_code,
            message: this.helper.ERROR_CODE[res_data.error_code],
            class: 'alert-danger',
          };
          this.helper.message();
        }
      });
  }

  approved_decline(user_page_type, user_id) {
    this.helper.http
      .post('/admin/approve_decline_user', {
        user_id: user_id,
        user_page_type: user_page_type,
      })
      .subscribe((res_data: any) => {
        let user_index = this.user_list.findIndex((x) => x._id == user_id);
        this.user_list.splice(user_index, 1);

        if (this.user_list.length > 0) {
          this.get_user_detail(this.user_list[0]._id);
        } else {
          this.user_detail = {};
        }

        if (res_data.success == false) {
          this.helper.data.storage = {
            code: res_data.error_code,
            message: this.helper.ERROR_CODE[res_data.error_code],
            class: 'alert-danger',
          };
        } else {
          this.helper.data.storage = {
            message: this.helper.MESSAGE_CODE[res_data.message],
            class: 'alert-info',
          };
        }
        this.helper.message();
      });
  }

  get_document_list() {
    this.is_edit = false;
    this.selected_tab = 2;
    this.helper.http
      .post('/admin/view_document_list', { id: this.user_detail._id, type: 7 })
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;

          if (res_data.success == false) {
            this.document_list = [];
          } else {
            this.document_list = res_data.documents;
            this.document_list.forEach((document, index) => {
              this.edit_document[index] = 'false';
              this.get_document_image(document.image_url, index);
            });
          }
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
  }

  get_referral_history() {
    this.is_edit = false;
    this.selected_tab = 3;
    this.myLoading = true;
    this.helper.http
      .post('/admin/get_user_referral_history', {
        id: this.user_detail._id,
        type: 7,
      })
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;
          if (res_data.success == false) {
            this.referral_history = [];
          } else {
            this.referral_history = res_data.referral_history;
          }
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
  }

  show_full_image(image_url, document_index) {
    this.selected_document_index = document_index;
    this.modalService.open(this.document_full_image);
    this.get_document_image(image_url, document_index);
  }

  get_review_history() {
    this.is_edit = false;
    this.selected_tab = 4;
    this.myLoading = true;
    this.helper.http
      .post('/admin/get_user_review_history', { user_id: this.user_detail._id })
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;
          if (res_data.success == false) {
            this.review_list = [];
          } else {
            this.review_list = res_data.review_list;
          }
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
  }

  Array(number) {
    var array = [];
    for (var i = 0; i < number; i++) {
      array.push(' ');
    }
    return array;
  }

  editDocument(document, document_index) {
    this.get_document_image(document.image_url, document_index);
    this.old_image_url = document.image_url;
    this.edit_document.fill('');
    this.edit_document[document_index] = 'true';
    this.documentlist.unique_code = document.unique_code;
    this.documentlist.image_url = document.image_url;
    if (document.expired_date != null) {
      var date = new Date(document.expired_date);
      this.documentlist.expired_date = {
        date: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate(),
        },
        formatted:
          date.getMonth() + 1 + '-' + date.getDate() + '-' + date.getFullYear(),
      };
    }
  }

  image_update($event, document_index) {
    this.formData = new FormData();
    const files = $event.target.files || $event.srcElement.files;
    const image_url = files[0];
    this.formData.append('image_url', image_url);

    var reader = new FileReader();

    reader.onload = (e: any) => {
      this.document_list[document_index].image_url = e.target.result;
      this.documentlist.image_url = e.target.result;
      jQuery('.document' + document_index).attr('src', e.target.result);
    };
    reader.readAsDataURL(image_url);
  }

  get_document_image(url, document_index) {
    if (url == '') {
      jQuery('.document' + document_index).attr('src', 'default.png');
    } else {
      var oReq = new XMLHttpRequest();
      oReq.open('GET', url, true);
      oReq.setRequestHeader('type', 'admin');
      oReq.setRequestHeader('token', this.user_detail.server_token);
      oReq.responseType = 'blob';
      oReq.onload = function (oEvent) {
        var arrayBuffer = oReq.response; // Note: not oReq.responseText
        if (arrayBuffer) {
          jQuery('.document' + document_index).attr(
            'src',
            URL.createObjectURL(arrayBuffer)
          );
        } else {
          jQuery('.document' + document_index).attr('src', 'default.png');
        }
      };
      oReq.send(null);
    }
  }

  updateDocument(document, document_index) {
    if (this.documentlist.image_url == '') {
      this.error_message = 1;
    } else if (
      document.document_details.is_expired_date &&
      this.documentlist.expired_date == null
    ) {
      this.error_message = 2;
    } else if (
      document.document_details.is_unique_code &&
      this.documentlist.unique_code == ''
    ) {
      this.error_message = 3;
    } else {
      this.myLoading = true;
      this.error_message = 0;
      this.formData.append('type', this.type);
      this.formData.append('unique_code', this.documentlist.unique_code);
      this.formData.append('document_id', document._id);
      this.formData.append('id', this.user_detail._id);
      this.formData.append('server_token', this.user_detail.server_token);
      if (this.documentlist.expired_date != null) {
        this.formData.append(
          'expired_date',
          this.documentlist.expired_date.formatted
        );
      }

      this.helper.http.post(  '/admin/upload_document', this.formData).subscribe(
        (res_data: any) => {
          this.formData = new FormData();
          this.edit_document.fill('false');
          this.myLoading = false;
          if (res_data.success) {
            this.document_list[document_index].image_url = res_data.image_url;

            this.get_document_image(res_data.image_url, document_index);

            this.document_list[document_index].unique_code =
              res_data.unique_code;

            this.document_list[document_index].expired_date =
              res_data.expired_date;
            localStorage.setItem(
              'store_document_ulpoaded',
              res_data.is_document_uploaded
            );

            this.helper.data.storage = {
              message: this.helper.MESSAGE_CODE[res_data.message],
              class: 'alert-info',
            };
            this.helper.message();
          } else {
            this.document_list[document_index].image_url = this.old_image_url;
            this.get_document_image(this.old_image_url, document_index);

            this.helper.data.storage = {
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
    }
  }

  editUser(id) {
    this.helper.router_id.admin.user_id = id;
    this.helper.router.navigate(['admin/user/edit']);
  }
  viewHistory(id, type) {
    this.helper.router_id.admin.history_user_id = id;
    this.helper.router_id.admin.page_type = type;
    this.helper.router.navigate(['admin/user/view_history']);
  }
  viewUser(id) {
    this.helper.router_id.admin.detail_user_id = id;
    this.helper.router.navigate(['admin/user/view_detail']);
  }
  viewDocument(id, type) {
    this.helper.router_id.admin.user_id = id;
    this.helper.router_id.admin.document_type = type;
    this.helper.router.navigate(['admin/user/view_document']);
  }

  user_export_csv(user_page_type) {
    this.helper.http
      .post('/admin/user_list_search_sort', {
        user_page_type: this.user_page_type,
        number_of_rec: this.number_of_rec,
        search_field: this.search_field,
        search_value: this.search_value,
      })
      .subscribe((res_data: any) => {
        var json2csv = require('json2csv').parse;
        res_data.users.forEach((user, index) => { });

        var fields = [
          {
            label: 'Unique ID',
            value: 'unique_id'
          },
          {
            label: 'First Name',
            value: 'first_name'
          },
          {
            label: 'Last Name',
            value: 'last_name'
          },
          {
            label: 'City',
            value: 'city'
          },
          {
            label: 'Device Type',
            value: 'device_type'
          },
          {
            label: 'Referral Code',
            value: 'referral_code'
          },
          {
            label: 'Email',
            value: 'email'
          },
          {
            label: 'Country Phone Code',
            value: 'country_phone_code'
          },
          {
            label: 'Phone',
            value: 'phone'
          },
          {
            label: 'App Version',
            value: 'app_version'
          },
          {
            label: 'Wallet',
            value: 'wallet'
          },
          {
            label: 'Wallet Currency Code',
            value: 'wallet_currency_code'
          },
          {
            label: 'Address',
            value: 'address'
          },
          {
            label: 'Approved',
            value: 'is_approved'
          },
          {
            label: 'created_at',
            value: 'created_at'
          },
          {
            label: 'Email Verify',
            value: 'is_email_verified'
          },
          {
            label: 'Phone Number Verify',
            value: 'is_phone_number_verified'
          },
          {
            label: 'Document Uploaded',
            value: 'is_document_uploaded'
          },
          {
            label: 'Location',
            value: 'location'
          },

        ];
        // var fields = [
        //   'unique_id',
        //   'first_name',
        //   'last_name',
        //   'city',
        //   'device_type',
        //   'referral_code',
        //   'email',
        //   'country_phone_code',
        //   'phone',
        //   'app_version',
        //   'wallet',
        //   'wallet_currency_code',
        //   'address',
        //   'is_approved',
        //   'created_at',
        //   'is_email_verified',
        //   'is_phone_number_verified',
        //   'is_document_uploaded',
        //   'location',
        // ];

        // var csv = json2csv({
        //   data: res_data.users,
        //   fields: fields,
        //   fieldNames: fieldNames,
        // });
        var csv = json2csv(res_data.users, { fields });

        var final_csv: any = csv;
        this.helper.downloadFile(final_csv);
      });
  }

  user_export_excel(user_page_type) {
    this.helper.http
      .post('/admin/user_list_search_sort', {
        number_of_rec: this.number_of_rec,
        user_page_type: this.user_page_type,
        search_field: this.search_field,
        search_value: this.search_value,
      })
      .subscribe((res_data: any) => {
        var json_data = [];
        var json2excel = require('js2excel');
        res_data.users.forEach((user, index) => {
          json_data.push({
            'Unique ID': user.unique_id,
            'First Name': user.first_name,
            'Last Name': user.last_name,
            City: user.city,
            'Device Type': user.device_type,
            'Referral Code': user.referral_code,
            Email: user.email,
            'Country Phone Code': user.country_phone_code,
            Phone: user.phone,
            'App Version': user.app_version,
            Wallet: user.wallet,
            'Wallet Currency Code': user.wallet_currency_code,
            Address: user.address,
            Approved: user.is_approved,
            'Email Verify': user.is_email_verified,
            'Phone Number Verify': user.is_phone_number_verified,
            'Document Uploaded': user.is_document_uploaded,
            Location: user.location,
          });
        });

        json2excel.json2excel({
          data: json_data,
          name: 'user_excel',
          formateDate: 'yyyy/mm/dd',
        });
      });
  }
}
