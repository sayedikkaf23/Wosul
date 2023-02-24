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
}
