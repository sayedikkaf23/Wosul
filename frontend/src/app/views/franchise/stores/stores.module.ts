import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FranchiseStoresComponent } from './stores.component';
import { BrowserModule } from '@angular/platform-browser';
import { DropdownModule } from 'ng2-dropdown';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';

import { TooltipModule } from 'ngx-tooltip';

import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,
    DropdownModule,
    BrowserModule,
    FormsModule,
    FooterModule,
    RouterModule,
    UiSwitchModule,
    
    TooltipModule,
  ],
  declarations: [FranchiseStoresComponent],
})
export class FranchiseStoresModule {}
