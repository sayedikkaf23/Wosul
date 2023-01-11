import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { store_loginComponent } from './store_login.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// import { AuthModule } from 'angular2-auth';


import { CustomFormsModule } from 'ng2-validation';
import { FooterModule } from '../../../common/store/footer/footer.module';
import { FacebookModule } from 'ngx-facebook';

@NgModule({
  declarations: [store_loginComponent],
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
export class store_LoginModule {}
