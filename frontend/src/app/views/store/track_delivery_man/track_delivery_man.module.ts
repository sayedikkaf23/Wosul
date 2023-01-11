import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreTrackDeliveryManComponent } from './track_delivery_man.component';

import { FooterModule } from '../../../common/store/footer/footer.module';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  imports: [
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBdp63UjqKdWrgjhYRqombTjTLv-dIczNI',
    }),
    CommonModule,
    FooterModule,
    
  ],
  declarations: [StoreTrackDeliveryManComponent],
})
export class StoreTrackDeliveryManModule {}
