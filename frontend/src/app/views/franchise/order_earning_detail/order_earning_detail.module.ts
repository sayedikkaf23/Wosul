import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FranchiseOrderEarningDetailComponent } from './order_earning_detail.component';
import { RouterModule } from '@angular/router';

import { FooterModule } from '../../../common/franchise/footer/footer.module';
@NgModule({
  imports: [CommonModule, RouterModule, FooterModule],
  declarations: [FranchiseOrderEarningDetailComponent],
})
export class FranchiseOrderEarningDetailModule {}
