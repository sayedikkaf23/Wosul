import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { ChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { FooterModule } from '../../../common/admin/footer/footer.module';
import { MyDatePickerModule } from 'mydatepicker';
import { MomentModule } from 'ngx-moment';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { UiSwitchModule } from 'ngx-ui-switch';
import { NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    ChartsModule,
    FormsModule,
    FooterModule,
    MyDatePickerModule,
    MomentModule,
    NgMultiSelectDropDownModule,
    UiSwitchModule,
    NgbTimepickerModule
  ],
  declarations: [DashboardComponent],
})
export class DashboardModule {}
