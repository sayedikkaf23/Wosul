import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddDocumentComponent } from './add_document.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ngx-ui-switch';

@NgModule({
  imports: [CommonModule, BrowserModule, FormsModule, UiSwitchModule],
  declarations: [AddDocumentComponent],
})
export class AddDocumentModule {}
