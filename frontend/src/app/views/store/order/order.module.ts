import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreOrderComponent } from './order.component';
import { BrowserModule } from '@angular/platform-browser';
import { DropdownModule } from 'ng2-dropdown';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { FooterModule } from '../../../common/store/footer/footer.module';
import { MomentModule } from 'ngx-moment';


@NgModule({
  imports: [
    CommonModule,
    DropdownModule,
    BrowserModule,
    FooterModule,
    FormsModule,
    RouterModule,
    MomentModule
    
    
  ],
  declarations: [StoreOrderComponent],
})
export class StoreOrderModule {}
