import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { PermissionGuard } from './core/guards/permission.guard';
import { ShellComponent } from './layout/components/shell.component';
import { NoAuthGuard } from './core/guards/no-auth.guard'; // blocks /login if already logged in

export const routes: Routes = [
  // Public route: login (kept OUTSIDE the protected shell)
  {
    path: 'login',
    canMatch: [NoAuthGuard],
    loadComponent: () => import('./features/login/login.page').then(m => m.LoginPage),
  },

  // Protected shell + children
  {
    path: '',
    canActivate: [AuthGuard],
    component: ShellComponent,
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.page').then(m => m.DashboardPage) },
      { 
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: 'rbac/roles',
        canActivate: [PermissionGuard], data: { perm: 'rbac.manage' },
        loadComponent: () => import('./features/rbac/roles-list.page').then(m => m.RolesListPage)
      },
      {
        path: 'rbac/permissions',
        canActivate: [PermissionGuard], data: { perm: 'rbac.manage' },
        loadComponent: () => import('./features/rbac/permissions/permissions-list.page').then(m => m.PermissionsListPage)
      },
      {
        path: 'admin-users',
        canActivate: [PermissionGuard], data: { perm: 'users.read' },
        loadComponent: () => import('./features/admin-users/users-list.page').then(m => m.UsersListPage)
      },
      {
        path: 'customers',
        canActivate: [PermissionGuard], data: { perm: 'customers.read' },
        loadComponent: () =>import('./features/customers/customers-list.page').then(m => m.CustomersListPage)
      },
      {
        path: 'customers/:id',
        canActivate:[PermissionGuard], data: { perm: 'customers.read' },
        loadComponent: () =>import('./features/customers/customer-detail.page').then(m => m.CustomerDetailPage),
      },
      {
        path: 'pro-referral',
        canActivate:[PermissionGuard], data: { perm: 'proreferral.read' },
        loadComponent: () =>import('./features/referrals/pro-referral-list.page').then(m => m.ProReferralListPage),
      },
      {
        path: 'influencers',
        canActivate:[PermissionGuard], data: { perm: 'influencer.read' },
        loadComponent: () =>import('./features/influencers/influencers-list.page').then(m => m.InfluencersListPage),
      },
      {
        path: 'influencers/:id',
        canActivate: [PermissionGuard], data: { perm: 'influencer.read' },
        loadComponent: () =>
          import('./features/influencers/influencer-detail.page').then(m => m.InfluencerDetailPage),
      },
      {
        path: '403',
        loadComponent: () =>
          import('./shared/pages/access-denied.component').then(m => m.AccessDeniedComponent)
      },
      {
        path: 'loans',
        canActivate: [PermissionGuard], data: { perm: 'loans.read' },
        loadComponent: () => import('./features/loans/loans-list.page').then(m => m.LoansListPage),
      },
      {
        path: 'loans/:loan_id/:user_id',
        canActivate: [PermissionGuard], data: { perm: 'loans.read' },
        loadComponent: () => import('./features/loans/loan-detail.page').then(m => m.LoanDetailPage),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      
    ],
  },

  { path: '**', redirectTo: '' },
];
