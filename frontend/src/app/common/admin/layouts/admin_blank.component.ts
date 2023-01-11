import { Component } from '@angular/core';

import jQuery from 'jquery';

@Component({
  selector: 'admin_blank',
  templateUrl: 'admin_blank.template.html',
})
export class admin_blankComponent {
  ngAfterViewInit() {
    jQuery('body').addClass('gray-bg');
  }

  ngOnDestroy() {
    jQuery('body').removeClass('gray-bg');
  }
}
