// src/app/features/customers/customers-list.page.ts
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { RouterModule } from '@angular/router';

import {
  CustomersService,
  CustomersListRequest,
  CustomersListResponse,
  Customer
} from '../../core/services/customers.service';

@Component({
  standalone: true,
  selector: 'app-customers-list-page',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './customers-list.page.html'
})
export class CustomersListPage implements OnInit, OnDestroy {
  private api = inject(CustomersService);
  private fb  = inject(FormBuilder);
  private toast = inject(ToastrService);

  // table data
  customers = signal<Customer[]>([]);
  total = signal(0);
  loading = signal(false);
  Math = Math; 

  openRowId = signal<string | null>(null);

  toggleRow(c: Customer) {
    this.openRowId.update(id => (id === c.id ? null : c.id));
  }

  trackById(_: number, c: Customer) { return c.id; }

  // pagination
  limit = signal(20);
  offset = signal(0);

  // tri-state selects use 'all' | 'true' | 'false'
  form = this.fb.group({
    query: [''],
    phone_verified: ['all'],       // 'all' | 'true' | 'false'
    profile_completed: ['all'],    // 'all' | 'true' | 'false'
    sort_by: ['full_name'],        // 'full_name' | 'created_at_profile' | 'created_at_auth'
    sort_dir: ['asc'],             // 'asc' | 'desc'
    limit: [20]
  });

  // dropdown row menu (same pattern you used elsewhere)
  rowMenuFor = signal<string | null>(null);
  isRowMenuOpen = (id: string) => this.rowMenuFor() === id;
  toggleRowMenu(id: string, ev?: Event) {
    ev?.stopPropagation();
    this.rowMenuFor.update(x => (x === id ? null : id));
  }
  private closeMenus = () => this.rowMenuFor.set(null);

  constructor() {
    document.addEventListener('click', this.closeMenus, true);
  }
  ngOnDestroy() {
    document.removeEventListener('click', this.closeMenus, true);
  }

  async ngOnInit() { await this.load(true); }

  private buildRequest(resetOffset = false): CustomersListRequest {
    if (resetOffset) this.offset.set(0);

    const fv = this.form.value;

    const phone_verified =
      fv.phone_verified === 'true' ? true :
      fv.phone_verified === 'false' ? false : undefined;

    const profile_completed =
      fv.profile_completed === 'true' ? true :
      fv.profile_completed === 'false' ? false : undefined;

    const limit = Number(fv.limit ?? this.limit());
    this.limit.set(limit);

    return {
      query: (fv.query || '').trim() || undefined,
      phone_verified,
      profile_completed,
      sort_by: (fv.sort_by as CustomersListRequest['sort_by']) ?? 'full_name',
      sort_dir: (fv.sort_dir as CustomersListRequest['sort_dir']) ?? 'asc',
      limit,
      offset: this.offset()
    };
  }

  async load(resetOffset = false) {
    this.loading.set(true);
    try {
      const req = this.buildRequest(resetOffset);
      const res = await firstValueFrom(this.api.list(req)) as CustomersListResponse;
      this.customers.set(res.items ?? []);
      this.total.set(res.total ?? 0);
    } catch (e: any) {
      this.toast.error(e?.error?.message || e?.error?.error || 'Failed to load customers');
    } finally {
      this.loading.set(false);
    }
  }

  // UI events
  async onApplyFilters() { await this.load(true); }
  async onClearFilters() {
    this.form.reset({
      query: '',
      phone_verified: 'all',
      profile_completed: 'all',
      sort_by: 'full_name',
      sort_dir: 'asc',
      limit: 20
    });
    this.limit.set(20);
    await this.load(true);
  }

  hasPrev() { return this.offset() > 0; }
  hasNext() { return this.offset() + this.limit() < this.total(); }

  async prevPage() {
    if (!this.hasPrev()) return;
    this.offset.update(v => Math.max(0, v - this.limit()));
    await this.load(false);
  }

  async nextPage() {
    if (!this.hasNext()) return;
    this.offset.update(v => v + this.limit());
    await this.load(false);
  }
}
