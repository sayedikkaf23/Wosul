import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HiddenItemsComponent } from './hidden_items.component';
import { BrowserModule } from '@angular/platform-browser';
import { DropdownModule } from 'ng2-dropdown';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MyDatePickerModule } from 'mydatepicker';

import { FooterModule } from '../../../common/admin/footer/footer.module';


@NgModule({
  imports: [
    CommonModule,
    DropdownModule,
    MyDatePickerModule,
    BrowserModule,
    FormsModule,
    FooterModule,
    RouterModule,

    
  ],
  declarations: [HiddenItemsComponent],
})
export class HiddenItemsModule {}
