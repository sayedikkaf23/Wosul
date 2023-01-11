import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MyDatePickerModule } from 'mydatepicker';
import { DropdownModule } from 'ng2-dropdown';
import { TopnavbarComponent } from './topnavbar.component';

@NgModule({
  declarations: [TopnavbarComponent],
  imports: [
    BrowserModule,
    DropdownModule,
    MyDatePickerModule,
    DropdownModule,
    MyDatePickerModule,
    BrowserModule,
    FormsModule,
    RouterModule,
    NgbModule,
  ],
  exports: [TopnavbarComponent],
})
export class TopnavbarModule {}
