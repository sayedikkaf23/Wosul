import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddItemComponent } from './add_item.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
// import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';


import { FooterModule } from '../../../common/store/footer/footer.module';
import { ImageCropperModule } from 'ngx-img-cropper';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    ImageCropperModule,
    UiSwitchModule,
    
    FooterModule,
  ],
  declarations: [AddItemComponent],
})
export class AddItemModule {}
