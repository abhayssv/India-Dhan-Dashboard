import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { PermissionsService, Permission } from '../../../core/services/permissions.service';

@Component({
  standalone: true,
  selector: 'app-permission-delete',
  imports: [CommonModule],
  templateUrl: './permission-delete.component.html',
})
export class PermissionDeleteComponent {
  @Input()  permission!: Permission | null;
  @Output() close   = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<string>();

  private api = inject(PermissionsService);
  private toast = inject(ToastrService);

  deleting = signal(false);

  async remove() {
    if (!this.permission || this.deleting()) return;
    this.deleting.set(true);
    try {
      await firstValueFrom(this.api.remove(this.permission.id));
      this.toast.success('Permission deleted');
      this.deleted.emit(this.permission.id);
    } catch (e: any) {
      this.toast.error(e?.error?.message || 'Failed to delete permission');
    } finally {
      this.deleting.set(false);
    }
  }
}
