import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddPromoCodeComponent } from './add_promo_code.component';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { UiSwitchModule } from 'ngx-ui-switch';
import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    MyDatePickerModule,
    RouterModule,
    FormsModule,
    UiSwitchModule,
  ],
  declarations: [AddPromoCodeComponent],
})
export class AddPromoCodeModule {}
