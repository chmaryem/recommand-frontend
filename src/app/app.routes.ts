import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

import { HomeComponent } from './home/home.component';
import { VerifyCodeComponent } from './verify-code/verify-code.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { AccountComponent } from './account/account.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WeatherComponent } from './weather/weather.component';
import { PerformanceComponent } from './performance/performance.component';
import { SidebareComponent } from './sidebare/sidebare.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { HistoryComponent } from './history/history.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'dashboard', component: DashboardComponent},

  { path: 'login', component: LoginComponent },
  {path: 'register', component: RegisterComponent},
  { path: 'verify', component: VerifyCodeComponent },
  { path: 'forgotpass', component: ForgotpasswordComponent },
  { path: 'account', component: AccountComponent },
  { path: 'weather', component: WeatherComponent },
  { path: 'performance', component: PerformanceComponent },
   { path: 'sidebar', component: SidebareComponent },
   { path: 'admin-dashboard', component: AdminDashboardComponent },
    { path: 'feedback', component: FeedbackComponent },
    { path: 'history', component: HistoryComponent }




];
