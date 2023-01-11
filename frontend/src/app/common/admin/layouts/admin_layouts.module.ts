import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';

import { admin_blankComponent } from './admin_blank.component';
import { admin_basicComponent } from './admin_basic.component';

import { NavigationModule } from '../navigation/navigation.module';
import { TopnavbarModule } from '../topnavbar/topnavbar.module';
import { FooterModule } from '../footer/footer.module';
import { TimeSheetModule } from '../time_sheet/time_sheet.module';

@NgModule({
  declarations: [admin_blankComponent, admin_basicComponent],
  imports: [
    BrowserModule,
    RouterModule,
    NavigationModule,
    TopnavbarModule,
    FooterModule,
    TimeSheetModule,
  ],
  exports: [admin_blankComponent, admin_basicComponent],
})
export class AdminLayoutsModule {}
