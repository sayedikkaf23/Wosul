import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingComponent } from './setting.component';
import { FormsModule } from '@angular/forms';
// // import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';


import { CustomFormsModule } from 'ng2-validation';
import { FooterModule } from '../../../common/store/footer/footer.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CustomFormsModule,
    FooterModule,
    UiSwitchModule,
    
    
  ],
  declarations: [SettingComponent],
})
export class storeSettingModule {}
