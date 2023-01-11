import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddAdminComponent } from './add_admin.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ngx-ui-switch';
import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [CommonModule, BrowserModule, FormsModule, MyDatePickerModule, UiSwitchModule],
  declarations: [AddAdminComponent],
})
export class AddAdminModule {}
