import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddFranchiseItemComponent } from './add_item.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
// import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';


import { FooterModule } from '../../../common/franchise/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    UiSwitchModule,
    
    FooterModule,
  ],
  declarations: [AddFranchiseItemComponent],
})
export class AddFranchiseItemModule {}
