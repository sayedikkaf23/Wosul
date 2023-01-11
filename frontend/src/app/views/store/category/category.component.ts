import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Helper } from '../../store_helper';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  providers: [Helper],
})
export class CategoryComponent implements OnInit {
  category_list: any[];
  title: any;
  button: any;
  store_id: Object;
  server_token: String;
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

    var store = JSON.parse(localStorage.getItem('store'));
    if (store !== null) {
      this.store_id = store._id;
      this.server_token = store.server_token;
    }

    this.helper.http
      .post(this.helper.POST_METHOD.GET_CATEGORY_LIST, {
        store_id: this.store_id,
        server_token: this.server_token,
      })
      .subscribe((data: any) => {
        this.myLoading = false;
        if (data.success == false) {
          this.category_list = [];
        } else {
          this.category_list = data.category;
        }
      });
    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
  }

  is_visible_in_store(category_data, event) {
    var json = {
      store_id: this.store_id,
      category_id: category_data._id,
      server_token: this.server_token,
      is_visible_in_store: event,
      name: category_data.name,
    };
    category_data.is_visible_in_store = event;
    this.myLoading = true;
    this.helper.http
      .post(this.helper.POST_METHOD.UPDATE_CATEGORY, json)
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;
          if (res_data.success == true) {
            this.helper.data.storage = {
              message: this.helper.MESSAGE_CODE[res_data.message],
              class: 'alert-info',
            };
          } else {
            this.helper.data.storage = {
              code: res_data.error_code,
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

  editCategory(id) {
    this.helper.router_id.store.category_id = id;

    console.log('editCategory(id) {');
    console.log('this.helper.router_id.store.category_id');
    console.log(this.helper.router_id.store.category_id);

    this.helper.router.navigate(['store/category/edit']);
  }

  close() {
    this.message = '';
  }
}
