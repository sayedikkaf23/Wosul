import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Helper } from '../../helper';

@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.component.html',
  providers: [Helper],
})
export class VehicleComponent implements OnInit {
  vehicle_list: any[];
  title: any;
  button: any;
  heading_title: any;
  public message: string;
  public class: string;
  myLoading: boolean = true;
  constructor(public helper: Helper, public vcr: ViewContainerRef) {}
  activeRoute(routename: string): boolean {
    return this.helper.router.url.indexOf(routename) > -1;
  }

  ngOnInit() {
    this.helper.message();
    this.helper.http.get('admin/vehicle_list').subscribe((data: any) => {
      this.myLoading = false;
      if (data.success == false) {
        this.vehicle_list = [];
      } else {
        this.vehicle_list = data.vehicles;
      }
    });
    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
  }
  is_business_change(id, event) {
    this.helper.http
      .post('admin/vehicle_toggle_change', {
        vehicle_id: id,
        is_business: event,
      })
      .subscribe((res_data: any) => {
        if (res_data.success == false) {
        }
      });
  }
  editVehicle(id) {
    this.helper.router_id.admin.vehicle_id = id;
    this.helper.router.navigate(['admin/vehicle/edit']);
  }

  close() {
    this.message = '';
  }
}
