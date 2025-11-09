// src/app/features/profile/profile.page.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AuthStore } from '../../core/state/auth.store';

import { ProfileService, Profile } from '../../core/services/profile.service';

@Component({
  standalone: true,
  selector: 'app-profile-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.page.html',
})
export class ProfilePage implements OnInit {
  private fb = inject(FormBuilder);
  private profileApi = inject(ProfileService);
  private toast = inject(ToastrService);
  private authStore = inject(AuthStore);

  loading = signal(false);
  saving = signal(false);
  changing = signal(false);

  // Profile form
  form = this.fb.group({
    email: [{ value: '', disabled: true }], // read-only
    full_name: [''],
    avatar_url: [''],
  });

  // Password form
  passForm = this.fb.group({
    current_password: ['', [Validators.required]],
    new_password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async ngOnInit() {
    this.loading.set(true);
    try {
      const p = await firstValueFrom(this.profileApi.getProfile());
      this.patchProfile(p);
    } catch (e: any) {
      this.toast.error(e?.error?.message || 'Failed to load profile');
    } finally {
      this.loading.set(false);
    }
  }

  private patchProfile(p: Profile) {
    this.form.patchValue({
      email: p.email ?? '',
      full_name: p.full_name ?? '',
      avatar_url: p.avatar_url ?? '',
    });
  }

  async saveProfile() {
    if (this.saving()) return;
    this.saving.set(true);
    try {
      const { full_name, avatar_url } = this.form.getRawValue();
      await firstValueFrom(
        this.profileApi.updateProfile({
          full_name: (full_name ?? '').trim() || undefined,
          avatar_url: (avatar_url ?? '').trim() || undefined,
        })
      );
  
      // 🔹 Immediately reflect in navbar & everywhere:
      this.authStore.updateUser({
        full_name: (full_name ?? '').trim() || undefined,
        // avatar_url: (avatar_url ?? '').trim() || undefined,
      });
  
      this.toast.success('Profile updated');
    } catch (e: any) {
      this.toast.error(e?.error?.message || 'Failed to update profile');
    } finally {
      this.saving.set(false);
    }
  }

  async changePassword() {
    if (this.passForm.invalid || this.changing()) {
      this.passForm.markAllAsTouched();
      return;
    }
    this.changing.set(true);
    try {
      const { current_password, new_password } = this.passForm.value as {
        current_password: string; new_password: string;
      };
  
      await firstValueFrom(this.profileApi.changePassword({ current_password, new_password }));
  
      // Inform the user and force re-auth
      this.toast.success('Password changed successfully. Please log in again.');
  
      // This will call backend logout (if refresh token exists), clear local tokens, and navigate to /login
      await this.authStore.logout();
  
    } catch (e: any) {
      // your existing error extraction
      const msg = this.extractHttpError(e) || 'Failed to change password';
      this.toast.error(msg);
    } finally {
      this.changing.set(false);
    }
  }
  
   extractHttpError(err: any): string {
    // Angular HttpErrorResponse → err.error can be string | object
    if (err?.error != null) {
      if (typeof err.error === 'string') return err.error;                    // e.g. "invalid current password"
      if (typeof err.error === 'object') return err.error.message || err.error.error || '';
    }
    // Fallbacks
    if (err?.message) return err.message;
    return 'Something went wrong';
  }
  
}
