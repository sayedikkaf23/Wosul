import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddAdvertiseComponent } from './add_advertise.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ngx-ui-switch';
import { RouterModule, Routes } from '@angular/router';

import { MyDatePickerModule } from 'mydatepicker';
import { FooterModule } from '../../../common/admin/footer/footer.module';

import { ImageCropperModule } from 'ngx-img-cropper';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    BrowserModule,
    MyDatePickerModule,
    
    ImageCropperModule,
    FormsModule,
    FooterModule,
    UiSwitchModule,
  ],
  declarations: [AddAdvertiseComponent],
})
export class AddAdvertiseModule {}
