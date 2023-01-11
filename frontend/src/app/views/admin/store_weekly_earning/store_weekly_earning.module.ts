import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreWeeklyEarningComponent } from './store_weekly_earning.component';
import { DropdownModule } from 'ng2-dropdown';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MyDatePickerModule } from 'mydatepicker';


import { FooterModule } from '../../../common/admin/footer/footer.module';
import { MomentModule } from 'ngx-moment';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  imports: [
    CommonModule,
    DropdownModule,
    FormsModule,
    MomentModule,
    RouterModule,
    FooterModule,
    MyDatePickerModule,
    

    ChartsModule,
  ],
  declarations: [StoreWeeklyEarningComponent],
})
export class StoreWeeklyEarningModule {}
