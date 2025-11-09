import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUsersService, AdminUserListItem } from '../../core/services/admin-users.service';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-user-status',
  imports: [CommonModule],
  template: `
  <div class="modal-backdrop fade show"></div>
  <div class="modal d-block" tabindex="-1" role="dialog" aria-modal="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ user.disabled ? 'Enable user' : 'Disable user' }}</h5>
          <button type="button" class="btn-close" (click)="close.emit()"></button>
        </div>
        <div class="modal-body">
          <p>
            Are you sure you want to
            <strong>{{ user.disabled ? 'enable' : 'disable' }}</strong>
            <br /><strong>{{ user.full_name || user.email }}</strong> ({{ user.email }})?
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-light" (click)="close.emit()">Cancel</button>
          <button class="btn" [ngClass]="user.disabled ? 'btn-success' : 'btn-danger'"
                  (click)="apply()" [disabled]="saving()">
            {{ user.disabled ? 'Enable' : 'Disable' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  `
})
export class UserStatusComponent {
  @Input({ required: true }) user!: AdminUserListItem;
  @Output() close = new EventEmitter<void>();
  @Output() changed = new EventEmitter<void>();

  private api = inject(AdminUsersService);
  private toast = inject(ToastrService);

  saving = signal(false);

  async apply() {
    if (this.saving()) return;
    this.saving.set(true);
    try {
      await firstValueFrom(this.api.updateStatus(this.user.id, !this.user.disabled));
      this.changed.emit();
    } catch (e: any) {
      const msg = e?.error?.message || e?.error?.error || 'Failed to update status';
      this.toast.error(msg);
    } finally {
      this.saving.set(false);
    }
  }
}
