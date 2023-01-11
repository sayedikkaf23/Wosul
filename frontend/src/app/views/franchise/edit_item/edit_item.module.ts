import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditFranchiseItemComponent } from './edit_item.component';

import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
// import { UiSwitchModule } from 'ngx-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';

// import { SwiperModule } from 'angular2-useful-swiper';

import { FooterModule } from '../../../common/franchise/footer/footer.module';

@NgModule({
  declarations: [EditFranchiseItemComponent],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    UiSwitchModule,
    

    FooterModule,
  ],
})
export class EditFranchiseItemModule {}
