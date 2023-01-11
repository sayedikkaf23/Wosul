import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FranchiseStoreDeliveryComponent } from './delivery.component';
import { DropdownModule } from 'ng2-dropdown';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
//

import { FooterModule } from '../../../common/franchise/footer/footer.module';
import { MomentModule } from 'ngx-moment';

@NgModule({
  imports: [
    CommonModule,
    DropdownModule,
    FormsModule,
    FooterModule,
    RouterModule,
    MomentModule
  ],
  declarations: [FranchiseStoreDeliveryComponent],
})
export class FranchiseStoreDeliveryModule {}
