import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-store-layout',
  templateUrl: './store-layout.component.html',
  styleUrls: ['./store-layout.component.css'],
})
export class StoreLayoutComponent implements OnInit {
  isLogoutShow: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  logout() {
    localStorage.clear();
    this.router.navigate(['store/login']);
  }
}
