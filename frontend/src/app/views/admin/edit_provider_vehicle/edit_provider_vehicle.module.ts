import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditProviderVehicleComponent } from './edit_provider_vehicle.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ngx-ui-switch';
import { TooltipModule } from 'ngx-tooltip';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    UiSwitchModule,
    TooltipModule,
  ],
  declarations: [EditProviderVehicleComponent],
})
export class EditProviderVehicleModule {}
