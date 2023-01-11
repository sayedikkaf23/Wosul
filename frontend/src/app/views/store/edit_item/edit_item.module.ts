import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditItemComponent } from './edit_item.component';

import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
// import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';

// import { SwiperModule } from 'angular2-useful-swiper';

import { ImageCropperModule } from 'ngx-img-cropper';
import { FooterModule } from '../../../common/store/footer/footer.module';

@NgModule({
  declarations: [EditItemComponent],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    ImageCropperModule,
    UiSwitchModule,
    

    FooterModule,
  ],
})
export class EditItemModule {}
