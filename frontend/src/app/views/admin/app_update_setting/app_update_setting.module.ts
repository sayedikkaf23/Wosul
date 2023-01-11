import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppUpdateSettingComponent } from './app_update_setting.component';
import { RouterModule } from '@angular/router';
// import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { FooterModule } from '../../../common/admin/footer/footer.module';
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    UiSwitchModule,
    FooterModule,
    FormsModule,
    BrowserModule,
  ],
  declarations: [AppUpdateSettingComponent],
})
export class AppUpdateSettingModule {}
