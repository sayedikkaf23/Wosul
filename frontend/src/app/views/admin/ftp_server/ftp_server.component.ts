import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Helper } from '../../helper';
import jQuery from 'jquery';

export interface AddFTPServer {
  host: String;
  port: String;
  user: String;
  password: String;
}

@Component({
  selector: 'app-ftp_server',
  templateUrl: './ftp_server.component.html',
  styleUrls: ['./ftp_server.component.css'],
  providers: [Helper],
})
export class FtpServerComponent implements OnInit {
  public add_ftp_server: AddFTPServer;
  ftp_server_list: any[]; //for getting ftp_server list
  ftp_server_id: ''; //for edit ftp_server
  _id: ''; // for update ftp_server via _id
  dropdownSettings: IDropdownSettings = {
    singleSelection: true,
    idField: '_id',
    textField: 'name',
    // selectAllText: 'Select All',
    // unSelectAllText: 'UnSelect All',
    itemsShowLimit: 5,
    allowSearchFilter: true,
    closeDropDownOnSelection: true,
  };
  selectedItems; //for select values in dropdown while edit ftp_server
  store_id = { _id: null, name: null }; //for getting store data in separate columns
  store_list = []; //for getting store list
  admin_token: String; //for getting token
  myLoading: boolean = false;

  //For Headers
  header_list = [
    { _id: 1, name: 'price' },
    { _id: 2, name: 'is_item_in_stock' },
    { _id: 3, name: 'item_number' },
  ]; //for getting header list
  header_value = []; // for getting header value
  header_type = [
    { _id: 1, name: 'number' },
    { _id: 2, name: 'boolean' },
    { _id: 3, name: 'string' },
  ];
  selectedHeaderKey; //for selecting header key
  selectedHeaderType; //for selecting header type
  selectedHeaderValue; //for selecting header value

  @ViewChild('import_data_modal')
  import_data_modal: any;
  import_data_file: File;

  //For Item Barcode
  item_barcode_key = [
    { _id: 1, name: '_id' },
    { _id: 2, name: 'unique_id_for_store_data' },
    { _id: 3, name: 'unique_id' },
  ];
  item_barcode_value = [];

  selectedItemKey; //for selecting header key
  selectedItemType; //for selecting header type
  selectedItemValue; //for selecting header value

  //For Create Multiple Inputs
  public headers_data: any[] = [
    {
      key: '',
      value: '',
      type: '',
    },
  ];

  header_details: any;
  filter: any;

  constructor(
    public helper: Helper,
    private modalService: NgbModal,
    private activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.add_ftp_server = {
      host: '',
      port: '',
      user: '',
      password: '',
    };
    this.admin_token = localStorage.getItem('admin_token');
    this.getFTPServerList();
    this.getStoreList();
  }
  public formData = new FormData();

  addHeaders() {
    this.headers_data.push({
      key: '',
      value: '',
      type: '',
    });
  }

  removeHeaders(i: number) {
    this.headers_data.splice(i, 1);
  }

  onItemSelect(item: any) {
    this.store_id = item;
  }

  //For Header
  onHeaderKeySelect(header_Key: any) {
    this.selectedHeaderKey = header_Key.name;
  }

  onHeaderValueSelect(header_value: any) {
    this.selectedHeaderValue = header_value;
  }

  onHeaderTypeSelect(header_type) {
    this.selectedHeaderType = header_type.name;
  }

  //For Item Barcode
  onItemKeySelect(item_Key: any) {
    this.selectedItemKey = item_Key.name;
  }

  onItemValueSelect(item_value: any) {}

  onItemTypeSelect(item_type: any) {
    this.selectedItemType = item_type.name;
  }
  //For Get Store List For Dropdown
  getStoreList() {
    this.helper.http
      .post('/admin/get_main_store_list', { is_main_store: true })
      .subscribe((res_data: any) => {
        this.store_list = res_data.stores;
      });
  }

  //For Get FTP Server List
  getFTPServerList() {
    this.helper.message();
    this.helper.http.get('api/admin/get_ftp_server_details').subscribe(
      (data: any) => {
        if (data.success == false) {
          this.ftp_server_list = [];
        } else {
          this.ftp_server_list = data.ftp_server_list;
        }
      },
      (error: any) => {
        this.helper.http_status(error);
      }
    );
  }

  //For Add or Update FTP Server
  saveFTPServer(ftp_server_data) {
    if (this.selectedItems == undefined) {
      alert('Select Store First!');
      return;
    }
    if (this.ftp_server_id) {
      ftp_server_data.store_id = this.selectedItems[0]._id;
      ftp_server_data._id = this.ftp_server_id;
      ftp_server_data.server_token = this.admin_token;
      if (this.filter) ftp_server_data.filter = this.filter;
      if (this.header_details)
        ftp_server_data.header_details = this.header_details;
      this.updateFTPServer({
        ...ftp_server_data,
        filter: this.filter,
        header_details: this.header_details,
      });
    } else {
      ftp_server_data.store_id = this.selectedItems[0]._id;
      ftp_server_data.server_token = this.admin_token;
      this.addFTPServer({
        ...ftp_server_data,
        filter: this.filter,
        header_details: this.header_details,
      });
    }
  }

  //For Add FTP Server
  addFTPServer(ftp_server_data) {
    if (ftp_server_data) {
      this.helper.http
        .post('api/admin/add_ftp_server_details', ftp_server_data)
        .subscribe(
          (res_data: any) => {
            if (res_data.success == true) {
              this.helper.data.storage = {
                message: this.helper.MESSAGE_CODE[res_data.message],
                class: 'alert-info',
              };
              this.clearInput();
              this.getFTPServerList();
            } else {
              this.helper.data.storage = {
                message: this.helper.ERROR_CODE[res_data.error_code],
                class: 'alert-danger',
              };
            }
            this.filter = null;
            this.header_details = null;
          },
          (error: any) => {
            this.helper.http_status(error);
          }
        );
    }
  }

  //For Update FTP Server
  updateFTPServer(ftp_server_data) {
    if (ftp_server_data) {
      this.helper.http
        .post('api/admin/update_ftp_server_details', ftp_server_data)
        .subscribe(
          (res_data: any) => {
            if (res_data.success == true) {
              this.helper.data.storage = {
                message: this.helper.MESSAGE_CODE[res_data.message],
                class: 'alert-info',
              };
              this.clearInput();
              this.getFTPServerList();
            } else {
              this.helper.data.storage = {
                message: this.helper.ERROR_CODE[res_data.error_code],
                class: 'alert-danger',
              };
            }
            this.filter = null;
            this.header_details = null;
          },
          (error: any) => {
            this.helper.http_status(error);
          }
        );
    }
  }

  //For Edit FTP Server
  editFTPServer(id) {
    this.ftp_server_id = id;
    this.helper.http
      .post('/api/admin/get_ftp_server_detail_by_id', {
        ftp_server_id: this.ftp_server_id,
        server_token: this.admin_token,
      })
      .subscribe((res_data: any) => {
        if (res_data.success == false) {
          this.helper.router.navigate(['admin/ftp_server']);
        } else {
          this.add_ftp_server.host = res_data.ftp_server.host;
          this.add_ftp_server.port = res_data.ftp_server.port;
          this.add_ftp_server.user = res_data.ftp_server.user;
          this.add_ftp_server.password = res_data.ftp_server.password;
          this.selectedItems = [
            {
              _id: res_data.ftp_server.store_details._id,
              name: res_data.ftp_server.store_details.name,
            },
          ];
        }
      });
  }

  //For Delete FTP Server
  deleteFTPServer(id) {
    this.helper.http
      .post('/api/admin/delete_ftp_server', {
        ftp_server_id: id,
        server_token: this.admin_token,
      })
      .subscribe((res_data: any) => {
        if (res_data.success == false) {
          this.helper.data.storage = {
            message: this.helper.MESSAGE_CODE[res_data.message],
            class: 'alert-danger',
          };
        } else {
          this.helper.data.storage = {
            message: this.helper.MESSAGE_CODE[res_data.message],
            class: 'alert-info',
          };
          this.getFTPServerList();
        }
      });
  }

  //for import files
  mappingModalRef;
  import_data() {
    this.mappingModalRef = this.modalService.open(this.import_data_modal, {
      size: 'md',
    });
  }

  //for select file for uploading
  upload_excel($event) {
    const files = $event.target.files || $event.srcElement.files;
    const logo_image = files[0];
    this.import_data_file = logo_image;
    if (this.import_data_file) {
      this.myLoading = true;
      this.formData.append('excel_file', this.import_data_file);
      this.helper.http
        .post('/api/admin/upload_header_data_excel', this.formData)
        .subscribe((res_data: any) => {
          if (res_data.success == false) {
            alert('Something went wrong!!');
          } else {
            alert('File headers loaded!');
            this.header_value = res_data.Header_Details;
            this.item_barcode_value = res_data.Header_Details;
            this.formData = new FormData();
            this.myLoading = false;
            jQuery('#remove').click();
            this.ngOnInit();
          }
        });
    } else {
      alert('Please Select File!!');
      return;
    }
  }

  //For Add Mapping Details
  add_mapping_details() {
    
    const filtered_headers = this.headers_data.filter(element => {
      // 👇️ using AND (&&) operator
      return element.key !=='' && element.value !=='' && element.type !=='';
    }); 
 
    // const filtered_headers= this.headers_data.filter(item => item.key)
     
  if (filtered_headers.length) {
      console.log(filtered_headers);
      this.header_details = filtered_headers.map((o) => {
        const value = this.header_value.findIndex((hdr) => hdr === o.value[0]);
        return {
          key: o.key[0].name,
          type: o.type[0].name,
          value,
        };
      });
      if (
        this.selectedItemKey &&
        this.selectedItemType &&
        this.selectedHeaderValue
      ) {
        let key = this.selectedItemKey;
        let type = this.selectedItemType;
        // let value = this.selectedItemValue;
        const value = this.header_value.findIndex(
          (h) => h === this.selectedItemValue[0]
        );
        this.filter = { key, type,value  };
      }
    }
    else{
      alert('Please Select Dropdown!!');
      return;
    }
    this.mappingModalRef.close();
  }

  get disableSubmit() {
    return !this.filter && !this.header_details;
  }

  //For Clear Inputs
  clearInput() {
    this.add_ftp_server = {
      host: '',
      port: '',
      user: '',
      password: '',
    };
    this.selectedItems = [];
  }
}
