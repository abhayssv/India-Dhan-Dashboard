import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { ProReferralService, ProReferral } from '../../core/services/pro-referral.service';
import { getHttpErrorMessage, prettifyError } from '../../core/utils/http-error';

function fromIsoToLocal(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  // yyyy-MM-ddThh:mm for datetime-local
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function toIsoUTC(v: string | Date | null | undefined): string {
  if (!v) return new Date().toISOString();
  const d = typeof v === 'string' ? new Date(v) : v;
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
}

@Component({
  standalone: true,
  selector: 'app-pro-referral-update',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pro-referral-update.component.html',
})
export class ProReferralUpdateComponent {
  @Input()  referral!: ProReferral;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<ProReferral>();

  private fb = inject(FormBuilder);
  private api = inject(ProReferralService);
  private toast = inject(ToastrService);

  saving = signal(false);

  form = this.fb.group({
    is_premium: [true, []],
    active: [true, []],
    bonus_referrer: [0, [Validators.required, Validators.min(0)]],
    bonus_referred: [0, [Validators.required, Validators.min(0)]],
    starts_at: ['', [Validators.required]],
    ends_at: ['', [Validators.required]],
  });

  ngOnChanges() {
    if (this.referral) {
      this.form.patchValue({
        is_premium: this.referral.is_premium,
        active: this.referral.active,
        bonus_referrer: this.referral.bonus_referrer,
        bonus_referred: this.referral.bonus_referred,
        starts_at: fromIsoToLocal(this.referral.starts_at),
        ends_at: fromIsoToLocal(this.referral.ends_at),
      });
    }
  }

  touched(ctrl: keyof typeof this.form.controls) { return (this.form.controls as any)[ctrl].touched; }

  async update() {
    if (this.form.invalid || this.saving()) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    try {
      const v = this.form.value as any;
      const payload = {
        is_premium: !!v.is_premium,
        active: !!v.active,
        bonus_referrer: Number(v.bonus_referrer),
        bonus_referred: Number(v.bonus_referred),
        starts_at: toIsoUTC(v.starts_at),
        ends_at: toIsoUTC(v.ends_at),
      };
      const res = await firstValueFrom(this.api.patch(this.referral.referral_code, payload));
      this.toast.success('Referral updated');
      this.updated.emit(res);
    } catch (e: any) {
      const raw = getHttpErrorMessage(e);
      this.toast.error(prettifyError(raw) || 'Failed to update referral');
    } finally {
      this.saving.set(false);
    }
  }
}
