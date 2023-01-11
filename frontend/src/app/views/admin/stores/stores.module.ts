import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoresComponent } from './stores.component';
import { BrowserModule } from '@angular/platform-browser';
import { DropdownModule } from 'ng2-dropdown';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';

import { TooltipModule } from 'ngx-tooltip';

import { FooterModule } from '../../../common/admin/footer/footer.module';
import { MyDatePickerModule } from 'mydatepicker';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@NgModule({
  imports: [
    CommonModule,
    DropdownModule,
    BrowserModule,
    MyDatePickerModule,
    FormsModule,
    FooterModule,
    RouterModule,
    UiSwitchModule,
    NgMultiSelectDropDownModule.forRoot(),
    TooltipModule,
  ],
  declarations: [StoresComponent],
})
export class StoresModule {}
