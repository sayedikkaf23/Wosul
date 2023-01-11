import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { AddVehicleComponent } from './add_vehicle.component';

import { FormsModule } from '@angular/forms';
// import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';

import { ImageCropperModule } from 'ngx-img-cropper';

import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    FooterModule,
    UiSwitchModule,
    
    ImageCropperModule,
  ],
  declarations: [AddVehicleComponent],
})
export class AddVehicleModule {}
