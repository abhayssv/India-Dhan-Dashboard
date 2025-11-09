import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';

import { AdminUsersService, AdminUserDetail } from '../../core/services/admin-users.service';
import { RolesService, Role } from '../../core/services/roles.service';

@Component({
  standalone: true,
  selector: 'app-user-update',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="offcanvas offcanvas-end show" tabindex="-1" style="visibility: visible; width: 480px;">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title">Edit User</h5>
      <button type="button" class="btn-close text-reset" (click)="close.emit()"></button>
    </div>
    <div class="offcanvas-body" *ngIf="user(); else loadingTpl">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="mb-3">
          <label class="form-label">Full name</label>
          <input class="form-control" formControlName="full_name" />
          <div class="text-danger mt-1" *ngIf="f('full_name')?.touched && f('full_name')?.errors?.['required']">Required.</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Email</label>
          <input class="form-control" type="email" formControlName="email" />
          <div class="text-danger mt-1" *ngIf="f('email')?.touched && f('email')?.errors?.['required']">Required.</div>
          <div class="text-danger mt-1" *ngIf="f('email')?.touched && f('email')?.errors?.['email']">Invalid email.</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Roles</label>
          <div class="border rounded p-2" style="max-height: 160px; overflow: auto;">
            <div class="form-check" *ngFor="let r of roles()">
            <input class="form-check-input" type="checkbox"
                [checked]="chosen().includes(r.key)"
                (change)="toggleRole(r.key, $any($event.target).checked)"
                id="er_{{r.key}}" />
              <label class="form-check-label" for="er_{{r.key}}">
                <strong>{{ r.name }}</strong> <small class="text-muted">({{ r.key }})</small>
              </label>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-outline-secondary" (click)="close.emit()">Cancel</button>
          <button class="btn btn-primary" [disabled]="saving()">Save</button>
        </div>
      </form>
    </div>

    <ng-template #loadingTpl>
      <div class="p-4 text-center text-muted">Loading…</div>
    </ng-template>
  </div>
  `
})
export class UserUpdateComponent implements OnInit {
  @Input() userId!: string;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private api = inject(AdminUsersService);
  private rolesApi = inject(RolesService);
  private toast = inject(ToastrService);

  user = signal<AdminUserDetail | null>(null);
  roles = signal<Role[]>([]);
  chosen = signal<string[]>([]);
  saving = signal(false);

  form = this.fb.group({
    full_name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
  });
  f = (k: string) => this.form.get(k);

  async ngOnInit() {
    try {
      const [u, r] = await Promise.all([
        firstValueFrom(this.api.getById(this.userId)),
        firstValueFrom(this.rolesApi.list()).catch(() => [] as Role[])
      ]);
      this.user.set(u);
      this.roles.set(r as Role[]);
      this.form.patchValue({ full_name: u.full_name ?? '', email: u.email });
      this.chosen.set((u.roles || []).map(rr => rr.key));
    } catch (e: any) {
      this.toast.error(e?.error?.message || 'Failed to load user');
    }
  }

  toggleRole(key: string, checked: boolean) {
    const next = new Set(this.chosen());
    checked ? next.add(key) : next.delete(key);
    this.chosen.set(Array.from(next));
  }

  extractError(e: any) {
    if (e?.error) {
      if (typeof e.error === 'string') return e.error;
      if (e.error.message || e.error.error) return e.error.message || e.error.error;
    }
    return 'Failed to update user';
  }

  async save() {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    try {
      const { full_name, email } = this.form.value as any;
      await firstValueFrom(this.api.update(this.userId, {
        full_name: (full_name ?? '').trim(),
        email: (email ?? '').trim(),
        role_keys: this.chosen(),
      }));
      this.updated.emit();
    } catch (e: any) {
      this.toast.error(this.extractError(e));
    } finally {
      this.saving.set(false);
    }
  }
}
