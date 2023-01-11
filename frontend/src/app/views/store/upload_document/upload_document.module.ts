import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreUploadDocumentComponent } from './upload_document.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MyDatePickerModule } from 'mydatepicker';

import { FooterModule } from '../../../common/store/footer/footer.module';
@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    FooterModule,
    MyDatePickerModule,
    
  ],
  declarations: [StoreUploadDocumentComponent],
})
export class StoreUploadDocumentModule {}
