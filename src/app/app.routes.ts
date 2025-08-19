import { Routes } from '@angular/router';

import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';

import { HomeComponent } from './component/home/home.component';
import { VerifyCodeComponent } from './component/verify-code/verify-code.component';
import { ForgotpasswordComponent } from './component/forgotpassword/forgotpassword.component';
import { AccountComponent } from './component/account/account.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { WeatherComponent } from './component/weather/weather.component';
import { PerformanceComponent } from './component/performance/performance.component';
import { SidebareComponent } from './component/sidebare/sidebare.component';
import { AdminDashboardComponent } from './component/admin-dashboard/admin-dashboard.component';
import { FeedbackComponent } from './component/feedback/feedback.component';
import { HistoryComponent } from './component/history/history.component';
import { AuthGuard } from './services/auth.guard';
import { UnauthorizedComponent } from './component/unauthorized/unauthorized.component';
import { OAuthCallbackComponent } from './component/oauth-callback/oauth-callback.component';


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
  { path: 'performance', component: PerformanceComponent, canActivate: [AuthGuard], data: { roles: ['USER'] } },
  { path: 'sidebar', component: SidebareComponent, canActivate: [AuthGuard], data: { roles: ['USER'] } },
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
  { path: 'feedback', component: FeedbackComponent, canActivate: [AuthGuard], data: { roles: ['USER'] } },
  { path: 'history', component: HistoryComponent, canActivate: [AuthGuard], data: { roles: ['USER'] } },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'oauth/callback', component: OAuthCallbackComponent },
];
