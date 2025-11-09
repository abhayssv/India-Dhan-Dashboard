import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpService } from './http.service';

export type Role = {
  id: string;
  key: string;
  name: string;
  is_admin: boolean;
  created_at?: string;
};

export type RoleWithPerms = {
  role: Role;
  permissions: Array<{ id: string; key: string; name: string; created_at?: string }>;
};

@Injectable({ providedIn: 'root' })
export class RolesService {
  private http = inject(HttpService);

  // BE returns { items: Role[] }
  list(): Observable<Role[]> {
    return this.http
      .get<{ items: Role[] }>('/api/admin/rbac/roles')
      .pipe(map(r => r.items ?? []));
  }

  // Create accepts perm_keys and returns { role, permissions }
  create(payload: {
    key: string;
    name: string;
    is_admin?: boolean;
    perm_keys?: string[];
  }): Observable<RoleWithPerms> {
    return this.http.post<RoleWithPerms>('/api/admin/rbac/roles', payload);
  }

  // Get role + permissions
  getWithPerms(id: string): Observable<RoleWithPerms> {
    return this.http.get<RoleWithPerms>(`/api/admin/rbac/roles/${id}`);
  }

  // Update accepts name/is_admin/perm_keys, returns { role, permissions }
  update(id: string, payload: {
    name?: string;
    is_admin?: boolean;
    perm_keys?: string[];
  }): Observable<RoleWithPerms> {
    return this.http.patch<RoleWithPerms>(`/api/admin/rbac/roles/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`/api/admin/rbac/roles/${id}`);
  }
}
