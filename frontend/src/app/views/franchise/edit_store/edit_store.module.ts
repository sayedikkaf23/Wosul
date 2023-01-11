import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditFranchiseStoreComponent } from './edit_store.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
// import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';


import { CustomFormsModule } from 'ng2-validation';
import { FooterModule } from '../../../common/admin/footer/footer.module';
import { ChartsModule } from 'ng2-charts';
@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    FooterModule,
    ChartsModule,
    CustomFormsModule,
    UiSwitchModule,
    
  ],
  declarations: [EditFranchiseStoreComponent],
})
export class EditFranchiseStoreModule {}
