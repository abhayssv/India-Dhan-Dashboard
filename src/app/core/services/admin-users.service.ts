import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';

export type AdminUserListItem = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  referral_code: string | null;
  disabled: boolean;
  roles: string[];            // only keys in list response
  created_at: string;
};

export type AdminUserDetail = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  referral_code: string | null;
  disabled: boolean;
  roles: { id: string; key: string; name: string; is_admin: boolean }[];
};

export type UsersListParams = {
  query?: string;
  status?: 'all' | 'active' | 'disabled';
  limit?: number;
  offset?: number;
};

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private http = inject(HttpService);

  list(params: UsersListParams) {
    // BE expects POST body for list
    return this.http.post<{ total: number; items: AdminUserListItem[] }>(
      '/api/admin/users/list',
      {
        query: params.query ?? '',
        status: params.status ?? 'all',
        limit: params.limit ?? 50,
        offset: params.offset ?? 0,
      }
    );
  }

  create(payload: { email: string; password: string; full_name: string; role_keys: string[] }) {
    return this.http.post<AdminUserDetail>('/api/admin/users/create', payload);
  }

  getById(id: string) {
    return this.http.get<AdminUserDetail>(`/api/admin/users/${id}`);
  }

  update(
    id: string,
    payload: Partial<Pick<AdminUserDetail, 'full_name' | 'email'>> & { role_keys?: string[] }
  ) {
    return this.http.patch<AdminUserDetail>(`/api/admin/users/${id}`, payload);
  }

  updateStatus(id: string, disabled: boolean) {
    return this.http.patch<void>(`/api/admin/users/${id}/status`, { disabled });
  }
}
