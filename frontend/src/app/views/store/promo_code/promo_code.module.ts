import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorePromoCodeComponent } from './promo_code.component';
import { BrowserModule } from '@angular/platform-browser';
import { DropdownModule } from 'ng2-dropdown';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { FooterModule } from '../../../common/store/footer/footer.module';
// // import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';
@NgModule({
  imports: [
    CommonModule,
    DropdownModule,
    BrowserModule,
    FormsModule,
    FooterModule,
    RouterModule,
    
    UiSwitchModule,
  ],
  declarations: [StorePromoCodeComponent],
})
export class StorePromoCodeModule {}
