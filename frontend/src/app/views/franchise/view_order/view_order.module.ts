import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FranchiseStoreViewOrderComponent } from './view_order.component';
import { RouterModule } from '@angular/router';

import { FooterModule } from '../../../common/franchise/footer/footer.module';
import { MomentModule } from 'ngx-moment';

@NgModule({
  imports: [CommonModule, RouterModule, FooterModule, MomentModule],
  declarations: [FranchiseStoreViewOrderComponent],
})
export class FranchiseStoreViewOrderModule {}
