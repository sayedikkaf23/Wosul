import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransLanguageComponent } from './trans_language.component';
import { TranslatePipe } from './translate/translate.pipe';
import { TRANSLATION_PROVIDERS } from './translate/translations';
import { TranslateService } from './translate/translate.service';
@NgModule({
  imports: [CommonModule],
  declarations: [TranslatePipe, TransLanguageComponent],
  providers: [TRANSLATION_PROVIDERS, TranslateService],
})
export class TransLanguageModule {}
