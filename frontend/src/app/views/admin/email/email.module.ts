import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailComponent } from './email.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
// import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';

@NgModule({
  imports: [CommonModule, BrowserModule, FormsModule, UiSwitchModule],
  declarations: [EmailComponent],
})
export class EmailModule {}
