import { Component, OnInit, ViewChild } from '@angular/core';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.css'],
})
export class InventoryListComponent implements OnInit {
  store_id: any;
  category_list: any = [];
  selected_category: any;
  product_item_list: any = [];
  category_name: any;
  constructor(private storeService: StoreService) {}

  ngOnInit(): void {
    const store = JSON.parse(localStorage.getItem('store'));
    this.store_id = store?._id;
    this.getCategoryList();
  }

  getCategoryList() {
    const payload = {
      store_id: this.store_id,
    };
    this.storeService.getAdminStoreCategory(payload).subscribe({
      next: (res: any) => {
        this.category_list = res.category;
      },
    });
  }

  getStoreProductItem() {
    const payload = {
      store_id: this.store_id,
      category_id: this.selected_category,
      type: 1,
    };
    this.storeService.getStoreProductItemList(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.product_item_list = res.products[0]?.items;
        }
      },
    });
  }

  onCategoryChange(category_id) {
    this.selected_category = category_id;
    if (this.category_list.length) {
      const category = this.category_list.filter(
        (cat) => cat._id == category_id
      );
      this.category_name = category[0]?.name;
    }
    this.getStoreProductItem();
  }
}
