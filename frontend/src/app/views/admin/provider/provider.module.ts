import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProviderComponent } from './provider.component';

import { TooltipModule } from 'ngx-tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { DropdownModule } from 'ng2-dropdown';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';


import { FooterModule } from '../../../common/admin/footer/footer.module';
import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [
    CommonModule,
    DropdownModule,
    TooltipModule,
    BrowserModule,
    FormsModule,
    MyDatePickerModule,
    RouterModule,
    FooterModule,
    UiSwitchModule,
    
  ],
  declarations: [ProviderComponent],
})
export class ProviderModule {}
