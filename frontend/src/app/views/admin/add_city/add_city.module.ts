import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AddCityComponent } from './add_city.component';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { UiSwitchModule } from 'ngx-ui-switch';

import { FooterModule } from '../../../common/admin/footer/footer.module';
import { TooltipModule } from 'ngx-tooltip';


@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    UiSwitchModule,
    FooterModule,
    GooglePlaceModule,

    TooltipModule,
    
  ],
  declarations: [AddCityComponent],
})
export class AddCityModule {}
