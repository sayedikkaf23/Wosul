import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportDataComponent } from './import-data.component';
import { FooterModule } from '../../../common/store/footer/footer.module';

@NgModule({
  imports: [CommonModule, FooterModule],
  declarations: [ImportDataComponent],
})
export class ImportDataModule {}
