import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FranchiseProfileComponent } from './profile.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
// import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';


import { CustomFormsModule } from 'ng2-validation';
import { FooterModule } from '../../../common/franchise/footer/footer.module';
import { NavigationModule } from '../../../common/franchise/navigation/navigation.module';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    FooterModule,
    NavigationModule,
    ChartsModule,
    CustomFormsModule,
    UiSwitchModule,
    
  ],
  declarations: [FranchiseProfileComponent],
})
export class FranchiseProfileModule {}
