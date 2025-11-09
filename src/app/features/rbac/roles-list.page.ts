import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';

import { RolesService, Role } from '../../core/services/roles.service';
import { RoleCreateComponent } from './role-create.component';
import { RoleUpdateComponent } from './role-update.component';
import { RoleDeleteComponent } from './role-delete.component';

@Component({
  standalone: true,
  selector: 'app-roles-list-page',
  imports: [CommonModule, RoleCreateComponent, RoleUpdateComponent, RoleDeleteComponent],
  templateUrl: './roles-list.page.html',
})
export class RolesListPage implements OnInit, OnDestroy {
  private api = inject(RolesService);
  private toast = inject(ToastrService);

  roles = signal<Role[]>([]);
  loading = signal(false);

  showCreate = signal(false);
  editingRole = signal<Role | null>(null);
  deletingRole = signal<Role | null>(null);

  // kebab per-row (same behavior as Permissions page)
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
      // works with either {items: Role[]} or Role[]
      const items = (res as any)?.items ?? (res as any) ?? [];
      this.roles.set(items);
    } catch (e: any) {
      this.toast.error(e?.error?.message || e?.error?.error || 'Failed to load roles');
    } finally {
      this.loading.set(false);
    }
  }

  // open/close
  openCreate() { this.showCreate.set(true); }
  closeCreate() { this.showCreate.set(false); }

  openEdit(r: Role) { this.editingRole.set(r); }
  closeEdit() { this.editingRole.set(null); }

  openDelete(r: Role) { this.deletingRole.set(r); }
  closeDelete() { this.deletingRole.set(null); }

  // events
  // events (no required params)
  async onCreated(_evt?: unknown) {
    this.toast.success('Role created');
    this.closeCreate();
    await this.load();
  }

  async onUpdated(_evt?: unknown) {
    this.toast.success('Role updated');
    this.closeEdit();
    await this.load();
  }

  async onDeleted(_evt?: unknown) {
    this.toast.success('Role deleted');
    this.closeDelete();
    await this.load();
  }
}
