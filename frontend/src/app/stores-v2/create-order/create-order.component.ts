import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/services/auth.service';
import { ProductService } from 'src/app/services/product.service';
import { StoreService } from 'src/app/services/store.service';

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
  @ViewChild('cartBox') cartBox: ElementRef;

  storeId;
  cartId;
  cartToken: any;
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
  selected_product_id: any = '';

  constructor(
    private productService: ProductService,
    private modalService: NgbModal,
    private activeModal: NgbActiveModal,
    private authService: AuthService,
    private storeService: StoreService
  ) {}

  async ngOnInit() {
    //this.storeId = '63da5627424fc97416a971c7';
    const store = JSON.parse(localStorage.getItem('store'));
    this.storeId = store?._id;

    this.getStoreService(this.storeId);
    this.getCategoryList();
    this.getStoreDetails();
  }

  set categoryId(id) {
    this.selectedCategoryId = id;
  }

  async getCartToken() {
    this.cartToken = await this.authService.cartToken;
  }

  getProductByCategory() {
    const payload = {
      category_id: this.selectedCategoryId,
      store_id: this.storeId,
    };
    this.storeService.getProductByCategory(payload).subscribe((res: any) => {
      if (res.product) {
        this.selectedProductId = res?.product?._id;
        this.getUserItems();
      } else {
        this.items = [];
      }
    });
  }

  setCategory(category) {
    this.selectedCategory = category;
    this.categoryId = category?._id;
    this.getProductByCategory();
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
      search_value: '',
    };
    this.storeService.getAdminStoreProducts(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.product = res.products;

          //const [product] = this.product;
          //this.setProduct(product);
        }
      },
    });
  }

  getCategoryList() {
    const payload = {
      store_id: this.storeId,
    };
    this.storeService.getAdminStoreCategory(payload).subscribe({
      next: (res: any) => {
        this.category = res.category;
        const [category] = this.category;
        this.setCategory(category);
        this.getProductByCategory();
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

  async addItem(item) {
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
    await this.getCartToken();
    this.createAndUpdateCart(this.orderDetails);
    // await this.scroll();
  }

  createAndUpdateCart(orderDetails) {
    const [totalCartPrice, totalItemTax] = this.totalCartPrice;
    const payload = {
      total_cart_price: totalCartPrice,
      total_item_tax: totalItemTax,
      cart_unique_token: this.cartToken,
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

  minusItem(item) {
    if (Array.isArray(this.orderDetails)) {
      this.orderDetails.forEach((prod) => {
        let _item = prod.items.find((i) => i._id === item._id);
        if (_item) _item.quantity = _item.quantity - 1;
        if (_item && _item.quantity < 1) {
          prod.items = prod.items.filter((i) => i._id !== item._id);
        }
      });
      this.orderDetails = this.orderDetails.filter((o) => o.items?.length > 0);
      if (this.orderDetails?.length) {
        this.createAndUpdateCart(this.orderDetails);
      } else {
        this.clearCart();
      }
    }
  }

  clearCart() {
    const payload = {
      // user_id: this.auth.user?._id,
      cart_id: this.cartId,
    };
    this.productService.clearCart(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.orderDetails = [];
        }
      },
    });
  }

  getCart() {
    const payload = {
      // user_id: this.auth.user?._id,
      cart_unique_token: this.cartToken,
    };
    this.productService.getCart(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.cartId = res?.cart_id || res?.cart?._id;
          this.orderDetails = res?.cart?.order_details;
        }
      },
    });
  }

  remove(item) {
    item.quantity = 1;
    this.minusItem(item);
  }

  scroll() {
    setTimeout(() => {
      this.cartBox.nativeElement.scroll(0, 99999999);
    }, 500);
  }

  openItemModal(item: any) {
    this.modalService.open(this.itemModal);
  }

  getTotalItemPrice(items) {
    return this.productService.getTotalItemPrice(items);
  }

  isItemInCart(item) {
    return this.getItem(item?._id);
  }
}
