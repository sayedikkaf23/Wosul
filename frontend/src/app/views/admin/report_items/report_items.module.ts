import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportItemsComponent } from './report_items.component';
import { BrowserModule } from '@angular/platform-browser';
import { DropdownModule } from 'ng2-dropdown';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MyDatePickerModule } from 'mydatepicker';

import { FooterModule } from '../../../common/admin/footer/footer.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@NgModule({
  imports: [
    CommonModule,
    DropdownModule,
    MyDatePickerModule,
    BrowserModule,
    FormsModule,
    FooterModule,
    RouterModule,
    NgMultiSelectDropDownModule,
  ],
  declarations: [ReportItemsComponent],
})
export class ReportItemsModule {}
