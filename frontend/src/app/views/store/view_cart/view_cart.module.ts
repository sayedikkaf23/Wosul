import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreViewCartComponent } from './view_cart.component';
import { RouterModule } from '@angular/router';

import { FooterModule } from '../../../common/store/footer/footer.module';

@NgModule({
  imports: [CommonModule, RouterModule, FooterModule, ],
  declarations: [StoreViewCartComponent],
})
export class StoreViewCartModule {}
