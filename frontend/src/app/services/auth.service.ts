import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url = environment.serverUrl;

  constructor(private http: HttpClient, private router: Router) {}

  get token() {
    return localStorage.getItem('hash');
  }

  setAuthStorage(adminDetails: any) {
    localStorage.setItem('id', adminDetails.admin_data._id);
    localStorage.setItem('hash', adminDetails.admin_data.server_token);
  }

  getToken() {
    return this.token;
  }

  logOut() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
