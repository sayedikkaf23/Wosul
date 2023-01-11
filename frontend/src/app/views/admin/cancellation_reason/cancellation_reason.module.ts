import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CancellationReasonComponent } from './cancellation_reason.component';
import { DropdownModule } from 'ng2-dropdown';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MyDatePickerModule } from 'mydatepicker';

import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,
    DropdownModule,
    FormsModule,
    FooterModule,
    RouterModule,
    MyDatePickerModule,
  ],
  declarations: [CancellationReasonComponent],
})
export class CancellationReasonModule {}
