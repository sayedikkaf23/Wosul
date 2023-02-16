import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment.prod';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url = environment.serverUrl;
  public fingerPrint;

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

  logOut() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
