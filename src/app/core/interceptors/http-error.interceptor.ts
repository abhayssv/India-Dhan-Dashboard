// src/app/core/interceptors/http-error.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthStore } from '../state/auth.store';

function extractHttpError(err: HttpErrorResponse): string {
  const e = err?.error;
  if (!e) return '';
  if (typeof e === 'string') return e;
  if (typeof e === 'object') return e.message || e.error || e.msg || '';
  return '';
}

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastrService);
  const router = inject(Router);
  const zone   = inject(NgZone);
  const auth   = inject(AuthStore);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const msg = extractHttpError(err);

      if (err.status === 401) {
        toast.error(msg || 'Your session has expired. Please sign in again.');
        // clear + navigate to login
        auth.signOutLocal();
        return throwError(() => err);
      }

      if (err.status === 403) {
        toast.warning(msg || 'You don’t have permission to access this resource.');
        // navigate inside Angular zone & avoid redirect loop
        const alreadyOn403 = router.url === '/403';
        if (!alreadyOn403) {
          zone.run(() => router.navigateByUrl('/403'));
        }
        return throwError(() => err);
      }

      if (err.status >= 500) {
        toast.error('Server error. Please try again later.');
      } else if (msg) {
        toast.error(msg);
      } else {
        toast.error('Request failed.');
      }
      return throwError(() => err);
    })
  );
};
