import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';

import { RolesService } from '../../core/services/roles.service';
import { PermissionsService, Permission } from '../../core/services/permissions.service';

@Component({
  standalone: true,
  selector: 'app-role-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './role-create.component.html'
})
export class RoleCreateComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private toast = inject(ToastrService);
  private rolesApi = inject(RolesService);
  private permsApi = inject(PermissionsService);

  saving = signal(false);
  allPerms = signal<Permission[]>([]);
  filteredPerms = signal<Permission[]>([]);
  selectedKeys = signal<Set<string>>(new Set());

  form = this.fb.group({
    key: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
    name: ['', [Validators.required]],
    is_admin: [false]
  });

  async ngOnInit() {
    try {
      const perms = await firstValueFrom(this.permsApi.list()); // already an array
      this.allPerms.set(perms);
      this.filteredPerms.set(perms);
    } catch (e) {
      // ignore; loader interceptor shows/hides
    }
  }

  t(name: 'key'|'name') { const c = this.form.controls[name]; return c.touched && c.invalid; }

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
        key: this.form.value.key!.trim(),
        name: this.form.value.name!.trim(),
        is_admin: !!this.form.value.is_admin,
        perm_keys: Array.from(this.selectedKeys())
      };
      await firstValueFrom(this.rolesApi.create(payload));
      this.toast.success('Role created');
      this.created.emit();
      this.close.emit();
    } catch (e: any) {
      const msg = e?.error?.message || e?.error?.error || e?.message || 'Failed to create role';
      this.toast.error(msg);
    } finally {
      this.saving.set(false);
    }
  }
}
