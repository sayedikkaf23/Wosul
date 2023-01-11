import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeliveryComponent } from './delivery.component';

import { RouterModule } from '@angular/router';
// import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'ng2-dropdown';
import { BrowserModule } from '@angular/platform-browser';

import { FooterModule } from '../../../common/admin/footer/footer.module';
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    DropdownModule,
    UiSwitchModule,
    FooterModule,
    FormsModule,
    BrowserModule,
  ],
  declarations: [DeliveryComponent],
})
export class DeliveryModule {}
