import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { franchise_loginComponent } from './franchise_login.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// import { AuthModule } from 'angular2-auth';


import { CustomFormsModule } from 'ng2-validation';
import { FooterModule } from '../../../common/franchise/footer/footer.module';
import { FacebookModule } from 'ngx-facebook';

@NgModule({
  declarations: [franchise_loginComponent],
  imports: [
    BrowserModule,
    RouterModule,
    FacebookModule,
    FooterModule,
    
    FormsModule,
    CustomFormsModule,
    // AuthModule.forRoot(),
  ],
})
export class franchise_LoginModule {}
