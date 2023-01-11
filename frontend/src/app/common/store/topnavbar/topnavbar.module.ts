import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TopnavbarComponent } from './topnavbar.component';
import { RouterModule } from '@angular/router';
import { DropdownModule } from 'ng2-dropdown';

@NgModule({
  declarations: [TopnavbarComponent],
  imports: [BrowserModule, RouterModule, DropdownModule],
  exports: [TopnavbarComponent],
})
export class TopnavbarModule {}
