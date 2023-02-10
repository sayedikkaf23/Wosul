import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
//import { ModalService } from './modal.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  url = environment.serverUrl;
  constructor(private http: HttpClient) { }
  orderDetails = [];
  cartId;
  getCartCount;

  getTotalItemPrice(items) {
    let totalItemTax = 0;
    let totalItemPrice = 0;
    items.forEach((item) => {
      totalItemTax += item?.total_item_tax
        ? item?.total_item_tax * item?.quantity
        : 0;
      totalItemPrice += item?.price ? item?.price * item?.quantity : 0;
    });
    return [totalItemPrice, totalItemTax];
  }

  getTotalCartPrice(orderDetails = []) {
    let totalCartPrice = 0;
    orderDetails.forEach(det => {
      totalCartPrice += det?.total_item_price || 0
    });
    return totalCartPrice
  }

  get cartCount() {
    let count = 0;
    if (Array.isArray(this.orderDetails)) {
      this.orderDetails.forEach((prod) => {
        count += prod?.items?.length || 0;
      });

    }

    return count;
  }

  getDeliveryList(payload) {
    return this.http.post(
      `${this.url}v2/user/get_delivery_list_for_nearest_city`,
      payload
    );
  }

  getStoreList(payload) {
    return this.http.post(`${this.url}user/get_store_list`, payload);
  }

  getStoreDetails(payload) {
    return this.http.post(`${this.url}/api/user/get_store_details`, payload);
  }

  getStoreProductItemList(payload) {
    return this.http.post(
      `${this.url}/api/user/user_get_store_product_item_list`,
      payload
    );
  }

  getUserItems(payload) {
    return this.http.post(`${this.url}/api/user/user_get_items`, payload);
  }

  getCategoryList(payload) {
    return this.http.post(`${this.url}/api/user/get_category_list`, payload);
  }

  getCart(payload) {
    return this.http.post(`${this.url}user/get_cart`, payload).pipe(
      map((res: any) => {
        if (res.success) {
          res.cart.order_details = res?.cart?.order_details.map((o) => {
            const [totalItemPrice, totalItemTax] = this.getTotalItemPrice(
              o.items
            );
            o.product_id = o.product_detail?._id;
            o.product_name = o.product_detail?.name;
            o.total_item_tax = totalItemTax;
            o.total_item_price = totalItemPrice;
            o.unique_id = o.product_detail?.unique_id;
            delete o.product_detail;
            return o;
          });
          this.orderDetails = res.cart?.order_details;
          this.cartId = res.cart?._id;
        }
        return res;
      })
    );
  }

  createAndUpdateCart(payload) {
    return this.http.post(`${this.url}v2/user/create_and_update_cart`, payload);
  }

  clearCart(payload) {
    return this.http.post(`${this.url}user/clear_cart`, payload);
  }

  getRecommendedProduct(payload) {
    return this.http.post(`${this.url}user/get_recommended_products`, payload);
  }

  getStoreService(payload) {
    return this.http.post(`${this.url}/api/store/get_services`, payload);
  }
  
}
