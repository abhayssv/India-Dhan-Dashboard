import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { PermissionsService, Permission } from '../../../core/services/permissions.service';

@Component({
  standalone: true,
  selector: 'app-permission-update',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './permission-update.component.html',
})
export class PermissionUpdateComponent {
  @Input()  permission!: Permission;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<Permission>();

  private fb = inject(FormBuilder);
  private api = inject(PermissionsService);
  private toast = inject(ToastrService);

  saving = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
  });

  ngOnChanges() {
    if (this.permission) {
      this.form.patchValue({ name: this.permission.name });
    }
  }

  touched(ctrl: 'name') { return this.form.controls[ctrl].touched; }

  async update() {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    try {
      const res = await firstValueFrom(this.api.update(this.permission.id, { name: this.form.value.name! }));
      this.toast.success('Permission updated');
      this.updated.emit(res);
    } catch (e: any) {
      this.toast.error(e?.error?.message || 'Failed to update permission');
    } finally {
      this.saving.set(false);
    }
  }
}
