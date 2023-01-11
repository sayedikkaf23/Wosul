import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { FooterModule } from '../../../common/admin/footer/footer.module';
import { GroupNotificationComponent } from './group-notification.component';
import { TooltipModule } from 'ngx-tooltip';
import { UiSwitchModule } from 'ngx-ui-switch';

@NgModule({
  imports: [CommonModule, BrowserModule, FormsModule, FooterModule, TooltipModule, UiSwitchModule, ],
  declarations: [GroupNotificationComponent],
})
export class GroupNotificationModule {}
