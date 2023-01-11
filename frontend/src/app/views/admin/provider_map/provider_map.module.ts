import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProviderMapComponent } from './provider_map.component';
import { FormsModule } from '@angular/forms';

import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [FormsModule, CommonModule, FooterModule],
  declarations: [ProviderMapComponent],
})
export class ProviderMapModule {}
