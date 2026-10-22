import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './core/auth.guard';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'roll-call',
        loadComponent: () =>
          import('./pages/roll-call/roll-call.component').then((m) => m.RollCallComponent)
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./pages/students/students.component').then((m) => m.StudentsComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/reports/reports.component').then((m) => m.ReportsComponent)
      },
      {
        path: 'events',
        loadComponent: () => import('./pages/events/events.component').then((m) => m.EventsComponent)
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/users/users.component').then((m) => m.UsersComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
