import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { NavigationComponent } from './navigation.component';

import { FranchiseProfileModule } from '../../../views/franchise/profile/profile.module';

@NgModule({
  imports: [BrowserModule, RouterModule],
  declarations: [NavigationComponent],
  exports: [NavigationComponent],
})
export class NavigationModule {}
