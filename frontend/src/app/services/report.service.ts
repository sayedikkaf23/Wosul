import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  url = environment.serverUrl;

  constructor(private http: HttpClient) {}

  getReports(payload) {
    return this.http.post(`${this.url}/admin/reports`, payload).pipe(
      map((res: any) => {
        res.data = res.data.map((s) => {
          s.store_name = s?.store_id?.name;
          return s;
        });
        return res;
      })
    );
  }
}
