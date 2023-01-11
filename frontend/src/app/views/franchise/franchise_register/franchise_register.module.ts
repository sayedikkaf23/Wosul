import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { franchise_registerComponent } from './franchise_register.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CustomFormsModule } from 'ng2-validation';

import { GooglePlaceModule } from 'ngx-google-places-autocomplete';

import { FooterModule } from '../../../common/store/footer/footer.module';
import { FacebookModule } from 'ngx-facebook';

@NgModule({
  declarations: [franchise_registerComponent],
  imports: [
    CommonModule,
    CustomFormsModule,
    FacebookModule,
    FooterModule,
    BrowserModule,

    RouterModule,
    FormsModule,
    
    GooglePlaceModule,
  ],
})
export class franchise_RegisterModule {}
