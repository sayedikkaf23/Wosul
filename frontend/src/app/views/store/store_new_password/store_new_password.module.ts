import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreNewPasswordComponent } from './store_new_password.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CustomFormsModule } from 'ng2-validation';
import { FooterModule } from '../../../common/store/footer/footer.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CustomFormsModule,
    FooterModule,
    RouterModule,
    
  ],
  declarations: [StoreNewPasswordComponent],
})
export class StoreNewPasswordModule {}
