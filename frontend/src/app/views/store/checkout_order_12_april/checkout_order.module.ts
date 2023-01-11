import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreCheckoutOrderComponent } from './checkout_order.component';
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
  declarations: [StoreCheckoutOrderComponent],
})
export class StoreCheckoutOrderModule {}
