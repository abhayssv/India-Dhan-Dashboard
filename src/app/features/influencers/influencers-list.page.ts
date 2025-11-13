import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import {
  InfluencersService,
  InfluencersListQuery,
  InfluencersListResponse,
  InfluencerListItem
} from '../../core/services/influencers.service';
import { AuthStore } from '../../core/state/auth.store';

// child
import { InfluencerCreateComponent } from './influencer-create.component';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-influencers-list-page',
  imports: [CommonModule, InfluencerCreateComponent, RouterLink, FormsModule],
  templateUrl: './influencers-list.page.html',
})
export class InfluencersListPage implements OnInit {
  private api = inject(InfluencersService);
  private toast = inject(ToastrService);
  auth = inject(AuthStore);

  loading = signal(false);
  showCreate = signal(false);

  total = signal(0);
  items = signal<InfluencerListItem[]>([]);
  min(a: number, b: number) { return Math.min(a, b); }

  // filters + pagination (server side)
  limit = signal(20);
  offset = signal(0);
  query = signal('');
  active = signal<boolean | null>(true);
  phoneVerified = signal<boolean | null>(null);
  profileCompleted = signal<boolean | null>(null);
  startsFrom = signal<string | null>(null);
  endsTo = signal<string | null>(null);
  sortBy = signal<InfluencersListQuery['sort_by']>('referrals_completed');
  sortDir = signal<InfluencersListQuery['sort_dir']>('desc');

  ngOnInit() { this.load(); }

  async load() {
    this.loading.set(true);
    try {
      const body: InfluencersListQuery = {
        query: this.query() || '',
        active: this.active() ?? undefined,
        starts_from: this.startsFrom(),
        ends_to: this.endsTo(),
        phone_verified: this.phoneVerified() ?? undefined,
        profile_completed: this.profileCompleted() ?? undefined,
        sort_by: this.sortBy(),
        sort_dir: this.sortDir(),
        limit: this.limit(),
        offset: this.offset(),
      };
      const res = await firstValueFrom(this.api.list(body));
      this.total.set(res.total);
      this.items.set(res.items ?? []);
    } catch (e: any) {
      this.toast.error(e?.error?.message || 'Failed to load influencers');
    } finally {
      this.loading.set(false);
    }
  }

  // pagination
  nextPage() {
    if (this.offset() + this.limit() < this.total()) {
      this.offset.update(o => o + this.limit());
      this.load();
    }
  }
  prevPage() {
    if (this.offset() > 0) {
      this.offset.update(o => Math.max(0, o - this.limit()));
      this.load();
    }
  }
  resetToFirst() { this.offset.set(0); }

  // events
  openCreate() { this.showCreate.set(true); }
  closeCreate() { this.showCreate.set(false); }
  async onCreated(_: any) {
    this.toast.success('Influencer created');
    this.closeCreate();
    this.resetToFirst();
    await this.load();
  }
}
