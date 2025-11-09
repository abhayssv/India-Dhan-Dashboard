import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolesService, Role } from '../../core/services/roles.service';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-role-delete',
  imports: [CommonModule],
  templateUrl: './role-delete.component.html'
})
export class RoleDeleteComponent {
  @Input({ required: true }) role!: Role;
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  private rolesApi = inject(RolesService);
  private toast = inject(ToastrService);

  deleting = false;

  async confirm() {
    if (this.deleting) return;
    this.deleting = true;
    try {
      await firstValueFrom(this.rolesApi.remove(this.role.id));
      this.toast.success('Role deleted');
      this.deleted.emit();
      this.close.emit();
    } catch (e: any) {
      const msg = e?.error?.message || e?.error?.error || e?.message || 'Failed to delete role';
      this.toast.error(msg);
    } finally {
      this.deleting = false;
    }
  }
}
