import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorWeeklyEarningComponent } from './weekly_earning.component';
import { DropdownModule } from 'ng2-dropdown';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MyDatePickerModule } from 'mydatepicker';

import { FooterModule } from '../../../common/store/footer/footer.module';
import { MomentModule } from 'ngx-moment';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  imports: [
    CommonModule,
    ChartsModule,
    DropdownModule,
    FormsModule,
    FooterModule,
    RouterModule,
    MyDatePickerModule,
    
    MomentModule,
  ],
  declarations: [StorWeeklyEarningComponent],
})
export class StorWeeklyEarningModule {}
