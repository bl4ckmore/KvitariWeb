import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login';
import { RegisterComponent } from './Components/register/register';
import { DashboardComponent } from './Components/dashboard/dashboard';
import { HomeComponent } from './Components/home/home';
import { authGuard } from './guards/auth.guard';
import { PublicPaymentComponent } from './Components/public-payment/public-payment';

import { ProfileComponent } from './Components/profile/profile';
import { InvoicesComponent } from './Components/invoices/invoices';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // ✅ Public page (no auth)
  { path: 'pay/:id', component: PublicPaymentComponent },

  // ✅ Protected area shell
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'profile' },
      { path: 'profile', component: ProfileComponent },
      { path: 'invoices', component: InvoicesComponent }
    ]
  },

  { path: '**', redirectTo: '' }
];
