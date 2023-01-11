import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { AllCityComponent } from './all-city.component';
import { FormsModule } from '@angular/forms';

import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [CommonModule, BrowserModule, FormsModule, FooterModule],
  declarations: [AllCityComponent],
})
export class AllCityModule {}
