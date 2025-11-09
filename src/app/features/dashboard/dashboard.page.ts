import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  DashboardService,
  DashboardSummary,
  RecentCustomer,
  TopReferrer
} from '../../core/services/dashboard.service';

@Component({
  standalone: true,
  selector: 'app-dashboard-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.page.html'
})
export class DashboardPage implements OnInit {
  private api = inject(DashboardService);
  private toast = inject(ToastrService);

  loading = signal(false);
  summary = signal<DashboardSummary | null>(null);
  recent  = signal<RecentCustomer[]>([]);
  /** NEW: top referrers */
  topReferrers = signal<TopReferrer[]>([]);

  async ngOnInit() {
    this.loading.set(true);
    try {
      const [sum, rec, tops] = await Promise.all([
        this.api.loadSummary(),
        this.api.loadRecentCustomers(8),
        this.api.loadTopReferrers(8, 'reward_sum', 'desc')  // NEW
      ]);
      this.summary.set(sum);
      this.recent.set(rec);
      this.topReferrers.set(tops);
    } catch (e: any) {
      this.toast.error(e?.error?.message || e?.error?.error || 'Failed to load dashboard');
    } finally {
      this.loading.set(false);
    }
  }

  pct(num: number, den: number) {
    if (!den) return 0;
    return Math.round((num / den) * 100);
  }
}
