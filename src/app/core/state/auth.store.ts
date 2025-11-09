import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../services/auth.service';

export type AdminUser = {
  id: string;
  email: string;
  full_name?: string | null;
};

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private router = inject(Router);
  private api = inject(AuthService);
  private toastr = inject(ToastrService);

  // --- state (rehydrate from localStorage) ---
  accessToken = signal<string | null>(localStorage.getItem('admin_access_token'));
  refreshToken = signal<string | null>(localStorage.getItem('admin_refresh_token'));
  user = signal<AdminUser | null>(JSON.parse(localStorage.getItem('admin_user') || 'null'));
  isAdmin = signal<boolean>(JSON.parse(localStorage.getItem('admin_is_admin') || 'false'));
  perms = signal<Set<string>>(new Set(JSON.parse(localStorage.getItem('admin_perms') || '[]')));

  // --- helpers ---
  isLoggedIn = () => !!this.accessToken();
  hasPermission = (key: string) => this.isAdmin() && this.perms().has(key);
  // Strict policy used by templates: must be admin AND have the perm
  canStrict = (key: string) => this.isAdmin() && this.hasPermission(key);
  /**
   * Use this right after login (when you have a full user {id,email}).
   * It merges with any existing stored user to preserve fields like full_name.
   */
  setAuth(payload: {
    access_token: string;
    refresh_token?: string;
    user: AdminUser;             // must include id + email
    isAdmin?: boolean;
    perms?: string[];
  }) {
    this.accessToken.set(payload.access_token);
    localStorage.setItem('admin_access_token', payload.access_token);

    if (payload.refresh_token) {
      this.refreshToken.set(payload.refresh_token);
      localStorage.setItem('admin_refresh_token', payload.refresh_token);
    }

    const mergedUser: AdminUser = { ...(this.user() ?? ({} as AdminUser)), ...payload.user };
    this.user.set(mergedUser);
    localStorage.setItem('admin_user', JSON.stringify(mergedUser));

    if (typeof payload.isAdmin === 'boolean') {
      this.isAdmin.set(payload.isAdmin);
      localStorage.setItem('admin_is_admin', JSON.stringify(payload.isAdmin));
    }
    if (payload.perms) {
      const set = new Set(payload.perms);
      this.perms.set(set);
      localStorage.setItem('admin_perms', JSON.stringify(Array.from(set)));
    }
  }

  /**
   * Use this to patch user fields later, e.g. { full_name } after /profile.
   */
  updateUser(patch: Partial<AdminUser>) {
    const current = this.user();
    if (!current) return;
    const merged: AdminUser = { ...current, ...patch };
    this.user.set(merged);
    localStorage.setItem('admin_user', JSON.stringify(merged));
  }

  private clearAuth() {
    this.accessToken.set(null);
    this.refreshToken.set(null);
    this.user.set(null);
    this.isAdmin.set(false);
    this.perms.set(new Set());

    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_is_admin');
    localStorage.removeItem('admin_perms');
  }

  /** Local sign-out without hitting the API (safe fallback). */
  signOutLocal() {
    this.clearAuth();
    this.router.navigateByUrl('/login');
  }

  /** Normal logout: try BE logout, toast, then clear locally and redirect. */
  async logout() {
    const rt = this.refreshToken();
    try {
      if (rt) {
        await firstValueFrom(this.api.logout(rt));
      }
      this.toastr.success('You have been logged out.');
    } catch (e: any) {
      const msg = e?.error?.message || e?.message || 'Signed out locally (server logout failed).';
      this.toastr.warning(msg, 'Logout');
    } finally {
      this.clearAuth();
      this.router.navigateByUrl('/login');
    }
  }
}
