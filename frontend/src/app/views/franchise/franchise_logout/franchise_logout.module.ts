import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FranchiseLogoutComponent } from './franchise_logout.component';

import { FooterModule } from '../../../common/store/footer/footer.module';
@NgModule({
  imports: [CommonModule, FooterModule],
  declarations: [FranchiseLogoutComponent],
})
export class FranchiseLogoutModule {}
