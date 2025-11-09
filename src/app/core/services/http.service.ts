// src/app/core/services/http.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

type BodyOptions = {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | number | boolean | readonly (string | number | boolean)[] };
  withCredentials?: boolean;
  // 🚫 do NOT allow observe/reportProgress here – we fix them to 'body' false
};

@Injectable({ providedIn: 'root' })
export class HttpService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl; // set if you use a base API URL

  // ------- BODY (default, simplest) -------
  get<T>(url: string, options?: BodyOptions): Observable<T> {
    return this.http.get<T>(this.base + url, { ...options, observe: 'body' as const });
  }

  post<T>(url: string, body: any, options?: BodyOptions): Observable<T> {
    return this.http.post<T>(this.base + url, body, { ...options, observe: 'body' as const });
  }

  put<T>(url: string, body: any, options?: BodyOptions): Observable<T> {
    return this.http.put<T>(this.base + url, body, { ...options, observe: 'body' as const });
  }

  patch<T>(url: string, body: any, options?: BodyOptions): Observable<T> {
    return this.http.patch<T>(this.base + url, body, { ...options, observe: 'body' as const });
  }

  delete<T>(url: string, options?: BodyOptions): Observable<T> {
    return this.http.delete<T>(this.base + url, { ...options, observe: 'body' as const });
  }

  // ------- OPTIONAL: if you sometimes need the full response -------
  getResponse<T>(url: string, options?: BodyOptions): Observable<HttpResponse<T>> {
    return this.http.get<T>(this.base + url, { ...options, observe: 'response' as const });
  }

  // ------- OPTIONAL: if you sometimes need progress events -------
  getEvents<T>(url: string, options?: BodyOptions): Observable<HttpEvent<T>> {
    return this.http.get<T>(this.base + url, { ...options, observe: 'events' as const, reportProgress: true });
  }
}
