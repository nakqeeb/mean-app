import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { FormsModule } from '@angular/forms';
import { AngularMaterailModule } from '../angular-material.module';
import { RouterModule } from '@angular/router';
import { AuthRoutingModule } from "./auth-routing.module";

@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AngularMaterailModule,
    RouterModule,
    AuthRoutingModule
  ]
})
export class AuthModule {}
