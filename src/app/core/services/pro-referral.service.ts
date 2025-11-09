import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpService } from './http.service';

export type ProReferral = {
  referral_code: string;
  is_premium: boolean;
  active: boolean;
  bonus_referrer: number;
  bonus_referred: number;
  starts_at: string; // ISO (UTC)
  ends_at: string;   // ISO (UTC)
  created_at?: string;
  updated_at?: string;
};

type ListResponse = { total: number; items: ProReferral[] };
type ItemResponse = { ok: boolean; item: ProReferral };

@Injectable({ providedIn: 'root' })
export class ProReferralService {
  private http = inject(HttpService);
  private base = '/api/admin/pro-referral';

  list(): Observable<ProReferral[]> {
    return this.http.get<ListResponse>(this.base).pipe(map(r => r.items ?? []));
  }

  create(payload: Omit<ProReferral, 'created_at' | 'updated_at'>): Observable<ProReferral> {
    return this.http.post<ItemResponse>(this.base, payload).pipe(map(r => r.item));
  }

  patch(code: string, payload: Partial<Omit<ProReferral, 'referral_code'>>): Observable<ProReferral> {
    return this.http.patch<ItemResponse>(`${this.base}/${code}`, payload).pipe(map(r => r.item));
  }

  remove(code: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${code}`);
  }
}
