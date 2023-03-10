import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalManager } from 'ngb-modal';
import { ImageCropperComponent, CropperSettings } from 'ngx-img-cropper';
import { StoreService } from 'src/app/services/store.service';
import { Helper } from 'src/app/views/store_helper';

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
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css'],
  providers: [Helper],
})
export class CategoryListComponent implements OnInit {
  @ViewChild('addCategory') addCategory;
  private modalRef;
  store_id: any;
  category_list: any = [];
  selected_category: any;

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
  //category_list: any[];

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
    private storeService: StoreService,
    private modalService: ModalManager
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

  ngOnInit(): void {
    const store = JSON.parse(localStorage.getItem('store'));
    this.store_id = store?._id;
    this.getCategoryList();
    this.getAdminImageSetting();
  }

  getCategoryList() {
    const payload = {
      store_id: this.store_id,
    };
    this.storeService.getAdminStoreCategory(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.category_list = res.category;
        }
      },
    });
  }

  getAdminImageSetting() {
    this.storeService
      .getAdminImageSetting({
        type: this.helper.ADMIN_DATA_ID.ADMIN,
      })
      .subscribe(
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
  }

  openCategoryModal() {
    this.modalRef = this.modalService.open(this.addCategory, {
      size: 'lg',
      modalClass: 'mymodal',
      hideCloseButton: true,
      centered: false,
      backdrop: true,
      animation: true,
      keyboard: false,
      closeOnOutsideClick: true,
      backdropClass: 'modal-backdrop',
    });
  }

  closeCategoryModal() {
    this.modalService.close(this.modalRef);
    //or this.modalRef.close();
  }
}
