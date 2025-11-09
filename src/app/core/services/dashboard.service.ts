import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpService } from './http.service';

export type DashboardSummary = {
  customers_total: number;
  customers_verified: number;
  customers_profile_completed: number;
  admin_users_total: number;
  roles_total: number;
  permissions_total: number;
  new_customers_24h?: number;
  wallet_total_coins?: number;
};

export type RecentCustomer = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at_profile: string;
};

/** NEW: Top referrers types */
export type TopReferrer = {
    referrer: {
      id: string;
      full_name: string | null;
      email: string | null;
      phone: string | null;
      referral_code: string;
      phone_verified: boolean;
      profile_completed: boolean;
      created_at_profile: string;
    };
    metrics: {
      total_count: number;
      completed_count: number;
      pending_count: number;
      reward_sum: number;
      reward_referrer_sum: number;
      reward_referred_sum: number;
      first_referral_at: string;
      last_referral_at: string;
    };
  };

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpService);

  /** Build summary from EXISTING endpoints only */
  async loadSummary(): Promise<DashboardSummary> {
    const baseCustomers = { query: '', sort_by: 'full_name', sort_dir: 'asc', limit: 1, offset: 0 };

    // customers (totals)
    const all  = await firstValueFrom(this.http.post<any>('/api/admin/customers', baseCustomers));
    const verf = await firstValueFrom(this.http.post<any>('/api/admin/customers', { ...baseCustomers, phone_verified: true }));
    const prof = await firstValueFrom(this.http.post<any>('/api/admin/customers', { ...baseCustomers, profile_completed: true }));

    // roles / permissions (items or array)
    const rolesRes = await firstValueFrom(this.http.get<any>('/api/admin/rbac/roles'));
    const permsRes = await firstValueFrom(this.http.get<any>('/api/admin/rbac/permissions'));
    const rolesCount = Array.isArray(rolesRes) ? rolesRes.length : (rolesRes?.items ?? rolesRes ?? []).length;
    const permsCount = Array.isArray(permsRes) ? permsRes.length : (permsRes?.items ?? permsRes ?? []).length;

    // admin users total
    const adminUsers = await firstValueFrom(
      this.http.post<any>('/api/admin/users/list', { query: '', status: 'all', limit: 1, offset: 0 })
    );

    return {
      customers_total: all?.total ?? 0,
      customers_verified: verf?.total ?? 0,
      customers_profile_completed: prof?.total ?? 0,
      admin_users_total: adminUsers?.total ?? 0,
      roles_total: rolesCount ?? 0,
      permissions_total: permsCount ?? 0
    };
  }

  /** Recent customers list via /customers with sort */
  async loadRecentCustomers(limit = 8): Promise<RecentCustomer[]> {
    const res = await firstValueFrom(this.http.post<any>('/api/admin/customers', {
      query: '',
      sort_by: 'created_at',
      sort_dir: 'desc',
      limit,
      offset: 0
    }));
    return res?.items ?? [];
  }

  /** NEW: Top referrers from your API */
  async loadTopReferrers(limit = 8, sortBy: 'reward_sum'|'completed_count'='reward_sum', sortDir: 'asc'|'desc'='desc'): Promise<TopReferrer[]> {
    const qs = `?sort_by=${sortBy}&sort_dir=${sortDir}&limit=${limit}&offset=0`;
    const res = await firstValueFrom(this.http.get<any>(`/api/admin/referrals/top${qs}`));
    return res?.items ?? [];
  }
}
