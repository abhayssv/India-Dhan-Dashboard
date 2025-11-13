import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { InfluencersService, InfluencerDetailResponse } from '../../core/services/influencers.service';

@Component({
  standalone: true,
  selector: 'app-influencer-detail-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './influencer-detail.page.html',
})
export class InfluencerDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(InfluencersService);
  private toast = inject(ToastrService);

  loading = signal(false);
  data = signal<InfluencerDetailResponse | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.load(id);
  }

  async load(id: string) {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.api.getById(id));
      this.data.set(res);
    } catch (e: any) {
      this.toast.error(e?.error?.message || 'Failed to load influencer');
    } finally {
      this.loading.set(false);
    }
  }

  formatAddress(addr?: string | null, city?: string | null, state?: string | null): string {
    const parts = [addr, city, state].filter(Boolean) as string[];
    return parts.length ? parts.join(', ') : '—';
  }

  // small helpers (same pattern you liked earlier)
  maskPan(p?: string | null) { if (!p) return '—'; return `${p.slice(0,5)}****${p.slice(-1)}`; }
  maskAadhaar(a?: string | null) { if (!a || a.length<4) return '—'; return `XXXX-XXXX-${a.slice(-4)}`; }
  fmtGender(g?: string | null) { if (!g) return '—'; const s=g.trim(); return s? s[0].toUpperCase()+s.slice(1).toLowerCase():'—'; }
}
