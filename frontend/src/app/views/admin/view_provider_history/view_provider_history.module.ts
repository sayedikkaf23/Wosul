import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewProviderHistoryComponent } from './view_provider_history.component';
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
    RouterModule,
    FooterModule,
    MyDatePickerModule,
  ],
  declarations: [ViewProviderHistoryComponent],
})
export class ViewProviderHistoryModule {}
