import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminProductsComponent } from './products.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
// import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';
import { RouterModule, Routes } from '@angular/router';

import { FooterModule } from '../../../common/store/footer/footer.module';
import { RatingModule } from 'ngx-rating';

import { ImageCropperModule } from 'ngx-img-cropper';
import { DropdownModule } from 'ng2-dropdown';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    BrowserModule,
    DropdownModule,
    ImageCropperModule,
    FormsModule,
    FooterModule,
    UiSwitchModule,
    NgMultiSelectDropDownModule.forRoot(),
    RatingModule,
  ],
  declarations: [AdminProductsComponent],
})
export class AdminProductsModule {}
