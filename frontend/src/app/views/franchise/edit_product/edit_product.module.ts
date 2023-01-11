import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditFranchiseProductComponent } from './edit_product.component';
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
    ImageCropperModule,
    
    FormsModule,
    FooterModule,
    UiSwitchModule,
  ],
  declarations: [EditFranchiseProductComponent],
})
export class EditFranchiseProductModule {}
