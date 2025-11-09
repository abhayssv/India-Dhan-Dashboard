// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpService } from './http.service';

export interface MeDto {
  id: string;
  email: string;
  roles: { id: string; key: string; name: string; is_admin: boolean }[];
  permissions: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  api = inject(HttpService);

    // src/app/core/services/auth.service.ts
    login(email: string, password: string) {
        return this.api.post<{
        access_token: string;
        refresh_token: string;            // ⬅️ make sure this is here
        user: { id: string; email: string };
        }>('/api/admin/auth/login', { email, password });
    }

  me() {
    // must include Authorization: Bearer <token> via your interceptor
    return this.api.get<MeDto>('/api/admin/auth/me');
  }

  // NEW: logout endpoint (uses interceptor for Bearer)
  logout(refreshToken: string) {
    return this.api.post('/api/admin/auth/logout', { refresh_token: refreshToken });
  }
}
