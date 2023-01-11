import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreDeliveryComponent } from './delivery.component';
import { DropdownModule } from 'ng2-dropdown';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


import { FooterModule } from '../../../common/store/footer/footer.module';
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
  declarations: [StoreDeliveryComponent],
})
export class StoreDeliveryModule {}
