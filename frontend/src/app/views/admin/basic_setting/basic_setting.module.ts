import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasicSettingComponent } from './basic_setting.component';
import { DropdownModule } from 'ng2-dropdown';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';

import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,
    DropdownModule,
    FooterModule,
    BrowserModule,
    FormsModule,
    GooglePlaceModule,
  ],
  declarations: [BasicSettingComponent],
})
export class BasicSettingModule {}
