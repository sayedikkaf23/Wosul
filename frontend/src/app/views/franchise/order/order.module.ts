import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FranchiseStoreOrderComponent } from './order.component';
import { BrowserModule } from '@angular/platform-browser';
import { DropdownModule } from 'ng2-dropdown';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { FooterModule } from '../../../common/franchise/footer/footer.module';
import { MomentModule } from 'ngx-moment';
//

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
  declarations: [FranchiseStoreOrderComponent],
})
export class FranchiseStoreOrderModule {}
