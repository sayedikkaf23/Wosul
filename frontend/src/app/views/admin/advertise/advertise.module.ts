import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvertiseComponent } from './advertise.component';
import { RouterModule } from '@angular/router';
// import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'ng2-dropdown';

import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FooterModule,
    UiSwitchModule,
    BrowserModule,
    FormsModule,
    DropdownModule,
  ],
  declarations: [AdvertiseComponent],
})
export class AdvertiseModule {}
