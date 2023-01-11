import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin.component';
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
    FormsModule,
    FooterModule,
    BrowserModule,
  ],
  declarations: [AdminComponent],
})
export class AdminModule {}
