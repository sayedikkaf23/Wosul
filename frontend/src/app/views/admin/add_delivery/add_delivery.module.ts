import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddDeliveryComponent } from './add_delivery.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ngx-ui-switch';

import { ImageCropperModule } from 'ngx-img-cropper';

import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FooterModule,
    FormsModule,
    
    ImageCropperModule,
    UiSwitchModule,
  ],
  declarations: [AddDeliveryComponent],
})
export class AddDeliveryModule {}
