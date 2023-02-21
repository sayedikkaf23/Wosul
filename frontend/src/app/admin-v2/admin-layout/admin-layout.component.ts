import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AdminLayoutComponent implements OnInit {
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

  logout() {
    localStorage.clear();
    this.router.navigate(['admin/login']);
  }
}
