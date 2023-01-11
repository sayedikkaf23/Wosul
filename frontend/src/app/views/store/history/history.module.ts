import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreHistoryComponent } from './history.component';
import { DropdownModule } from 'ng2-dropdown';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MyDatePickerModule } from 'mydatepicker';

import { FooterModule } from '../../../common/store/footer/footer.module';
import { MomentModule } from 'ngx-moment';

import { RatingModule } from 'ngx-rating';

@NgModule({
  imports: [
    CommonModule,
    DropdownModule,
    FormsModule,
    FooterModule,
    RatingModule,
    RouterModule,
    MyDatePickerModule,
    

    MomentModule,
  ],
  declarations: [StoreHistoryComponent],
})
export class StoreHistoryModule {}
