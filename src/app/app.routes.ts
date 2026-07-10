import { Routes } from '@angular/router';
import { authGuard, staffGuard, adminGuard, memberOnlyGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  /* ── Member portal ── */
  {
    path: 'member',
    loadComponent: () => import('./pages/member-portal/member-shell.component').then(m => m.MemberShellComponent),
    canActivate: [memberOnlyGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/member-portal/member-home.component').then(m => m.MemberHomeComponent) },
      { path: 'catalog', loadComponent: () => import('./pages/member-portal/member-catalog.component').then(m => m.MemberCatalogComponent) },
      { path: 'reservations', loadComponent: () => import('./pages/member-portal/member-reservations.component').then(m => m.MemberReservationsComponent) }
    ]
  },
  /* ── Admin / Staff dashboard ── */
  {
    path: '',
    loadComponent: () => import('./layout/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard, staffGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'books',     loadComponent: () => import('./pages/books/books.component').then(m => m.BooksComponent) },
      { path: 'categories',loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent) },
      { path: 'members',   loadComponent: () => import('./pages/members/members.component').then(m => m.MembersComponent) },
      { path: 'staff',     loadComponent: () => import('./pages/staff/staff.component').then(m => m.StaffComponent), canActivate: [adminGuard] },
      { path: 'circulation',loadComponent: () => import('./pages/circulation/circulation.component').then(m => m.CirculationComponent) },
      { path: 'fines',     loadComponent: () => import('./pages/fines/fines.component').then(m => m.FinesComponent) },
      { path: 'attendance',loadComponent: () => import('./pages/attendance/attendance.component').then(m => m.AttendanceComponent) },
      { path: 'reports',   loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent) }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
