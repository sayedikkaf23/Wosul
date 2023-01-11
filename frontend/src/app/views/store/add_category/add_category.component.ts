import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';

import { Helper } from '../../store_helper';
import jQuery from 'jquery';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ImageCropperComponent,
  CropperSettings,
  Bounds,
} from 'ngx-img-cropper';
 

export interface AddCategory {
  name: String;
  is_visible_in_store: Boolean;
  is_special_category: Boolean;
  store_id: any;
  server_token: String;
  sequence_number: number;
  image_url: String;
}

export interface imageSetting {
  image_ratio: number;
  image_min_width: number;
  image_max_width: number;
  image_min_height: number;
  image_max_height: number;
  image_type: any[];
}

@Component({
  selector: 'app-add_category',
  templateUrl: './add_category.component.html',
  providers: [Helper],
})
export class AddCategoryComponent implements OnInit {
  @ViewChild('image_crop_modal')
  image_crop_modal: any;
  @ViewChild('cropper', undefined)
  cropper: ImageCropperComponent;

  @ViewChild('map_pin_image_crop_modal')
  map_pin_image_crop_modal: any;
  @ViewChild('cropper_map_pin', undefined)
  cropper_map_pin: ImageCropperComponent;

  public add_category: AddCategory;
  public image_setting: imageSetting;
  title: any;
  button: any;
  heading_title: any;
  validation_message: any;
  category_id: Object;
  category_exist: any;
  category_list: any[];

  error: any;
  type: String;
  myLoading: boolean = false;
  image_error: string = '';
  map_pin_image_error: string = '';

  data: any;
  map_pin_data: any;

  cropperSettings: CropperSettings;
  cropperMapPinSettings: CropperSettings;

  constructor(
    public helper: Helper,
    private modalService: NgbModal,
    private activeModal: NgbActiveModal
  ) {
    this.cropperSettings = new CropperSettings();
    this.cropperSettings.canvasWidth = 400;
    this.cropperSettings.canvasHeight = 400;
    this.cropperSettings.noFileInput = true;
    this.cropperSettings.preserveSize = true;
    this.cropperSettings.height = 200;
    this.cropperSettings.width =
      this.cropperSettings.height * this.helper.image_ratio.PRODUCT_IMAGE;

    this.data = {};
  }

  ngAfterViewInit() {
    jQuery(document).ready(function (jQ) {
      jQ('#category').chosen();
      jQ('#category').trigger('chosen:updated');
    });
  }
  ngOnDestroy() {
    this.helper.router_id.store.category_id = '';
  }

  ngOnInit() {
    this.add_category = {
      name: '',
      store_id: '',
      server_token: '',
      sequence_number: 0,
      image_url: './plus_box.png',
      is_visible_in_store: true,
      is_special_category: false,
    };

    this.image_setting = {
      image_ratio: 1,
      image_min_width: 100,
      image_max_width: 100,
      image_min_height: 100,
      image_max_height: 100,
      image_type: [],
    };

    this.category_id = this.helper.router_id.store.category_id;

    var store = JSON.parse(localStorage.getItem('store'));
    if (store !== null) {
      this.add_category.store_id = store._id;
      this.add_category.server_token = store.server_token;
    }

    this.helper.http.post(  '/api/admin/get_image_setting', {}).subscribe(
      (res_data: any) => {
        this.image_setting.image_ratio =
          res_data.image_setting.product_image_ratio;
        this.image_setting.image_min_width =
          res_data.image_setting.product_image_min_width;
        this.image_setting.image_max_width =
          res_data.image_setting.product_image_max_width;
        this.image_setting.image_min_height =
          res_data.image_setting.product_image_min_height;
        this.image_setting.image_max_height =
          res_data.image_setting.product_image_max_height;
        this.image_setting.image_type = res_data.image_setting.image_type;

        setTimeout(() => {
          this.cropperSettings.width =
            this.cropperSettings.height *
            res_data.image_setting.product_image_ratio;
        }, 1000);
      },
      (error: any) => {
        this.myLoading = false;
        this.helper.http_status(error);
      }
    );

    console.log('this.category_id');
    console.log(this.category_id);

    if (
      this.category_id == undefined ||
      this.category_id == null ||
      this.category_id == ''
    ) {
      this.type = 'add';

      this.helper.http
        .post(this.helper.POST_METHOD.GET_CATEGORY_LIST, {
          store_id: this.add_category.store_id,
          server_token: this.add_category.server_token,
        })
        .subscribe((res: any) => {
          this.category_list = res.category;
        });
      this.category_exist = '';
    } else {
      jQuery('#add').hide();
      this.type = 'edit';
      this.helper.http
        .post(this.helper.POST_METHOD.GET_CATEGORY_DETAIL, {
          category_id: this.category_id,
          store_id: this.add_category.store_id,
          server_token: this.add_category.server_token,
        })
        .subscribe((res_data: any) => {
          console.log(this.helper.POST_METHOD.GET_CATEGORY_DETAIL);

          if (res_data.success == false) {
            this.helper.data.storage = {
              message: this.helper.ERROR_CODE[res_data.error_code],
              class: 'alert-danger',
            };
            this.helper.router.navigate(['store/category']);
          } else {
            this.add_category.name = res_data.category.name;
            this.add_category.is_special_category = res_data.category.is_special_category;
            this.add_category.sequence_number =
              res_data.category.sequence_number;
            this.add_category.image_url = res_data.category.image_url;
            this.add_category.is_visible_in_store =
              res_data.category.is_visible_in_store;
          }
        });
    }
    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
    this.validation_message = this.helper.validation_message;
  }

  public formData = new FormData();
  remove_new_image(url) {
    this.add_category.image_url = ''
  }
  main_image_update($event) {
    this.image_error = '';

    const files = $event.target.files || $event.srcElement.files;
    const image_url = files[0];
    var index = this.image_setting.image_type.indexOf(image_url.type);
    if (index !== -1) {
      var reader = new FileReader();
      reader.onload = (e: any) => {
        var new_image = new Image();
        new_image.src = e.target.result;
        // this.cropper.setImage(new_image);
        this.add_category.image_url = e.target.result;
        this.formData.append('image_url', image_url);
        // new_image.onload = () => {
        //   if (
        //     new_image.width >= this.image_setting.image_min_width &&
        //     new_image.width <= this.image_setting.image_max_width &&
        //     new_image.height >= this.image_setting.image_min_height &&
        //     new_image.height <= this.image_setting.image_max_height
        //   ) {
        //     if (
        //       new_image.width ==
        //       new_image.height * this.image_setting.image_ratio
        //     ) {
        //       this.add_category.image_url = e.target.result;
        //       this.formData.append('image_url', image_url);
        //     } else {
        //       this.modalService.open(this.image_crop_modal);
        //       this.image_error = this.title.category_image_ratio_error;
        //     }
        //   } else {
        //     this.image_error = this.title.category_image_size_error;
        //     this.modalService.open(this.image_crop_modal);
        //   }
        // };
      };
      reader.readAsDataURL(image_url);
    } else {
      jQuery('#remove').click();
      this.image_error = this.title.category_image_extension_error;
    }
  }

  crop($event) {
    this.image_error = '';
    function dataURLtoFile(dataurl, filename) {
      var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    }
    let image_type = this.image_setting.image_type;
    image_type = image_type[0].split('/');
    var image_url = dataURLtoFile(
      this.cropper.image.image,
      'image.' + image_type[0]
    );

    var reader = new FileReader();
    reader.onload = (e: any) => {
      var new_image = new Image();
      new_image.src = e.target.result;
      // this.cropper.setImage(new_image);
      new_image.onload = () => {
        if (
          new_image.width >= this.image_setting.image_min_width &&
          new_image.width <= this.image_setting.image_max_width &&
          new_image.height >= this.image_setting.image_min_height &&
          new_image.height <= this.image_setting.image_max_height
        ) {
          this.add_category.image_url = e.target.result;
          this.formData.append('image_url', image_url);
          this.activeModal.close();
        } else {
          this.image_error = this.title.vehicle_image_size_error;
        }
      };
    };
    reader.readAsDataURL(image_url);
  }

  addCategory(category_data) {
    if (this.type == 'add') {
      this.myLoading = true;
      this.formData.append('name', category_data.name);
      this.formData.append('store_id', category_data.store_id);
    this.formData.append('is_special_category', category_data.is_special_category);
    this.formData.append('sequence_number', category_data.sequence_number);
      this.formData.append('server_token', category_data.server_token);
      this.formData.append(
        'is_visible_in_store',
        category_data.is_visible_in_store
      );

      this.helper.http
        .post(this.helper.POST_METHOD.ADD_CATEGORY, this.formData)
        .subscribe(
          (res_data: any) => {
            this.myLoading = false;
            if (res_data.success == false) {
              this.helper.data.storage = {
                message: this.helper.ERROR_CODE[res_data.error_code],
                class: 'alert-danger',
              };
            } else {
              this.helper.data.storage = {
                message: 'Category Add Successfully',
                class: 'alert-info',
              };
            }
            this.helper.router.navigate(['store/category']);
          },
          (error: any) => {
            this.myLoading = false;
            this.helper.http_status(error);
          }
        );
    } else {
      this.updateCategory(category_data);
    }
  }

  updateCategory(category_data) {
    console.log(category_data);

    this.myLoading = true;

    this.formData.append('name', category_data.name);
    this.formData.append(
      'is_visible_in_store',
      category_data.is_visible_in_store
    );
    this.formData.append('category_id', category_data.category_id);
    this.formData.append('is_special_category', category_data.is_special_category);
    this.formData.append('sequence_number', category_data.sequence_number);
    this.formData.append('store_id', category_data.store_id);
    this.formData.append('server_token', category_data.server_token);

    this.helper.http
      .post(this.helper.POST_METHOD.UPDATE_CATEGORY, this.formData)
      .subscribe(
        (res_data: any) => {
          this.myLoading = false;
          if (res_data.success == false) {
            this.helper.data.storage = {
              message: this.helper.ERROR_CODE[res_data.error_code],
              class: 'alert-danger',
            };
          } else {
            this.helper.data.storage = {
              message: this.helper.MESSAGE_CODE[res_data.message],
              class: 'alert-info',
            };
          }
          this.helper.router.navigate(['store/category']);
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
  }
}
