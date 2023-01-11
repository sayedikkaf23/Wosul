import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FooterComponent } from './footer.component';
// import { SpinnerModule } from 'angular2-spinner/dist';

@NgModule({
  declarations: [FooterComponent],
  imports: [BrowserModule],
  exports: [FooterComponent],
})
export class FooterModule {}
