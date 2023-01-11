import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';


import { FormsModule } from '@angular/forms';
// import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';

import { ImageCropperModule } from 'ngx-img-cropper';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FooterModule } from '../../../common/admin/footer/footer.module';
import { AddTagsComponent } from './add-tags.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    FooterModule,
    UiSwitchModule,
    NgMultiSelectDropDownModule.forRoot(),
    ImageCropperModule,
  ],
  declarations: [AddTagsComponent],
})
export class AddTagsModule {}
