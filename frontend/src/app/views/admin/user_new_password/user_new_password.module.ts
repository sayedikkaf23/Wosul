import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserNewPasswordComponent } from './user_new_password.component';

import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CustomFormsModule } from 'ng2-validation';
import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CustomFormsModule,
    FooterModule,
    RouterModule,
  ],
  declarations: [UserNewPasswordComponent],
})
export class UserNewPasswordModule {}
