// src/app/core/services/customers.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';

export type Customer = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  referral_code: string | null;
  phone_verified: boolean;
  phone_verified_at?: string | null;
  profile_completed: boolean;
  created_at_profile: string; // ISO date
  created_at_auth: string;    // ISO date
  disabled: boolean;

  pan?: string | null;
  aadhaar?: string | null;
  gender?: 'male' | 'female' | 'other' | string | null;
  state?: string | null;
  city?: string | null;
  address?: string | null;
};

export type CustomersListRequest = {
  query?: string;
  phone_verified?: boolean;       // omit for “all”
  profile_completed?: boolean;    // omit for “all”
  sort_by?: 'full_name' | 'created_at_profile' | 'created_at_auth';
  sort_dir?: 'asc' | 'desc';
  limit: number;
  offset: number;
};

export type CustomersListResponse = {
  total: number;
  items: Customer[];
};

/* ---- Wallet ---- */
export type WalletEntry = {
    id: string;
    type: 'credit' | 'debit';
    coins: number;
    reason: string;
    meta: any | null;
    created_at: string;
  };
  
  export type WalletResponse = {
    user_id: string;
    balance: number;
    total: number;     // total entries for pagination
    entries: WalletEntry[];
  };
  
  /* ---- Referrals ---- */
  export type ReferralUser = {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    email_masked?: string | null;
    phone_masked?: string | null;
  };
  
  export type ReferralsResponse = {
    referrer: ReferralUser & { referral_code: string };
    outgoing: Array<{
      id: string;
      referred_user_id: string;
      status: 'completed' | 'pending' | string;
      reward_referrer: number;
      reward_referred: number;
      created_at: string;
      referred_user: ReferralUser;
    }>;
  };

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private http = inject(HttpService);

  list(payload: CustomersListRequest): Observable<CustomersListResponse> {
    return this.http.post<CustomersListResponse>('/api/admin/customers', payload);
  }

  /** GET /api/admin/customers/:id → plain Customer object */
  getOne(id: string): Observable<Customer> {
    return this.http.get<Customer>(`/api/admin/customers/${id}`);
  }

  getWallet(userId: string, params: { limit?: number; offset?: number } = {}): Observable<WalletResponse> {
    const limit = params.limit ?? 20;
    const offset = params.offset ?? 0;
    return this.http.get<WalletResponse>(`/api/admin/customers/wallet/${userId}?limit=${limit}&offset=${offset}`);
  }

  getReferrals(userId: string): Observable<ReferralsResponse> {
    return this.http.get<ReferralsResponse>(`/api/admin/customers/referrals/${userId}`);
  }
}
