import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseBackupComponent } from './database_backup.component';
import { RouterModule } from '@angular/router';
import { UiSwitchModule } from 'ngx-ui-switch';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'ng2-dropdown';
import { BrowserModule } from '@angular/platform-browser';

import { FooterModule } from '../../../common/admin/footer/footer.module';
import { MyDatePickerModule } from 'mydatepicker';
import { MomentModule } from 'ngx-moment';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MyDatePickerModule,
    DropdownModule,
    UiSwitchModule,
    FormsModule,
    FooterModule,
    BrowserModule,
    MomentModule
  ],
  declarations: [DatabaseBackupComponent],
})
export class DatabaseBackupModule {}
