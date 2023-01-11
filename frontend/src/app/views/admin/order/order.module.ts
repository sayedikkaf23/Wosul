import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderComponent } from './order.component';
import { BrowserModule } from '@angular/platform-browser';
import { DropdownModule } from 'ng2-dropdown';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MyDatePickerModule } from 'mydatepicker';

import { FooterModule } from '../../../common/admin/footer/footer.module';
import { MomentModule } from 'ngx-moment';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ImageCropperModule } from 'ngx-img-cropper';
import { UiSwitchModule } from 'ngx-ui-switch';


@NgModule({
  imports: [
    CommonModule,
    DropdownModule,
    MyDatePickerModule,
    BrowserModule,
    FormsModule,
    FooterModule,
    RouterModule,
    MomentModule,
    NgbModule,
    NgMultiSelectDropDownModule.forRoot(),
    ImageCropperModule,
    UiSwitchModule,
  ],
  declarations: [OrderComponent],
  entryComponents: [OrderComponent],
})
export class OrderModule {}
