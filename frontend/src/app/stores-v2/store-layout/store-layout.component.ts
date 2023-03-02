import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Helper } from 'src/app/views/store_helper';

import '../../../assets/js/custom.js';

@Component({
  selector: 'app-store-layout',
  templateUrl: './store-layout.component.html',
  styleUrls: ['./store-layout.component.css'],
  providers: [Helper],
  encapsulation: ViewEncapsulation.None,
})
export class StoreLayoutComponent implements OnInit {
  isLogoutShow: boolean = false;

  constructor(private router: Router, public helper: Helper) {}

  ngOnInit(): void {}

  logout() {
    // localStorage.clear();
    this.helper.removeToken();
    localStorage.removeItem('store');
    location.href = '/store/login';
    // this.router.navigate(['store/login']);
  }
}
