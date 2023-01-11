import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
// import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';


import { CustomFormsModule } from 'ng2-validation';
import { FooterModule } from '../../../common/store/footer/footer.module';
import { NavigationModule } from '../../../common/store/navigation/navigation.module';
import { ChartsModule } from 'ng2-charts';
import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [
    CommonModule,
    MyDatePickerModule,
    BrowserModule,
    FormsModule,
    FooterModule,
    NavigationModule,
    ChartsModule,
    CustomFormsModule,
    UiSwitchModule,
    
    
  ],
  declarations: [ProfileComponent],
})
export class ProfileModule {}
