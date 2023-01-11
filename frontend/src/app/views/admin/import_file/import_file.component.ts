import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';

import { Helper } from '../../helper';
import jQuery from 'jquery';

export interface ImportFile {
  image_url: any;
}

@Component({
  selector: 'app-import_file',
  templateUrl: './import_file.component.html',
  providers: [Helper],
})
export class ImportFileComponent implements OnInit {
  public add_vehicle: ImportFile;
  title: any;
  button: any;
  heading_title: any;
  validation_message: any;
  vehicle_id: Object;
  vehicle_exist: any;
  vehicle_list: any[];

  error: any;
  type: String;
  myLoading: boolean = false;
  image_error: string = '';
  image_file: string = '';
  map_pin_image_error: string = '';
  data: any;
  success: any;

  constructor(public helper: Helper, vcr: ViewContainerRef) {
    this.data = {};
  }

  ngAfterViewInit() {
    jQuery(document).ready(function (jQ) {
      jQ('#vehicle').chosen();
      jQ('#vehicle').trigger('chosen:updated');
    });
  }
  ngOnDestroy() {
    this.helper.router_id.admin.vehicle_id = '';
  }

  ngOnInit() {
    this.add_vehicle = {
      image_url: './plus_box.png',
    };
    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
    this.validation_message = this.helper.validation_message;
  }
  public formData = new FormData();
  main_image_update($event) {
    this.image_error = '';
    const files = $event.target.files || $event.srcElement.files;
    const image_url = files[0];
    this.image_file = files[0];
  }

  addVehicle(vehicle_data) {
    if (this.image_file == '') {
      this.myLoading = false;
      this.image_error = 'Please select file';
      return;
    }
    this.image_error = '';
    this.success = '';
    this.error = '';
    this.myLoading = true;
    this.formData.append('file', this.image_file);
    this.helper.http
      .post('/api/admin/set_product_images_from_excel', this.formData)
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;
          this.image_file = '';
          if (res_data.success == false) {
            this.helper.data.storage = {
              message: this.helper.ERROR_CODE[res_data.error_code],
              class: 'alert-danger',
            };
            this.error = 'Something went wrong';
          } else {
            this.helper.data.storage = {
              message: this.helper.MESSAGE_CODE[res_data.message],
              class: 'alert-info',
            };
            this.success = res_data.msg;
          }
          this.helper.router.navigate(['admin/product_csv']);
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
  }
}
