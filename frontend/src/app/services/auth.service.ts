import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
//import { environment } from 'src/environments/environment.prod';
import { environment } from 'src/environments/environment';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url = environment.serverUrl;
  public fingerPrint;

  public isHeaderShow: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  get token() {
    return localStorage.getItem('admin_token');
  }

  public async getFingerPrint() {
    const fp = await FingerprintJS.load();
    const visitorId = (await fp.get()).visitorId;
    this.fingerPrint = visitorId;
    return this.fingerPrint;
  }

  get cartToken() {
    return this.getFingerPrint();
  }

  setAuthStorage(adminDetails: any) {
    localStorage.setItem('admin_id', adminDetails.admin_data._id);
    localStorage.setItem('admin_token', adminDetails.admin_data.server_token);
  }

  getToken() {
    return this.token;
  }

  setStoreToken(token) {
    localStorage.setItem('admin_token', token);
  }

  checkAuth(payload) {
    return this.http.post(`${this.url}/admin/check_auth`, payload);
  }

  getSettingDetail(payload) {
    return this.http.post(`${this.url}/api/admin/get_setting_detail`, payload);
  }

  login(payload) {
    return this.http.post(`${this.url}/login`, payload);
  }

  storeLogin(payload) {
    return this.http.post(`${this.url}/api/store/login`, payload);
  }

  logOut() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
