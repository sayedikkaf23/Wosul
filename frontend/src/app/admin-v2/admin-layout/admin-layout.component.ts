import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AdminLayoutComponent implements OnInit {
  isActive: boolean = false;

  searchOptions = [
    { id: 1, name: 'option 2' },
    { id: 2, name: 'option 3' },
    { id: 3, name: 'option 4' },
    { id: 4, name: 'option 5' },
  ];

  reportOptions = [
    { id: 1, name: 'option 2' },
    { id: 2, name: 'option 3' },
    { id: 3, name: 'option 4' },
    { id: 4, name: 'option 5' },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    const bodyElement = document.body;
    bodyElement.classList.remove('add-order-page');
  }

  toggleSideBar() {
    const bodyElement = document.body;
    if (!bodyElement.classList.contains('sidebar-collapsein')) {
      bodyElement.classList.add('sidebar-collapsein');
    } else {
      bodyElement.classList.remove('sidebar-collapsein');
    }
  }

  toggleActive() {
    this.isActive = !this.isActive;
  }

  order() {
    this.isActive = !this.isActive;
    this.router.navigate(['admin/orders']);
  }

  history() {
    this.isActive = !this.isActive;
    this.router.navigate(['admin/history']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['admin/login']);
  }
}
