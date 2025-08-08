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
import { AuthGuard } from './services/auth.guard';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { OAuthCallbackComponent } from './oauth-callback/oauth-callback.component';


export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['USER'] } },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify', component: VerifyCodeComponent },
  { path: 'forgotpass', component: ForgotpasswordComponent },
  { path: 'account', component: AccountComponent },
  { path: 'weather', component: WeatherComponent, canActivate: [AuthGuard], data: { roles: ['USER'] } },
  { path: 'performance', component: PerformanceComponent, canActivate: [AuthGuard], data: { roles: ['USER', 'ADMIN'] } },
  { path: 'sidebar', component: SidebareComponent, canActivate: [AuthGuard], data: { roles: ['USER', 'ADMIN'] } },
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
  { path: 'feedback', component: FeedbackComponent, canActivate: [AuthGuard], data: { roles: ['USER', 'ADMIN'] } },
  { path: 'history', component: HistoryComponent, canActivate: [AuthGuard], data: { roles: ['USER', 'ADMIN'] } },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'oauth/callback', component: OAuthCallbackComponent },
];
