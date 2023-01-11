import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class ItemService {
    url = environment.serverUrl;

    constructor(private http: HttpClient) { }

    updateSubCategory(payload: any) {
        return this.http.post(`${this.url}/api/admin/update_item_subcategory`, payload).pipe(
            map((res: any) => {
                return res;
            })
        );
    }
}
