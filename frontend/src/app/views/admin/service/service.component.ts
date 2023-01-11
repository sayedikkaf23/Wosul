import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Helper } from '../../helper';
import jQuery from 'jquery';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  providers: [Helper],
})
export class ServiceComponent implements OnInit {
  service_list: any[];
  title: any;
  button: any;
  heading_title: any;
  sort_field: string;
  sort_service: number;
  search_field: string;
  search_value: string;
  page: number;
  total_page: number;
  total_pages: number[];
  myLoading: boolean = true;

  constructor(public helper: Helper, public vcr: ViewContainerRef) {}
  activeRoute(routename: string): boolean {
    return this.helper.router.url.indexOf(routename) > -1;
  }
  ngAfterViewInit() {
    jQuery('.chosen-select').chosen({ disable_search: true });
    setTimeout(function () {
      jQuery('.chosen-select').trigger('chosen:updated');
    }, 1000);
  }

  ngOnInit() {
    this.helper.message();
    this.sort_field = 'unique_id';
    this.sort_service = -1;
    this.search_field = 'country_details.country_name';
    this.search_value = '';
    this.page = 1;

    this.filter(this.page);

    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
    this.service_list = [];
    jQuery(document.body)
      .find('#sort_field')
      .on('change', (evnt, res_data) => {
        this.sort_field = res_data.selected;
      });
    jQuery(document.body)
      .find('#sort_service')
      .on('change', (evnt, res_data) => {
        this.sort_service = res_data.selected;
      });
    jQuery(document.body)
      .find('#search_field')
      .on('change', (evnt, res_data) => {
        this.search_field = res_data.selected;
      });
  }

  filter(page) {
    this.page = page;
    this.myLoading = true;
    this.helper.http
      .post('/admin/service_list', {
        sort_field: this.sort_field,
        sort_service: this.sort_service,
        search_field: this.search_field,
        search_value: this.search_value,
        page: this.page,
      })
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;
          if (res_data.success == false) {
            this.service_list = [];
            this.total_pages = [];
          } else {
            this.service_list = res_data.service;
            this.total_page = res_data.pages;
            this.total_pages = Array(res_data.pages)
              .fill((x, i) => i)
              .map((x, i) => i + 1);
          }
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
  }

  editService(id) {
    this.helper.router_id.admin.service_id = id;
    this.helper.router.navigate(['admin/service/edit']);
  }
  viewServiceDetail(id) {
    this.helper.router_id.admin.service_id = id;
    this.helper.router.navigate(['admin/service/view_detail']);
  }

  change_default(index, event) {
    // if(event){
    this.helper.http
      .post('/admin/select_default_service', {
        service_id: this.service_list[index]._id,
        delivery_type_id: this.service_list[index].delivery_type_id,
        is_default: event,
        type_id: this.service_list[index].type_id,
        city_id: this.service_list[index].city_id,
      })
      .subscribe((res_data: any) => {
        this.filter(this.page);
      });
    // } else {
    //     this.service_list[index].is_default = true;
    // }
  }
}
