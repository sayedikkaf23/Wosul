import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminNewPasswordComponent } from './admin_new_password.component';
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
  declarations: [AdminNewPasswordComponent],
})
export class AdminNewPasswordModule {}
