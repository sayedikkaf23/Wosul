import { Component } from '@angular/core';
import { correctHeight, detectBody } from './app.helpers';
import jQuery from 'jquery';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(
    private swUpdate: SwUpdate,
    ){

  }
  ngOnInit() {
    if (this.swUpdate.isEnabled) {
        this.swUpdate.available.subscribe(() => {
            if (confirm("New version available. Load New Version?")) {
              window.location.reload();
            }
        });

    }



}
  ngAfterViewInit() {
    // Run correctHeight function on load and resize window event
    jQuery(window).bind('load resize', function () {
      correctHeight();
      detectBody();
    });

    // Correct height of wrapper after metisMenu animation.
    // jQuery('.metismenu a').click(() => {
    //   setTimeout(() => {
    //     correctHeight();
    //   }, 300);
    // });
  }
}
