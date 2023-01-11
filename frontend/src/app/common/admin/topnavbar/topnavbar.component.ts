import { Component } from '@angular/core';
import { smoothlyMenu } from '../../../app.helpers';
import { Helper } from '../../../views/helper';
declare var Notification: any;
import jQuery from 'jquery';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'topnavbar',
  templateUrl: 'topnavbar.template.html',
  providers: [Helper],
})
export class TopnavbarComponent {
  admin_id: String;
  admin_token: String;
  interval: any;
  audio: any;
  store_list = [];
  store_redirect: any;
  store_redirect_list: any = [];
  admin_detail: any = {};
  constructor(public helper: Helper, public socket: SocketService) {
    // helper.trans.addLangs(['sp', 'fr', 'hi', 'cn', 'en']);
    // var language = JSON.parse(localStorage.getItem('admin_language'));
    // if (language == '' || language == undefined) {
    //   language = 'en';
    // }
    // helper.trans.setDefaultLang('en');
    // helper.trans.use(language);
    // const browserLang = helper.trans.getBrowserLang();
  }

  toggleNavigation(): void {
    // if(jQuery(window).width()>768){
    jQuery('body').toggleClass('mini-navbar');
    jQuery('.full_menu').toggleClass('full_menu1');
    // jQuery("nav").toggleClass("navbar");
    // jQuery("nav").toggleClass("navbar1");
    // jQuery("nav span a").toggleClass("minimalize-styl-2");
    // jQuery("nav span a").toggleClass("minimalize-styl-3");

    // }
    // else
    // {
    //     jQuery("body").toggleClass("body1");
    //     jQuery("body1").toggleClass("body");
    // }
    smoothlyMenu();
  }
  ngOnInit() {
    this.audio = new Audio();
    this.audio.src = 'audio.mp3';
    this.audio.load();

    this.admin_id = localStorage.getItem('admin_id');
    this.admin_token = localStorage.getItem('admin_token');
    this.helper.http
      .post('/admin/check_auth', {
        admin_id: this.admin_id,
        admin_token: this.admin_token,
      })
      .subscribe((data: any) => {
        console.log('Response ');
        console.log(data);
        if (data.success == true) {
          this.admin_detail = data.admin;
          if (this.admin_detail.admin_type == 4) {
            this.get_store_list('5d6791abc01cf5683d14c418');  
          }
        } else {
          this.helper.router.navigate(['admin/login']);
        }
      });

    jQuery(document.body)
      .find('#store_redirect')
      .on('change', (evnt, res_data) => {
        console.log('res_data.selected :>> ', res_data.selected);
        this.redirectToStore(res_data.selected);
        console.log('evnt :>> ', evnt);
        // this.add_admin.store_id = res_data.selected;
      });
    // this.interval = setInterval(() => {
    // }, this.helper.TIMEOUT.NEW_ORDER_REQUEST);
  }
  ngAfterViewInit() {
    this.new_order_notify();
  }

  new_order_notify() {
    this.socket.onEvent('newOrderNotification').subscribe((socket) => {
      console.log('new order notification :>> ');
      console.log('socket :>> ', socket);
      new Notification('', socket);
      jQuery('#button').click();
      this.audio.play();
    });
  }
  redirectToStore(store_id) {
    console.log('store :>> ', store_id);
    let store_detail = this.store_list.find((store) => store._id == store_id);
    localStorage.setItem('token', store_detail.server_token);
    localStorage.setItem('store', JSON.stringify(store_detail));
    this.helper.router.navigate(['store/product']);
    console.log('store_det :>> ', store_detail);
  }
  logout() {
    localStorage.setItem('admin_id', '');
    localStorage.setItem('admin_token', '');
    this.helper.router.navigate(['/admin/login']);
  }
  get_store_list(countryid) {
    this.helper.http
      .post('/admin/get_store_list_for_country', { country_id: countryid })
      .subscribe((res_data: any) => {
        this.store_list = res_data.stores_all;
        let main_stores = this.store_list.find(
          (store) => store._id == this.admin_detail.store_id
        );
        let stores_ids = [main_stores?._id];
        main_stores?.sub_stores.forEach((store) => {
          stores_ids.push(store._id);
        });
        this.store_redirect_list = this.store_list.filter((store) =>
          stores_ids.includes(store._id)
        );

        console.log('this.store_redirect_list :>> ', this.store_redirect_list);
        setTimeout(function () {
          jQuery('#store_redirect').trigger('chosen:updated');
        }, 1000);
      });
  }

  back() {
    this.helper.router.navigate([this.helper.router_id.admin.back_url]);
  }
}
