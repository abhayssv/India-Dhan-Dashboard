import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { ProReferralService, ProReferral } from '../../core/services/pro-referral.service';

@Component({
  standalone: true,
  selector: 'app-pro-referral-delete',
  imports: [CommonModule],
  templateUrl: './pro-referral-delete.component.html',
})
export class ProReferralDeleteComponent {
  @Input()  referral!: ProReferral | null;
  @Output() close   = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<string>();

  private api = inject(ProReferralService);
  private toast = inject(ToastrService);

  deleting = signal(false);

  async remove() {
    if (!this.referral || this.deleting()) return;
    this.deleting.set(true);
    try {
      await firstValueFrom(this.api.remove(this.referral.referral_code));
      this.toast.success('Referral deleted');
      this.deleted.emit(this.referral.referral_code);
    } catch (e: any) {
      this.toast.error(e?.error?.message || 'Failed to delete referral');
    } finally {
      this.deleting.set(false);
    }
  }
}
