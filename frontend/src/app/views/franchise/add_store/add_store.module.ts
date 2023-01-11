import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddFranchiseStoreComponent } from './add_store.component';
import { BrowserModule } from '@angular/platform-browser';
import { CustomFormsModule } from 'ng2-validation';
import { FormsModule } from '@angular/forms';
// import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';


import { FooterModule } from '../../../common/store/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    CustomFormsModule,
    UiSwitchModule,
    
    FooterModule,
  ],
  declarations: [AddFranchiseStoreComponent],
})
export class AddFranchiseStoreModule {}
