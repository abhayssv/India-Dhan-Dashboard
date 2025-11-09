// src/app/core/interceptors/auth.interceptor.ts
import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthStore } from '../state/auth.store';
import { ToastrService } from 'ngx-toastr';

const AUTH_WHITELIST = ['/api/admin/auth/login']; // don’t redirect while logging in
let isRedirecting = false;

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  const toast = inject(ToastrService, { optional: true });

  const token = auth.accessToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      const unauthorized =
        err.status === 401 || (typeof err.error === 'object' && err.error?.error === 'unauthorized');

      const isAuthCall = AUTH_WHITELIST.some((p) => req.url.includes(p));

      if (unauthorized && !isAuthCall && !isRedirecting) {
        isRedirecting = true;
        toast?.warning('Session expired. Please log in again.');
        // clear everything and go to login (no API call to avoid loops)
        auth.signOutLocal();
        // allow another redirect after a short debounce
        setTimeout(() => (isRedirecting = false), 500);
      }

      return throwError(() => err);
    })
  );
};
