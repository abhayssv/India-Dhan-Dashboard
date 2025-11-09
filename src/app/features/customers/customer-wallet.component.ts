import { Component, Input, OnChanges, OnInit, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { CustomersService, WalletEntry } from '../../core/services/customers.service';

@Component({
  standalone: true,
  selector: 'app-customer-wallet',
  imports: [CommonModule],
  templateUrl: './customer-wallet.component.html',
})
export class CustomerWalletComponent implements OnInit, OnChanges {
  @Input({ required: true }) userId!: string;

  private api = inject(CustomersService);
  private toast = inject(ToastrService);

  Math = Math; 

  loading = signal(false);
  balance = signal<number>(0);
  total = signal<number>(0);
  entries = signal<WalletEntry[]>([]);

  // pager
  limit = signal<number>(20);
  offset = signal<number>(0);

  ngOnInit() { if (this.userId) this.load(); }
  ngOnChanges(ch: SimpleChanges) {
    if (ch['userId'] && !ch['userId'].firstChange) {
      this.offset.set(0);
      this.load();
    }
  }

  async load() {
    if (!this.userId) return;
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.api.getWallet(this.userId, { limit: this.limit(), offset: this.offset() }));
      this.balance.set(res.balance ?? 0);
      this.total.set(res.total ?? 0);
      this.entries.set(res.entries ?? []);
    } catch (e: any) {
      this.toast.error(e?.error?.message || e?.message || 'Failed to load wallet');
    } finally {
      this.loading.set(false);
    }
  }

  get pageIndex() { return Math.floor(this.offset() / this.limit()); }
  get canPrev() { return this.offset() > 0; }
  get canNext() { return this.offset() + this.limit() < this.total(); }

  prev() {
    if (!this.canPrev) return;
    this.offset.update(v => Math.max(0, v - this.limit()));
    this.load();
  }
  next() {
    if (!this.canNext) return;
    this.offset.update(v => v + this.limit());
    this.load();
  }
  changePageSize(newSize: number) {
    this.limit.set(newSize);
    this.offset.set(0);
    this.load();
  }
}
