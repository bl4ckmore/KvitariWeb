import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login';
import { RegisterComponent } from './Components/register/register';
import { DashboardComponent } from './Components/dashboard/dashboard';
import { HomeComponent } from './Components/home/home';
import { authGuard } from './guards/auth.guard';
import { PublicPaymentComponent } from './Components/public-payment/public-payment';

export const routes: Routes = [
  { path: '', component: HomeComponent }, 
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'pay/:id', component: PublicPaymentComponent }, // საჯარო გვერდი
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [authGuard] // მხოლოდ ერთი დეკლარაცია!
  },
  { path: '**', redirectTo: '' } // უცნობი მისამართებისთვის
];