import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { settingComponent } from './setting.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [settingComponent],
})
export class SettingModule {}
