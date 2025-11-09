import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';

import { RolesService, Role } from '../../core/services/roles.service';
import { PermissionsService, Permission } from '../../core/services/permissions.service';

@Component({
  standalone: true,
  selector: 'app-role-update',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './role-update.component.html'
})
export class RoleUpdateComponent implements OnInit {
  @Input({ required: true }) role!: Role;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private toast = inject(ToastrService);
  private rolesApi = inject(RolesService);
  private permsApi = inject(PermissionsService);

  loaded = signal(false);
  saving = signal(false);

  allPerms = signal<Permission[]>([]);
  filteredPerms = signal<Permission[]>([]);
  selectedKeys = signal<Set<string>>(new Set());

  form = this.fb.group({
    name: ['', [Validators.required]],
    is_admin: [false]
  });

  async ngOnInit() {
    try {
      const perms = await firstValueFrom(this.permsApi.list());
      this.allPerms.set(perms);
      this.filteredPerms.set(perms);

      const r = await firstValueFrom(this.rolesApi.getWithPerms(this.role.id));
      this.form.patchValue({
        name: r.role.name,
        is_admin: r.role.is_admin
      });
      this.selectedKeys.set(new Set((r.permissions ?? []).map(p => p.key)));

      this.loaded.set(true);
    } catch (e: any) {
      this.toast.error(e?.error?.message || e?.error?.error || e?.message || 'Failed to load role');
    }
  }

  t(name: 'name') { const c = this.form.controls[name]; return c.touched && c.invalid; }

  onSearch(e: Event) {
    const q = (e.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredPerms.set(
      this.allPerms().filter(p => p.key.toLowerCase().includes(q) || p.name.toLowerCase().includes(q))
    );
  }

  toggleKey(key: string, ev: Event) {
    const checked = (ev.target as HTMLInputElement).checked;
    const next = new Set(this.selectedKeys());
    if (checked) next.add(key); else next.delete(key);
    this.selectedKeys.set(next);
  }

  async submit() {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    try {
      const payload = {
        name: (this.form.value.name || '').trim(),
        is_admin: !!this.form.value.is_admin,
        perm_keys: Array.from(this.selectedKeys())
      };
      await firstValueFrom(this.rolesApi.update(this.role.id, payload));
      this.toast.success('Role updated');
      this.updated.emit();
      this.close.emit();
    } catch (e: any) {
      const msg = e?.error?.message || e?.error?.error || e?.message || 'Failed to update role';
      this.toast.error(msg);
    } finally {
      this.saving.set(false);
    }
  }
}
