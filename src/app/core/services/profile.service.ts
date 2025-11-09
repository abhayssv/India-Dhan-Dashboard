// src/app/core/services/profile.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpService } from './http.service';

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
};

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpService);

  /**
   * GET /api/admin/profile
   * Supports either { profile: Profile } or plain Profile.
   */
  getProfile(): Observable<Profile> {
    return this.http
      .get<Profile | { profile: Profile }>('/api/admin/profile')
      .pipe(map((r) => (r as any).profile ?? (r as Profile)));
  }

  /**
   * PATCH /api/admin/profile
   * payload: { full_name?: string; avatar_url?: string }
   */
  updateProfile(payload: { full_name?: string; avatar_url?: string }): Observable<void> {
    return this.http.patch<void>('/api/admin/profile', payload);
  }

  /**
   * PATCH /api/admin/auth/password
   * payload: { current_password: string; new_password: string }
   */
  changePassword(payload: { current_password: string; new_password: string }): Observable<void> {
    return this.http.patch<void>('/api/admin/auth/password', payload);
  }
}
