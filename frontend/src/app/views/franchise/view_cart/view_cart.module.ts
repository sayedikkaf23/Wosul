import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FranchiseStoreViewCartComponent } from './view_cart.component';
import { RouterModule } from '@angular/router';

import { FooterModule } from '../../../common/franchise/footer/footer.module';

@NgModule({
  imports: [CommonModule, RouterModule, FooterModule],
  declarations: [FranchiseStoreViewCartComponent],
})
export class FranchiseStoreViewCartModule {}
