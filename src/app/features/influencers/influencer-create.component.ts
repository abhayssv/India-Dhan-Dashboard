import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { InfluencersService, InfluencerCreateDto } from '../../core/services/influencers.service';

function toIsoUTC(v: string | Date | null | undefined): string | undefined {
  if (!v) return undefined;
  const d = typeof v === 'string' ? new Date(v) : v;
  if (Number.isNaN(d.getTime())) return undefined;
  // convert local datetime to UTC ISO without shifting intended wall time
  const tzOffsetMs = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tzOffsetMs).toISOString();
}

@Component({
  standalone: true,
  selector: 'app-influencer-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './influencer-create.component.html',
})
export class InfluencerCreateComponent {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  private api = inject(InfluencersService);
  private toast = inject(ToastrService);

  saving = signal(false);
  withPro = signal(true);

  form = this.fb.group({
    full_name: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    referral_code: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]{4,20}$/)]],

    // Pro campaign (flat controls for simplicity)
    pro_active: [true],
    pro_bonus_referrer: [250, [Validators.required, Validators.min(0)]],
    pro_bonus_referred: [150, [Validators.required, Validators.min(0)]],
    pro_starts_at: ['', Validators.required],
    pro_ends_at: ['', Validators.required],
  });

  // ---------- validation helpers ----------
  ctrl(name: keyof InfluencerCreateComponent['form']['controls'] | string): AbstractControl {
    return this.form.get(name as string)!;
  }
  touched(name: keyof InfluencerCreateComponent['form']['controls'] | string): boolean {
    const c = this.ctrl(name);
    return !!(c.touched || c.dirty);
  }
  hasError(name: keyof InfluencerCreateComponent['form']['controls'] | string, err: string): boolean {
    const c = this.ctrl(name);
    return this.touched(name) && !!c.errors?.[err];
  }
  isInvalid(name: keyof InfluencerCreateComponent['form']['controls'] | string): boolean {
    const c = this.ctrl(name);
    return this.touched(name) && c.invalid;
  }

  // Cross-field guard: Ends must be >= Starts (only when Pro is enabled)
  get dateRangeInvalid(): boolean {
    if (!this.withPro()) return false;
    const s = this.ctrl('pro_starts_at').value as string | null;
    const e = this.ctrl('pro_ends_at').value as string | null;
    if (!s || !e) return false;
    const start = new Date(s).getTime();
    const end = new Date(e).getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) return false;
    return end < start;
  }

  async create() {
    if (this.saving()) return;

    // mark all so feedback shows
    this.form.markAllAsTouched();

    // extra check for date range
    if (this.withPro() && this.dateRangeInvalid) return;

    if (this.form.invalid) return;

    this.saving.set(true);
    try {
      const v = this.form.value as any;
      const dto: InfluencerCreateDto = {
        full_name: v.full_name,
        phone: v.phone,
        email: v.email,
        referral_code: v.referral_code,
        pro: this.withPro()
          ? {
              active: !!v.pro_active,
              bonus_referrer: Number(v.pro_bonus_referrer),
              bonus_referred: Number(v.pro_bonus_referred),
              starts_at: toIsoUTC(v.pro_starts_at)!,
              ends_at: toIsoUTC(v.pro_ends_at)!,
            }
          : undefined,
      };

      const res = await firstValueFrom(this.api.create(dto));
      this.toast.success('Influencer created');
      this.created.emit(res);
    } catch (e: any) {
      this.toast.error(e?.error?.message || 'Failed to create influencer');
    } finally {
      this.saving.set(false);
    }
  }
}
