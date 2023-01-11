import { Component, OnInit } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
 
import { Helper } from '../../helper';
declare var swal: any;
@Component({
  selector: 'app-add-tags',
  templateUrl: './add-tags.component.html',
  styleUrls: ['./add-tags.component.css'],
})
export class AddTagsComponent implements OnInit {
  dropdownList = [];
  selectedItems = [];
  dropdownSettings: IDropdownSettings;
  search_value;
  isAddTag: Boolean = false;
  newTags: any = '';
  searchValue: any;
  myLoading: boolean = false;
  page: number = 1;
  isPageDisabled = false;
  openDropdown = false;
  constructor(public helper: Helper) {}

  ngOnInit() {
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'tags',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true,
    };
  }
  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
  searchItems() {
    this.myLoading = true;
    let data = {
      search_value: this.search_value,
      page: this.page,
    };
    this.helper.http.post(  '/api/user/search_items_tags', data).subscribe(
      (data: any) => {
        console.log('data :>> ', data);
        if (data.success) {
          this.dropdownList = data.items;
          this.myLoading = false;
          this.openDropdown = true;
          if (this.dropdownList.length == 0) {
            this.helper.data.storage = {
              message: 'No Item Found',
              class: 'alert-danger',
            };
            this.helper.message();
          }
        } else {
          this.myLoading = false;
        }
      },
      (error: any) => {
        this.myLoading = false;
        this.helper.http_status(error);
      }
    );
  }
  updatTag() {
    if (this.selectedItems.length == 0 || this.newTags == '') {
      this.helper.data.storage = {
        message: 'Please select Items and Add Suitable tag',
        class: 'alert-danger',
      };
      this.helper.message();
      return;
    }
    let data = {
      items: this.selectedItems,
      isAddTag: this.isAddTag,
      tags: this.newTags,
    };
    console.log('data :>> ', data);
    swal({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Update it!',
    })
      .then((proceed) => {
        if (proceed) {
          this.myLoading = true;
          this.isAddTag = false;
          this.helper.http.post(  '/api/user/update_search_tags', data).subscribe(
            (data: any) => {
              if (data.success) {
                this.myLoading = false;
                this.newTags = '';
                this.selectedItems = [];
                this.dropdownList = [];
                this.search_value = '';
                swal('Updated!', `${data.message}`, 'success');
              } else {
                this.myLoading = false;
              }
            },
            (error: any) => {
              this.myLoading = false;
              this.helper.http_status(error);
            }
          );
        }
      })
      .catch(swal.noop);
  }
}
