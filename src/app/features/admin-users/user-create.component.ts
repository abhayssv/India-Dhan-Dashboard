import { Component, EventEmitter, Output, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { AdminUsersService } from '../../core/services/admin-users.service';
import { RolesService, Role } from '../../core/services/roles.service';

@Component({
  standalone: true,
  selector: 'app-user-create',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="offcanvas offcanvas-end show" tabindex="-1" style="visibility: visible; width: 480px;">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title">Create User</h5>
      <button type="button" class="btn-close text-reset" (click)="close.emit()"></button>
    </div>
    <div class="offcanvas-body">
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="mb-3">
          <label class="form-label">Full name</label>
          <input class="form-control" formControlName="full_name" placeholder="e.g. NBFC Manager" />
          <div class="text-danger mt-1" *ngIf="t('full_name')?.touched && t('full_name')?.errors?.['required']">
            Full name is required.
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Email</label>
          <input class="form-control" formControlName="email" type="email" placeholder="name@company.com" />
          <div class="text-danger mt-1" *ngIf="t('email')?.touched && t('email')?.errors?.['required']">Email is required.</div>
          <div class="text-danger mt-1" *ngIf="t('email')?.touched && t('email')?.errors?.['email']">Invalid email.</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Password</label>
          <input class="form-control" formControlName="password" type="password" placeholder="Min 6 characters" />
          <div class="text-danger mt-1" *ngIf="t('password')?.touched && t('password')?.errors?.['required']">Password is required.</div>
          <div class="text-danger mt-1" *ngIf="t('password')?.touched && t('password')?.errors?.['minlength']">Min 6 characters.</div>
        </div>

        <div class="mb-3">
          <label class="form-label d-flex align-items-center justify-content-between">
            <span>Roles</span>
            <small class="text-muted">Select one or more</small>
          </label>
          <div class="border rounded p-2" style="max-height: 160px; overflow: auto;">
            <div class="form-check" *ngFor="let r of roles()">
            <input class="form-check-input" type="checkbox"
                [checked]="chosen().includes(r.key)"
                (change)="toggleRole(r.key, $any($event.target).checked)"
                id="role_{{r.key}}" />
              <label class="form-check-label" for="role_{{r.key}}">
                <strong>{{ r.name }}</strong> <small class="text-muted">({{ r.key }})</small>
              </label>
            </div>
          </div>
          <div class="text-danger mt-1" *ngIf="rolesTouched() && !chosen().length">
            Select at least one role.
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-outline-secondary" (click)="close.emit()">Cancel</button>
          <button class="btn btn-primary" [disabled]="saving()">Create</button>
        </div>
      </form>
    </div>
  </div>
  `
})
export class UserCreateComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private api = inject(AdminUsersService);
  private rolesApi = inject(RolesService);
  private toast = inject(ToastrService);

  saving = signal(false);
  roles = signal<Role[]>([]);
  chosen = signal<string[]>([]);
  _rolesTouched = false;

  form = this.fb.group({
    full_name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  t = (k: string) => this.form.get(k);
  rolesTouched = () => this._rolesTouched;

  async ngOnInit() {
    try {
      const r = await firstValueFrom(this.rolesApi.list());
      this.roles.set(r);
    } catch {
      this.toast.warning('Failed to load roles (you can still create user).');
    }
  }

  toggleRole(key: string, checked: boolean) {
    const next = new Set(this.chosen());
    checked ? next.add(key) : next.delete(key);
    this.chosen.set(Array.from(next));
    this._rolesTouched = true;
  }

  extractError(e: any) {
    if (e?.error) {
      if (typeof e.error === 'string') return e.error;
      if (e.error.message || e.error.error) return e.error.message || e.error.error;
    }
    return 'Failed to create user';
  }

  async submit() {
    if (this.form.invalid || !this.chosen().length || this.saving()) {
      this.form.markAllAsTouched();
      this._rolesTouched = true;
      return;
    }
    this.saving.set(true);
    try {
      const { full_name, email, password } = this.form.value as any;
      await firstValueFrom(this.api.create({
        email, password, full_name,
        role_keys: this.chosen(),
      }));
      this.created.emit();
    } catch (e: any) {
      this.toast.error(this.extractError(e));
    } finally {
      this.saving.set(false);
    }
  }
}
