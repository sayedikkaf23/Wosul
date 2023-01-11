import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FranchiseProductsComponent } from './products.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
// import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';
import { RouterModule, Routes } from '@angular/router';

import { FooterModule } from '../../../common/franchise/footer/footer.module';
import { RatingModule } from 'ngx-rating';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    BrowserModule,
    
    FormsModule,
    FooterModule,
    UiSwitchModule,

    RatingModule,
  ],
  declarations: [FranchiseProductsComponent],
})
export class FranchiseProductsModule {}
