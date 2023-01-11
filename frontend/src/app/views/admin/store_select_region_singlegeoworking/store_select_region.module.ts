import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreSelectRegionComponent } from './store_select_region.component';
import { FormsModule } from '@angular/forms';

import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [FormsModule, CommonModule, FooterModule],
  declarations: [StoreSelectRegionComponent],
})
export class StoreSelectRegionModule {}
