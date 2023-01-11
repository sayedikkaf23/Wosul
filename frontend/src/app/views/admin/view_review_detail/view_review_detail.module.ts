import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewReviewDetailComponent } from './view_review_detail.component';
import { RouterModule } from '@angular/router';

import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [CommonModule, RouterModule, FooterModule],
  declarations: [ViewReviewDetailComponent],
})
export class ViewReviewDetailModule {}
