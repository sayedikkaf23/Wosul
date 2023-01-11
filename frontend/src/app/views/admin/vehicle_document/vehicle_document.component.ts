import { Component, OnInit, ViewContainerRef } from '@angular/core';

import { Helper } from '../../helper';
import jQuery from 'jquery';

@Component({
  selector: 'app-vehicle_document',
  templateUrl: './vehicle_document.component.html',
  providers: [Helper],
})
export class VehicleDocumentComponent implements OnInit {
  title: any;
  button: any;
  heading_title: any;
  vehicle_list: any[];
  provider_id: Object;
  myLoading: boolean = true;

  constructor(public helper: Helper, public vcr: ViewContainerRef) {}
  ngAfterViewInit() {
    jQuery('.chosen-select').chosen({ disable_search: true });
    setTimeout(function () {
      jQuery('.chosen-select').trigger('chosen:updated');
    }, 1000);
  }

  ngOnInit() {
    this.provider_id = this.helper.router_id.admin.provider_vehicle_id;
    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
    this.title = this.helper.title;
    this.vehicle_list = [];
    //this.provider_vehicle();
  }

  //    provider_vehicle() {
  //        this.myLoading = true;
  //        this.helper.http.post('/admin/provider_vehicle_list', {
  //            provider_id: this.provider_id
  //        }).subscribe((res_data:any) => {
  //            this.myLoading = false;
  //            if (res_data.success == false) {
  //                this.vehicle_list = [];
  //            }
  //            else {
  //                this.vehicle_list = res_data.provider.provider_vehicle_detail;
  //            }
  //        },
  //            (error: any) => {
  //                this.myLoading = false;
  //                this.helper.http_status(error)
  //            });
  //    }
}
