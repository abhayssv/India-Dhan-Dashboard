// src/app/features/rbac/permissions/permissions-list.page.ts
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { PermissionsService, Permission } from '../../../core/services/permissions.service';

// children
import { PermissionCreateComponent } from './permission-create.component';
import { PermissionUpdateComponent } from './permission-update.component';
import { PermissionDeleteComponent } from './permission-delete.component';

@Component({
  standalone: true,
  selector: 'app-permissions-list-page',
  imports: [CommonModule, PermissionCreateComponent, PermissionUpdateComponent, PermissionDeleteComponent],
  templateUrl: './permissions-list.page.html',
})
  
export class PermissionsListPage implements OnInit, OnDestroy {
  private api = inject(PermissionsService);
  private toast = inject(ToastrService);

  permissions = signal<Permission[]>([]);
  loading = signal(false);

  showCreate = signal(false);
  editingPermission = signal<Permission | null>(null);
  deletingPermission = signal<Permission | null>(null);

  rowMenuFor = signal<string | null>(null);
  isRowMenuOpen = (id: string) => this.rowMenuFor() === id;
  toggleRowMenu(id: string, ev?: Event) {
    ev?.stopPropagation();
    this.rowMenuFor.update(open => (open === id ? null : id));
  }
  private _closeMenus = () => this.rowMenuFor.set(null);
  constructor() { document.addEventListener('click', this._closeMenus, true); }
  ngOnDestroy() { document.removeEventListener('click', this._closeMenus, true); }

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.api.list());
      const items = (res as any)?.items ?? (res as any) ?? [];
      this.permissions.set(items);
    } catch (e: any) {
      this.toast.error(e?.error?.message || 'Failed to load permissions');
    } finally {
      this.loading.set(false);
    }
  }

  // open/close create
  openCreate() { this.showCreate.set(true); }
  closeCreate() { this.showCreate.set(false); }

  // open/close edit
  openEdit(p: Permission) { this.editingPermission.set(p); }
  closeEdit() { this.editingPermission.set(null); }

  // open/close delete
  openDelete(p: Permission) { this.deletingPermission.set(p); }
  closeDelete() { this.deletingPermission.set(null); }

  // events
  async onCreated(_: Permission) { this.toast.success('Permission created'); this.closeCreate(); await this.load(); }
  async onUpdated(_: Permission) { this.toast.success('Permission updated'); this.closeEdit(); await this.load(); }
  async onDeleted(_: string)    { this.toast.success('Permission deleted'); this.closeDelete(); await this.load(); }
}
