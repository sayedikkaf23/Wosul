import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

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

  constructor(
    private router: Router,
    public authService: AuthService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const bodyElement = document.body;
    bodyElement.classList.remove('add-order-page');
    this.checkAdminTyp();
    this.getSettingDetails();
  }

  checkAdminTyp() {
    let admin_id = localStorage.getItem('admin_id');
    let admin_token = localStorage.getItem('admin_token');

    this.authService
      .checkAuth({ admin_id: admin_id, admin_token: admin_token })
      .subscribe((data: any) => {
        if (data.success) {
        } else {
          console.log('data :>> ', data);
        }
      });
  }

  getSettingDetails() {
    this.authService.getSettingDetail({}).subscribe((res_data: any) => {});
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

  toggleDarkMode() {
    const bodyElement = document.body;
    if (!bodyElement.classList.contains('dark-active')) {
      bodyElement.classList.add('dark-active');
    } else {
      bodyElement.classList.remove('dark-active');
    }
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
    localStorage.setItem('admin_id', '');
    localStorage.setItem('admin_token', '');
    this.router.navigate(['admin/login']);
  }

  ngAfterContentChecked(): void {
    this.cdRef.detectChanges();
  }

  get isHeaderShow() {
    return this.authService.isHeaderShow;
  }
}
