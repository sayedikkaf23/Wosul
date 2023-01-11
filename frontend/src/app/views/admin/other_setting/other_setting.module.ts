import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtherSettingComponent } from './other_setting.component';
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
    FooterModule,
    FormsModule,
  ],
  declarations: [OtherSettingComponent],
})
export class OtherSettingModule {}
