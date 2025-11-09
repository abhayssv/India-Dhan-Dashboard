import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { PermissionsService, Permission } from '../../../core/services/permissions.service';
import { getHttpErrorMessage, prettifyError } from '../../../core/utils/http-error';

@Component({
  standalone: true,
  selector: 'app-permission-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './permission-create.component.html',
})
export class PermissionCreateComponent {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<Permission>();

  private fb = inject(FormBuilder);
  private api = inject(PermissionsService);
  private toast = inject(ToastrService);

  saving = signal(false);

  form = this.fb.group({
    key: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9.-]+$/)]],
    name: ['', [Validators.required, Validators.minLength(3)]],
  });

  touched(ctrl: 'key'|'name') { return this.form.controls[ctrl].touched; }

  async create() {
    if (this.form.invalid || this.saving()) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    try {
      const payload = this.form.value as { key: string; name: string };
      const res = await firstValueFrom(this.api.create(payload));
      this.toast.success('Permission created');
      this.created.emit(res);
    } catch (e: any) {
      const raw = getHttpErrorMessage(e);
      this.toast.error(prettifyError(raw)); 
    } finally {
      this.saving.set(false);
    }
  }
}
