import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';

import { AdminUsersService, AdminUserListItem } from '../../core/services/admin-users.service';
import { UserCreateComponent } from './user-create.component';
import { UserUpdateComponent } from './user-update-component';
import { UserStatusComponent } from './user-status.component';

@Component({
  standalone: true,
  selector: 'app-admin-users-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UserCreateComponent, UserUpdateComponent, UserStatusComponent],
  template: `
  <!-- Breadcrumb -->
  <div class="d-flex align-items-center justify-content-between mb-3">
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb mb-0">
        <li class="breadcrumb-item"><a routerLink="/dashboard">Dashboard</a></li>
        <li class="breadcrumb-item active" aria-current="page">Admin Users</li>
      </ol>
    </nav>
    <button class="btn btn-primary" (click)="openCreate()">Create User</button>
  </div>

  <div class="card">
    <div class="card-header pb-0">
      <div class="row g-2 align-items-end">
        <div class="col-12 col-md-6">
          <label class="form-label">Search</label>
          <input class="form-control" placeholder="name/email/phone"
                 [ngModel]="query()" (ngModelChange)="query.set($event); reload()" />
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label">Status</label>
          <select class="form-select" [ngModel]="status()"
                  (ngModelChange)="status.set($event); reload()">
            <option value="all">All</option>
            <option value="active">Active only</option>
            <option value="disabled">Disabled only</option>
          </select>
        </div>
      </div>
      <div class="pt-2 small text-muted" *ngIf="total()">
        Showing {{ items().length }} of {{ total() }}
      </div>
    </div>

    <div class="table-responsive text-nowrap">
      <table class="table">
        <thead class="table-light">
          <tr>
            <th>Name / Email</th>
            <th>Roles</th>
            <th>Status</th>
            <th>Created</th>
            <th style="width: 72px;">Actions</th>
          </tr>
        </thead>
        <tbody class="table-border-bottom-0">
          <tr *ngFor="let u of items()">
            <td>
              <strong>{{ u.full_name || '—' }}</strong><br />
              <small class="text-muted">{{ u.email }}</small>
            </td>
            <td>
              <span *ngFor="let r of u.roles; let i = index"
                    class="badge bg-label-primary me-1">{{ r }}</span>
            </td>
            <td>
              <span class="badge" [class.bg-label-success]="!u.disabled" [class.bg-label-danger]="u.disabled">
                {{ u.disabled ? 'Disabled' : 'Active' }}
              </span>
            </td>
            <td><small>{{ u.created_at | date:'medium' }}</small></td>
            <td>
              <div class="dropdown">
                <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                  <i class="bx bx-dots-vertical-rounded"></i>
                </button>
                <div class="dropdown-menu">
                  <a class="dropdown-item" href="javascript:void(0)" (click)="openEdit(u.id)">
                    <i class="bx bx-edit-alt me-1"></i> Edit
                  </a>
                  <a class="dropdown-item" href="javascript:void(0)" (click)="openStatus(u)">
                    <i class="bx bx-user-x me-1" *ngIf="!u.disabled"></i>
                    <i class="bx bx-user-check me-1" *ngIf="u.disabled"></i>
                    {{ u.disabled ? 'Enable' : 'Disable' }}
                  </a>
                </div>
              </div>
            </td>
          </tr>
          <tr *ngIf="!items().length">
            <td colspan="5" class="text-center text-muted py-4">No users found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Slide-ins -->
  <app-user-create *ngIf="showCreate()"
  (close)="closeCreate()"
  (created)="onCreated()">
</app-user-create>

<app-user-update *ngIf="editingId()"
  [userId]="editingId()!"
  (close)="closeEdit()"
  (updated)="onUpdated()">
</app-user-update>

<app-user-status *ngIf="statusUser()"
  [user]="statusUser()!"
  (close)="closeStatus()"
  (changed)="onStatusChanged()">
</app-user-status>

  `
})
export class UsersListPage implements OnInit {
  private api = inject(AdminUsersService);
  private toast = inject(ToastrService);

  items = signal<AdminUserListItem[]>([]);
  total = signal(0);
  query = signal('');
  status = signal<'all' | 'active' | 'disabled'>('all');

  // modals/offcanvas
  showCreate = signal(false);
  editingId = signal<string | null>(null);
  statusUser = signal<AdminUserListItem | null>(null);

  async ngOnInit() { await this.reload(); }

  async reload() {
    try {
      const res = await firstValueFrom(
        this.api.list({
          query: this.query(),
          status: this.status(),
          limit: 50,
          offset: 0,
        })
      );
      this.items.set(res.items || []);
      this.total.set(res.total || 0);
    } catch (e: any) {
      this.toast.error(e?.error?.message || 'Failed to load users');
    }
  }

  // open/close
  openCreate() { this.showCreate.set(true); }
  closeCreate() { this.showCreate.set(false); }
  openEdit(id: string) { this.editingId.set(id); }
  closeEdit() { this.editingId.set(null); }
  openStatus(u: AdminUserListItem) { this.statusUser.set(u); }
  closeStatus() { this.statusUser.set(null); }

  // callbacks
  async onCreated() { this.toast.success('User created'); this.closeCreate(); await this.reload(); }
  async onUpdated() { this.toast.success('User updated'); this.closeEdit(); await this.reload(); }
  async onStatusChanged() { this.toast.success('Status updated'); this.closeStatus(); await this.reload(); }
}
