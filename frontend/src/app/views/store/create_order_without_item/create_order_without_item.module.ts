import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreCreateOrderWithoutItemOrderComponent } from './create_order_without_item.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';


import { MyDatePickerModule } from 'mydatepicker';
import { FooterModule } from '../../../common/store/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    MyDatePickerModule,
    FooterModule,

    FormsModule,
    
  ],
  declarations: [StoreCreateOrderWithoutItemOrderComponent],
})
export class toreCreateOrderWithoutItemOrderModule {}
