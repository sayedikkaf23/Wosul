import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AddCountryComponent } from './add_country.component';
import { UiSwitchModule } from 'ngx-ui-switch';
import { TooltipModule } from 'ngx-tooltip';

import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    FooterModule,
    UiSwitchModule,
    TooltipModule,
  ],
  declarations: [AddCountryComponent],
})
export class AddCountryModule {}
