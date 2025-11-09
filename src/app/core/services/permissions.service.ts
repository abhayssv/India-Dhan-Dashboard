// src/app/core/services/permissions.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpService } from './http.service';

export type Permission = {
  id: string;
  key: string;
  name: string;
  created_at?: string;
};

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private http = inject(HttpService);

  list(): Observable<Permission[]> {
    return this.http
      .get<{ items: Permission[] }>('/api/admin/rbac/permissions')
      .pipe(map(r => r.items ?? []));   // <-- normalize to array
  }

  create(payload: { key: string; name: string }) {
    return this.http.post<Permission>('/api/admin/rbac/permissions', payload);
  }

  getById(id: string) {
    return this.http.get<Permission>(`/api/admin/rbac/permissions/${id}`);
  }

  update(id: string, payload: Partial<Pick<Permission, 'name'>>) {
    return this.http.patch<Permission>(`/api/admin/rbac/permissions/${id}`, payload);
  }

  remove(id: string) {
    return this.http.delete<void>(`/api/admin/rbac/permissions/${id}`);
  }
}
