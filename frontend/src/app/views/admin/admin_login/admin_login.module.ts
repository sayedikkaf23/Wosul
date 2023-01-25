import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { admin_loginComponent } from './admin_login.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [admin_loginComponent],
  imports: [BrowserModule, CommonModule, FormsModule, RouterModule],
})
export class admin_LoginModule {}
