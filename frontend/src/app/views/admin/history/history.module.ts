import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryComponent } from './history.component';
import { DropdownModule } from 'ng2-dropdown';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MyDatePickerModule } from 'mydatepicker';

import { FooterModule } from '../../../common/admin/footer/footer.module';
import { MomentModule } from 'ngx-moment';

import { RatingModule } from 'ngx-rating';

@NgModule({
  imports: [
    CommonModule,
    DropdownModule,
    RatingModule,
    FormsModule,
    FooterModule,
    RouterModule,
    MyDatePickerModule,
    MomentModule,
    
  ],
  declarations: [HistoryComponent],
})
export class HistoryModule {}
