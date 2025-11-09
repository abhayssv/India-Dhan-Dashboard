// core/guards/permission.guard.ts
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../state/auth.store';

export const PermissionGuard = (route: ActivatedRouteSnapshot): boolean | UrlTree => {
  const perm = route.data['perm'] as string | undefined;
  const auth = inject(AuthStore);
  const router = inject(Router);

  // Early allow if no perm specified
  if (!perm) {
    console.log(10, perm);                 // undefined
    console.log(11, auth.isAdmin());
    console.log(12, 'perm not required -> allowing');
    return true;
  }

  // Now perm is string (narrowed)
  const isAdmin = auth.isAdmin();
  const hasPerm = auth.hasPermission(perm);

  if (isAdmin && hasPerm) return true;
  return router.parseUrl('/403');
};
