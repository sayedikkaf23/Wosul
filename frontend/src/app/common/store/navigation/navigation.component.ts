import { Component, Input } from '@angular/core';
import { Helper } from '../../../views/store_helper';
import event = google.maps.event;

import jQuery from 'jquery';

@Component({
  selector: 'navigation',
  templateUrl: 'navigation.template.html',
  providers: [Helper],
})
export class NavigationComponent {
  menu_title: any;
  is_store_can_add_provider: boolean = false;
  is_store_can_complete_order: boolean = false;
  constructor(public helper: Helper) {}

  // ngAfterViewInit() {
  //   jQuery('#side-menu').metisMenu();
  // }

  ngOnInit() {
    let store = JSON.parse(localStorage.getItem('store'));
    this.menu_title = this.helper.menu_title;

    if (store !== null) {
      this.helper.user_cart.name = store.name;
      this.helper.user_cart.image = store.image_url;
      this.is_store_can_add_provider = store.is_store_can_add_provider;
      this.is_store_can_complete_order = store.is_store_can_complete_order;
    }

    this.toggle(event);
  }

  toggle(event) {
    this.helper.ngZone.run(() => {
      if (jQuery(window).width() <= 768) {
        jQuery('body').toggleClass('mini-navbar');
        jQuery('.full_menu').toggleClass('full_menu1');
      }

      if (
        jQuery('#earning_submenu').attr('class') ==
        'nav nav-second-level collapse in'
      ) {
        if (event.target !== undefined) {
          if (event.target.id === '') {
            jQuery('#click_menu').click();
          }
        }
      }
    });
  }

  activeRoute(routename: string): boolean {
    return this.helper.router.url.indexOf(routename) > -1;
  }
}
