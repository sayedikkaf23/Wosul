import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceComponent } from './service.component';
import { RouterModule } from '@angular/router';
import { DropdownModule } from 'ng2-dropdown';
import { FormsModule } from '@angular/forms';

import { FooterModule } from '../../../common/admin/footer/footer.module';
// import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    DropdownModule,
    FooterModule,
    UiSwitchModule,
    FormsModule,
  ],
  declarations: [ServiceComponent],
})
export class ServiceModule {}
