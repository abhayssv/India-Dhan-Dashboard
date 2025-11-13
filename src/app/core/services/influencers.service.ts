import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpService } from './http.service';

export type InfluencerCreateDto = {
  full_name: string;
  phone: string;
  email: string;
  referral_code: string;
  pro?: {
    active: boolean;
    bonus_referrer: number;
    bonus_referred: number;
    starts_at: string; // ISO UTC
    ends_at: string;   // ISO UTC
  };
};

export type InfluencersListQuery = {
  query?: string;
  active?: boolean;
  starts_from?: string | null; // ISO
  ends_to?: string | null;     // ISO
  phone_verified?: boolean;
  profile_completed?: boolean;
  sort_by?: 'referrals_completed' | 'referrals_total' | 'coins_earned' | 'profile_created_at';
  sort_dir?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
};

export type InfluencerListItem = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  referral_code: string;
  profile_completed: boolean;
  phone_verified_at: string | null;
  submitted_at: string | null;
  profile_created_at: string;
  profile_updated_at: string;
  pro_active: boolean;
  pro_is_premium: boolean;
  pro_starts_at: string | null;
  pro_ends_at: string | null;
  pro_bonus_referrer: number | null;
  pro_bonus_referred: number | null;
  pro_created_at: string | null;
  pro_updated_at: string | null;
  referrals_total: number;
  referrals_completed: number;
  coins_earned: number;
};

export type InfluencersListResponse = {
  total: number;
  items: InfluencerListItem[];
};

export type InfluencerCreateResponse = {
  ok: boolean;
  user_id: string;
  referral_code: string;
  pro: boolean;
};

export type InfluencerDetailResponse = {
  profile: {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    avatar_url: string | null;
    referral_code: string;
    referred_by: string | null;
    profile_completed: boolean;
    submitted_at: string | null;
    onboarding_rewarded_at: string | null;
    phone_verified_at: string | null;
    pan: string | null;
    aadhaar: string | null;
    gender: string | null;
    state: string | null;
    city: string | null;
    address: string | null;
    created_at: string;
    updated_at: string;
    is_basic: boolean;
  };
  pro: {
    referral_code: string;
    is_premium: boolean;
    active: boolean;
    starts_at: string | null;
    ends_at: string | null;
    bonus_referrer: number | null;
    bonus_referred: number | null;
  } | null;
  stats: {
    referrals_total: number;
    referrals_completed: number;
    coins_earned: number;
  };
};

@Injectable({ providedIn: 'root' })
export class InfluencersService {
  private http = inject(HttpService);
  private base = '/api/admin/influencers';

  create(dto: InfluencerCreateDto): Observable<InfluencerCreateResponse> {
    return this.http.post<InfluencerCreateResponse>(this.base, dto);
  }

  list(body: InfluencersListQuery): Observable<InfluencersListResponse> {
    return this.http.post<InfluencersListResponse>(`${this.base}/list`, body);
  }

  getById(id: string): Observable<InfluencerDetailResponse> {
    return this.http.get<InfluencerDetailResponse>(`${this.base}/${id}`);
  }
}
