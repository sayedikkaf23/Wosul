import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
// import { SpinnerModule } from 'angular2-spinner/dist';
import { TimeSheetComponent } from './time_sheet.component';

@NgModule({
  declarations: [TimeSheetComponent],
  imports: [BrowserModule, CommonModule],
  exports: [TimeSheetComponent],
})
export class TimeSheetModule {}
