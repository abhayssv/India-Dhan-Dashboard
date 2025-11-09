import { Component, Input, OnChanges, OnInit, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { CustomersService, ReferralsResponse } from '../../core/services/customers.service';

@Component({
  standalone: true,
  selector: 'app-customer-referrals',
  imports: [CommonModule],
  templateUrl: './customer-referrals.component.html',
})
export class CustomerReferralsComponent implements OnInit, OnChanges {
  @Input({ required: true }) userId!: string;

  private api = inject(CustomersService);
  private toast = inject(ToastrService);

  loading = signal(false);
  data = signal<ReferralsResponse | null>(null);

  ngOnInit() { if (this.userId) this.load(); }
  ngOnChanges(ch: SimpleChanges) { if (ch['userId'] && !ch['userId'].firstChange) this.load(); }

  async load() {
    if (!this.userId) return;
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.api.getReferrals(this.userId));
      this.data.set(res);
    } catch (e: any) {
      this.toast.error(e?.error?.message || e?.message || 'Failed to load referrals');
    } finally {
      this.loading.set(false);
    }
  }
}
