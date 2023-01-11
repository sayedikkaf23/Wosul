import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddDetailComponent } from './add_detail.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ngx-ui-switch';
import { TooltipModule } from 'ngx-tooltip';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    UiSwitchModule,
    TooltipModule,
  ],
  declarations: [AddDetailComponent],
})
export class AddDetailModule {}
