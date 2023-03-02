import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  url = environment.serverUrl;

  constructor(private http: HttpClient) {}

  getStoreOrders(payload) {
    return this.http.post(
      `${this.url}/api/store/order_list_search_sort`,
      payload
    );
  }

  setOrderStatus(payload) {
    return this.http.post(`${this.url}/api/store/set_order_status`, payload);
  }

  storeHistory(payload) {
    return this.http.post(`${this.url}/api/admin/history_v2`, payload);
  }

  getSubStoreList(payload) {
    return this.http.post(`${this.url}/admin/get_main_store_list`, payload);
  }

  storeListSearchSort(payload) {
    return this.http.post(`${this.url}/admin/store_list_search_sort`, payload);
  }

  getAdminStoreProducts(payload) {
    return this.http.post(`${this.url}/api/store/get_product_list`, payload);
  }

  getAdminStoreCategory(payload) {
    return this.http.post(`${this.url}/api/store/get_category_list`, payload);
  }

  getAdminStoreSpecificationGroup(payload) {
    return this.http.post(
      `${this.url}/api/store/get_specification_group`,
      payload
    );
  }

  getAdminImageSetting(payload) {
    return this.http.post(`${this.url}/api/admin/get_image_setting`, payload);
  }

  getAdminStoreProductItem(payload) {
    return this.http.post(
      `${this.url}/api/store/get_store_product_item_list`,
      payload
    );
  }

  addStoreProduct(payload) {
    return this.http.post(`${this.url}/api/store/add_product`, payload);
  }

  addStoreItem(payload) {
    return this.http.post(`${this.url}/api/store/add_item`, payload);
  }

  updateStoreItem(payload) {
    return this.http.post(`${this.url}/api/store/update_item`, payload);
  }

  updateStoreItemImage(payload) {
    return this.http.post(`${this.url}/api/store/update_item_image`, payload);
  }

  deleteStoreItemImage(payload) {
    return this.http.post(`${this.url}/api/store/delete_item_image`, payload);
  }

  deleteStoreProduct(payload) {
    return this.http.post(`${this.url}/api/store/delete_product`, payload);
  }

  deleteStoreItem(payload) {
    return this.http.post(`${this.url}/api/store/delete_item`, payload);
  }
}
