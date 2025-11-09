// src/app/features/login/login.page.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../core/services/auth.service';
import { AuthStore } from '../../core/state/auth.store';
import { ProfileService } from '../../core/services/profile.service';

type MeRole = { id: string; key: string; name: string; is_admin: boolean };
type MeResponse = { id: string; email: string; roles: MeRole[]; permissions: string[] };

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.page.html',
})
export class LoginPage {
  get f() { return this.form.controls; }
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private authStore = inject(AuthStore);
  private toastr = inject(ToastrService);
  private profileSvc = inject(ProfileService);          // ⬅️ add this

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async onSubmit() {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);

    try {
      const { email, password } = this.form.value as { email: string; password: string };

      // 1) Login to get tokens + basic user (id/email)
      const res = await firstValueFrom(this.authService.login(email, password));
      this.authStore.setAuth({
        access_token: res.access_token,
        refresh_token: (res as any).refresh_token,
        user: res.user, // { id, email }
      });

      // 2) In parallel, fetch /me (roles/perms) and /profile (full_name)
      try {
        const [me, profile] = await Promise.all([
          firstValueFrom(this.authService.me()).catch(() => null),
          firstValueFrom(this.profileSvc.getProfile()).catch(() => null),
        ]);

        if (me) {
          this.authStore.setAuth({
            access_token: res.access_token,
            user: res.user,
            isAdmin: (me as MeResponse).roles?.some(r => r.is_admin) ?? false,
            perms: (me as MeResponse).permissions ?? [],
          });
        }

        if (profile) {
          // save full_name so navbar can show initials/name right away
          this.authStore.updateUser({ full_name: profile.full_name ?? null });
        }
      } catch { /* ignore enrichment failures */ }

      this.toastr.success('Signed in successfully');
      this.router.navigateByUrl('/dashboard');
    } catch (e: any) {
      const msg =
        e?.error?.message ||
        e?.error?.error ||
        e?.message ||
        'Login failed. Please check your credentials.';
      this.error.set(msg);
      this.toastr.error(msg, 'Login failed');
    } finally {
      this.loading.set(false);
    }
  }
}
