import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreLogoutComponent } from './store_logout.component';

import { FooterModule } from '../../../common/store/footer/footer.module';
@NgModule({
  imports: [CommonModule, FooterModule, ],
  declarations: [StoreLogoutComponent],
})
export class StoreLogoutModule {}
