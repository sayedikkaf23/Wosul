import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { NavigationComponent } from './navigation.component';
import { MetismenuAngularModule } from '@metismenu/angular';

@NgModule({
  imports: [BrowserModule, RouterModule, MetismenuAngularModule],
  declarations: [NavigationComponent],
  exports: [NavigationComponent],
})
export class NavigationModule {}
