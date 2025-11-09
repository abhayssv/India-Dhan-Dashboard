import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { routes } from './app.routes';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ToastrModule } from 'ngx-toastr';

import { httpLoaderInterceptor } from './core/interceptors/http-loader.interceptor';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';


// OPTIONAL: if you created these earlier; otherwise remove from the array
// import { httpLoaderInterceptor } from './core/interceptors/http-loader.interceptor';
// import { httpErrorToastInterceptor } from './core/interceptors/http-error-toast.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withEnabledBlockingInitialNavigation()),
    provideHttpClient(
      withInterceptors([
        AuthInterceptor,
        httpLoaderInterceptor,
        httpErrorInterceptor
        // httpErrorToastInterceptor,
      ])
    ),

    // Enable animations (needed for ngx-toastr)
    provideAnimations(),

    // Global Toastr config
    importProvidersFrom(
      ToastrModule.forRoot({
        positionClass: 'toast-top-right',
        timeOut: 2500,
        progressBar: true,
        closeButton: true,
        newestOnTop: true,
        preventDuplicates: true,
      })
    ),
  ],
};
