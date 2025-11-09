import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { ProReferralService, ProReferral } from '../../core/services/pro-referral.service';
import { getHttpErrorMessage, prettifyError } from '../../core/utils/http-error';

function toIsoUTC(v: string | Date | null | undefined): string {
  if (!v) return new Date().toISOString();
  const d = typeof v === 'string' ? new Date(v) : v;
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
}

@Component({
  standalone: true,
  selector: 'app-pro-referral-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pro-referral-create.component.html',
})
export class ProReferralCreateComponent {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<ProReferral>();

  private fb = inject(FormBuilder);
  private api = inject(ProReferralService);
  private toast = inject(ToastrService);

  saving = signal(false);

  form = this.fb.group({
    referral_code: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]+$/)]],
    is_premium: [true, []],
    active: [true, []],
    bonus_referrer: [0, [Validators.required, Validators.min(0)]],
    bonus_referred: [0, [Validators.required, Validators.min(0)]],
    // use datetime-local strings; convert to ISO on submit
    starts_at: ['', [Validators.required]],
    ends_at: ['', [Validators.required]],
  });

  touched(ctrl: keyof typeof this.form.controls) { return (this.form.controls as any)[ctrl].touched; }

  async create() {
    if (this.form.invalid || this.saving()) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    try {
      const v = this.form.value as any;
      const payload = {
        referral_code: v.referral_code,
        is_premium: !!v.is_premium,
        active: !!v.active,
        bonus_referrer: Number(v.bonus_referrer),
        bonus_referred: Number(v.bonus_referred),
        starts_at: toIsoUTC(v.starts_at),
        ends_at: toIsoUTC(v.ends_at),
      };
      const res = await firstValueFrom(this.api.create(payload));
      this.toast.success('Referral created');
      this.created.emit(res);
    } catch (e: any) {
      const raw = getHttpErrorMessage(e);
      this.toast.error(prettifyError(raw) || 'Failed to create referral');
    } finally {
      this.saving.set(false);
    }
  }
}
