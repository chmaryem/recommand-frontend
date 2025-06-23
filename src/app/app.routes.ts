import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

import { HomeComponent } from './home/home.component';
import { VerifyCodeComponent } from './verify-code/verify-code.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { AccountComponent } from './account/account.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},

  { path: 'login', component: LoginComponent },
  {path: 'register', component: RegisterComponent},
  { path: 'verify', component: VerifyCodeComponent },
  { path: 'forgotpass', component: ForgotpasswordComponent },
  { path: 'account', component: AccountComponent },
];
