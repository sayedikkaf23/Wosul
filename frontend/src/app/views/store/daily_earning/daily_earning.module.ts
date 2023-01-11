import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreDailyEarningComponent } from './daily_earning.component';
import { DropdownModule } from 'ng2-dropdown';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MyDatePickerModule } from 'mydatepicker';

import { FooterModule } from '../../../common/store/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,
    DropdownModule,
    FormsModule,
    FooterModule,
    RouterModule,
    MyDatePickerModule,
  ],
  declarations: [StoreDailyEarningComponent],
})
export class StoreDailyEarningModule {}
