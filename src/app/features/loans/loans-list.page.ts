import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { LoansService, LoansListQuery, LoanListItem } from '../../core/services/loans.service';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../core/state/auth.store';

// ...imports stay the same...

const STATUS_LABELS: Record<number, string> = {
    0:  'Pending',
    1:  'In Review',
    2:  'Reject',
    3:  'Customer RNR',
    4:  'Documents Collected',
    5:  'Documents Pending',
    6:  'Sent to NBFC',
    7:  'Approve',
    8:  'Disbursed',
    10: 'Transferred',
  };
  
  // Helper: all codes
  const allStatusCodes = () => Object.keys(STATUS_LABELS).map(n => Number(n));
  
  @Component({
    standalone: true,
    selector: 'app-loans-list-page',
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './loans-list.page.html',
  })
  export class LoansListPage implements OnInit {
    private api = inject(LoansService);
    private toast = inject(ToastrService);
    auth = inject(AuthStore);
  
    loading = signal(false);
  
    // filters/signals
    page = signal(1);
    limit = signal(10);
    search = signal('');
    status = signal<number[]>(allStatusCodes());  // ✅ default = ALL
    nbfcCompany = signal('');
    sortBy = signal<'loan_status' | string>('loan_status');
    sortOrder = signal<'ASC'|'DESC'>('ASC');
  
    // data
    total = signal(0);
    items = signal<LoanListItem[]>([]);
  
    // status options for template
    statusOptions = Object.entries(STATUS_LABELS).map(([k, v]) => ({ code: Number(k), label: v }));
  
    ngOnInit() { this.load(); }
  
    async load() {
      this.loading.set(true);
      try {
        const body: LoansListQuery = {
          page: this.page(),
          limit: this.limit(),
          search: this.search(),
          status: this.status(),                 // sends ALL by default
          nbfc_company: this.nbfcCompany(),
          sortBy: this.sortBy(),
          sortOrder: this.sortOrder(),
        };
        const res = await firstValueFrom(this.api.list(body));
        this.total.set(res.total_records ?? 0);
        this.items.set(res.data ?? []);
      } catch (e: any) {
        this.toast.error(e?.error?.message || 'Failed to load loans');
      } finally {
        this.loading.set(false);
      }
    }
  
    // helpers used in template
    min(a: number, b: number) { return Math.min(a, b); }
    onPageChange(p: number) {
      if (p < 1) return;
      this.page.set(p);
      this.load();
    }
  
    statusLabel(code: unknown): string {
      const n = typeof code === 'string' ? Number(code) : (code as number);
      return Number.isFinite(n) && STATUS_LABELS[n as number]
        ? STATUS_LABELS[n as number]
        : `Unknown (${code as any})`;
    }
    statusBadge(code: unknown): string {
      const n = typeof code === 'string' ? Number(code) : (code as number);
      switch (n) {
        case 0:  return 'bg-label-secondary';
        case 1:  return 'bg-label-info';
        case 2:  return 'bg-label-danger';
        case 3:  return 'bg-label-warning';
        case 4:  return 'bg-label-primary';
        case 5:  return 'bg-label-warning';
        case 6:  return 'bg-label-primary';
        case 7:  return 'bg-label-success';
        case 8:  return 'bg-label-success';
        case 10: return 'bg-label-success';
        default: return 'bg-label-secondary';
      }
    }
  
    // ---- status multi-select helpers ----
    isStatusSelected(code: number) {
      return this.status().includes(code);
    }
    toggleStatus(code: number, checked: boolean) {
      const curr = new Set(this.status());
      if (checked) curr.add(code); else curr.delete(code);
      this.status.set(Array.from(curr));
    }
    selectAllStatus() {
      this.status.set(allStatusCodes());       // ✅ select ALL
    }
    clearAllStatus() {
      this.status.set([]);                     // none selected
    }
  
    // ---- reset all filters ----
    resetFilters() {
      this.page.set(1);
      this.limit.set(10);
      this.search.set('');
      this.nbfcCompany.set('');
      this.status.set(allStatusCodes());       // ✅ back to ALL
      this.sortBy.set('loan_status');
      this.sortOrder.set('ASC');
      this.load();
    }
  }
  
