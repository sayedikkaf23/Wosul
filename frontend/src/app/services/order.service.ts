import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  url = environment.serverUrl;

  constructor(private http: HttpClient) {}

  setDeliveryIn(payload: any) {
    return this.http.post(`${this.url}/api/store/set_deliver_in`, payload).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getDeliveryList() {
    return this.http.get(`${this.url}/admin/get_delivery_boys`);
  }

  addDeliveryBoy(payload: any) {
    return this.http.post(`${this.url}/admin/add_delivery_boy`, payload);
  }
  
  updateDeliveryBoy(payload: any) {
    return this.http.post(`${this.url}/admin/update_delivery_boy`, payload);
  }

  getCardList(payload: any) {
    return this.http.post(`${this.url}/api/user/get_card_list`, payload);
  }

  deductPaymentByCard(payload: any) {
    return this.http.post(`${this.url}/api/user/card_online_payment`, payload);
  }

}
