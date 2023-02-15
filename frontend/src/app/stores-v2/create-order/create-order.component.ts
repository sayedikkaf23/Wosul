import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
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
  @ViewChild('itemDetails') itemModal: any;
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

  constructor(
    private productService: ProductService,
    private modalService: NgbModal,
    private activeModal: NgbActiveModal
  ) {}

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

  get totalCartPrice() {
    return [1, 1];
  }

  get pickupAddresses() {
    const store = JSON.parse(localStorage.getItem('store'));
    return store?.address;
  }

  addItem(item) {
    const prodIdx = this.orderDetails.findIndex(
      (p) => p.product_id === this.selectedProductId
    );

    this.itemsKeysToRemove.forEach((key) => delete item[key]);

    if (prodIdx != -1) {
      const itmIdx = this.orderDetails[prodIdx].items.findIndex(
        (i) => i._id === item._id
      );

      if (itmIdx != -1) {
        this.orderDetails[prodIdx].items[itmIdx].quantity++;
      } else {
        item.quantity = 1;
        this.orderDetails[prodIdx].items.push(item);
      }

      const items = this.orderDetails[prodIdx].items;
      const [totalItemPrice, totalItemTax] = this.getTotalItemPrice(items);
      this.orderDetails[prodIdx].total_item_tax = totalItemTax;
      this.orderDetails[prodIdx].total_item_price = totalItemPrice;
    } else {
      item.quantity = 1;
      this.orderDetails.push({
        product_id: this.selectedProductId,
        product_name: this.selectedProduct?.name,
        total_item_tax: item?.total_item_tax || 0,
        total_item_price: item?.price,
        unique_id: this.selectedProduct?.unique_id,
        items: [item],
      });
    }
    this.createAndUpdateCart(this.orderDetails);
  }

  createAndUpdateCart(orderDetails) {
    const [totalCartPrice, totalItemTax] = this.totalCartPrice;
    const payload = {
      total_cart_price: totalCartPrice,
      total_item_tax: totalItemTax,
      // destination_addresses: this.destinationAddresses,
      destination_addresses: 'Business Bay',
      min_order_price: 0,
      //pickup_addresses: this.pickupAddresses,
      order_details: orderDetails,
      store_id: this.storeId,
      //user_id: this.auth.user?._id,
      // user_type: 7,
    };
    this.productService.createAndUpdateCart(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          const cart = res.new_cart || res.cart;
          this.orderDetails = cart?.order_details;
          this.cartId = cart._id;
          this.productService.orderDetails = this.orderDetails;
        }
      },
    });
    localStorage.cartCount = this.productService.cartCount;
  }

  openItemModal(item: any) {
    this.modalService.open(this.itemModal);
  }

  getTotalItemPrice(items) {
    return this.productService.getTotalItemPrice(items);
  }
}
