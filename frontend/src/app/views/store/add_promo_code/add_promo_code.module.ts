import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreAddPromoCodeComponent } from './add_promo_code.component';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

// import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';
import { MyDatePickerModule } from 'mydatepicker';

import { FooterModule } from '../../../common/store/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    MyDatePickerModule,
    FooterModule,
    RouterModule,
    FormsModule,
    
    UiSwitchModule,
  ],
  declarations: [StoreAddPromoCodeComponent],
})
export class StoreAddPromoCodeModule {}
