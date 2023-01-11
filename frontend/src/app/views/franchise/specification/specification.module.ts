import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FranchiseSpecificationComponent } from './specification.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { FooterModule } from '../../../common/store/footer/footer.module';
@NgModule({
  imports: [CommonModule, BrowserModule, FormsModule, FooterModule],
  declarations: [FranchiseSpecificationComponent],
})
export class FranchiseSpecificationModule {}
