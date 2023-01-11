import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreViewOrderComponent } from './view_order.component';
import { RouterModule } from '@angular/router';

import { FooterModule } from '../../../common/store/footer/footer.module';
import { MomentModule } from 'ngx-moment';

@NgModule({
  imports: [CommonModule, RouterModule, FooterModule, MomentModule],
  declarations: [StoreViewOrderComponent],
})
export class StoreViewOrderModule {}
