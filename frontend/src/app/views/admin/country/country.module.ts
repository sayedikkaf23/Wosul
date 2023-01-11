import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { countryComponent } from './country.component';
import { RouterModule } from '@angular/router';
// import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';
import { FormsModule } from '@angular/forms';

import { FooterModule } from '../../../common/admin/footer/footer.module';
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    UiSwitchModule,
    FormsModule,

    FooterModule,
  ],
  declarations: [countryComponent],
})
export class CountryModule {}
