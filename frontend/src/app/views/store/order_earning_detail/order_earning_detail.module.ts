import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderEarningDetailComponent } from './order_earning_detail.component';
import { RouterModule } from '@angular/router';

import { FooterModule } from '../../../common/store/footer/footer.module';
import { MomentModule } from 'ngx-moment';
@NgModule({
  imports: [CommonModule, RouterModule, FooterModule, MomentModule ],
  declarations: [OrderEarningDetailComponent],
})
export class OrderEarningDetailModule {}
