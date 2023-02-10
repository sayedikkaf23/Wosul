import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';

export const itemsKeysToRemove = [
  '__v',
  'order_score',
  'search_score',
  'specifications_unique_id_count',
  'is_express_in_delivery',
  'is_recommend_in_store',
  'is_visible_in_store',
  'is_most_popular',
  'is_item_in_stock',
  'note_for_item',
  'in_cart_quantity',
  'offer_message_or_percentage',
  'current_substitute_item_id',
  'details_1',
  'super_item_id',
];

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.css'],
})
export class CreateOrderComponent implements OnInit {
  storeId;
  cartId;
  storesDetails;
  orderDetails: any = [];
  category: any = [];
  product: any = [];
  items: any = [];
  serviceDetails: any = [];
  selectedCategoryId = null;
  selectedProductId = null;
  selectedCategory = null;
  selectedProduct = null;
  selectedServiceId = null;
  itemPage = 1;
  itemsKeysToRemove = itemsKeysToRemove;

  constructor(private productService: ProductService) {}

  async ngOnInit() {
    //this.storeId = '63da5627424fc97416a971c7';
    const store = JSON.parse(localStorage.getItem('store'));
    this.storeId = store?._id;

    this.getStoreService(this.storeId);
    this.getCategoryList();
  }

  set categoryId(id) {
    this.selectedCategoryId = id;
    this.getStoreProductItemList();
  }

  setCategory(category) {
    this.selectedCategory = category;
    this.categoryId = category?._id;
  }

  setProduct(product) {
    this.selectedProduct = product;
    this.productId = product?._id;
  }

  getStoreService(store_id) {
    this.productService.getStoreService({ store_id }).subscribe({
      next: (res: any) => {
        this.serviceDetails = res?.data;
        this.selectedServiceId = this.serviceDetails?.[0]?._id;
      },
    });
  }

  selectedService(service) {
    this.selectedServiceId = service?._id;
  }

  set productId(id) {
    this.selectedProductId = id;
    this.getUserItems();
  }

  getStoreDetails() {
    this.productService.getStoreDetails({ store_id: this.storeId }).subscribe({
      next: (res: any) => {
        this.storesDetails = res.store_details;
      },
    });
  }

  getStoreProductItemList() {
    const payload = {
      store_id: this.storeId,
      // user_id: this.auth.user?._id,
      category_id: this.selectedCategoryId,
    };
    this.productService.getStoreProductItemList(payload).subscribe({
      next: (res: any) => {
        this.product = res.product;
        const [product] = this.product;
        this.setProduct(product);
      },
    });
  }

  getCategoryList() {
    const payload = {
      store_id: this.storeId,
    };
    this.productService.getCategoryList(payload).subscribe({
      next: (res: any) => {
        this.category = res.category;
        const [category] = this.category;
        this.setCategory(category);
      },
    });
  }

  getUserItems() {
    const payload = {
      store_id: this.storeId,
      //user_id: this.auth.user?._id,
      category_id: this.selectedCategoryId,
      product_id: this.selectedProductId,
      page: this.itemPage,
    };

    this.productService.getUserItems(payload).subscribe({
      next: (res: any) => {
        this.items = res.items;
      },
    });
  }

  getItem(id): number {
    let item = null;
    if (Array.isArray(this.orderDetails)) {
      this.orderDetails.forEach((prod) => {
        const _item = prod.items.find((i) => i._id === id);
        if (_item) item = _item;
      });
    }
    return item;
  }

  getTotalItemPrice(items) {
    return this.productService.getTotalItemPrice(items);
  }
}
