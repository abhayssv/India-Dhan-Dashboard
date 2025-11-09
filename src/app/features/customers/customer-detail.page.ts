import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { CustomerWalletComponent } from './customer-wallet.component';
import { CustomerReferralsComponent } from './customer-referrals.component';

import { CustomersService, Customer } from '../../core/services/customers.service';

@Component({
  standalone: true,
  selector: 'app-customer-detail-page',
  imports: [CommonModule, RouterLink, CustomerWalletComponent, CustomerReferralsComponent],
  templateUrl: './customer-detail.page.html',
})
export class CustomerDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(CustomersService);
  private toast = inject(ToastrService);

  loading = signal(false);
  customer = signal<Customer | null>(null);

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loading.set(true);
    try {
      const data = await firstValueFrom(this.api.getOne(id));
      this.customer.set(data);
    } catch (e: any) {
      this.toast.error(e?.error?.message || e?.message || 'Failed to load customer');
    } finally {
      this.loading.set(false);
    }
  }

  // small helpers for UI
  short(value?: string | null) {
    return value?.trim() || '—';
  }

  maskPan(pan?: string | null): string {
    if (!pan) return '—';
    const head = pan.slice(0, 5);
    const tail = pan.slice(-1);
    return `${head}****${tail}`;
  }
  
  maskAadhaar(aadhaar?: string | null): string {
    if (!aadhaar || aadhaar.length < 4) return '—';
    return `XXXX-XXXX-${aadhaar.slice(-4)}`;
  }
  
  formatGender(g?: string | null): string {
    if (!g) return '—';
    const s = g.toString().trim();
    if (!s) return '—';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }
  
  formatCityState(city?: string | null, state?: string | null): string {
    const parts = [city, state].filter(Boolean);
    return parts.length ? parts.join(', ') : '—';
  }
}
