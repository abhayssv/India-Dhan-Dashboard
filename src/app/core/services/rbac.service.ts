import { Injectable, inject } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class RbacService {
  api = inject(HttpService);
  listRoles() { return this.api.get<any[]>('/api/admin/rbac/roles'); }
  getRole(id: string) { return this.api.get<any>(`/api/admin/rbac/roles/${id}`); }
  setRolePermissions(roleId: string, keys: string[]) {
    return this.api.post(`/api/admin/rbac/roles/${roleId}/permissions`, { permissions: keys });
  }
  assignRoleToUser(userId: string, roleIds: string[]) {
    return this.api.post(`/api/admin/rbac/users/${userId}/roles`, { roleIds });
  }
}
