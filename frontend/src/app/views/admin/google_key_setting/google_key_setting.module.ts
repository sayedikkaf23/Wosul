import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleKeySettingComponent } from './google_key_setting.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
// import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';

import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    FooterModule,
    UiSwitchModule,
  ],
  declarations: [GoogleKeySettingComponent],
})
export class GoogleKeySettingModule {}
