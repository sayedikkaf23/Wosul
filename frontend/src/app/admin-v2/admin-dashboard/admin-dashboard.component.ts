import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  //encapsulation: ViewEncapsulation.None,
})
export class AdminDashboardComponent implements OnInit {
  isLogoutShow: boolean = false;

  constructor() {}

  ngOnInit(): void {
    const bodyElement = document.body;
    bodyElement.classList.remove('add-order-page');
  }

  ngOnDestroy() {
    const bodyElement = document.body;
    bodyElement.classList.add('add-order-page');
  }
}
