// src/app/features/referrals/pro-referral-list.page.ts
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { ProReferralService, ProReferral } from '../../core/services/pro-referral.service';

// children
import { ProReferralCreateComponent } from './pro-referral-create.component';
import { ProReferralUpdateComponent } from './pro-referral-update.component';
import { ProReferralDeleteComponent } from './pro-referral-delete.component';

@Component({
  standalone: true,
  selector: 'app-pro-referral-list-page',
  imports: [CommonModule, ProReferralCreateComponent, ProReferralUpdateComponent, ProReferralDeleteComponent],
  templateUrl: './pro-referral-list.page.html',
})
export class ProReferralListPage implements OnInit, OnDestroy {
  private api = inject(ProReferralService);
  private toast = inject(ToastrService);

  rows = signal<ProReferral[]>([]);
  loading = signal(false);

  showCreate = signal(false);
  editing = signal<ProReferral | null>(null);
  deleting = signal<ProReferral | null>(null);

  rowMenuFor = signal<string | null>(null);
  isRowMenuOpen = (code: string) => this.rowMenuFor() === code;
  toggleRowMenu(code: string, ev?: Event) {
    ev?.stopPropagation();
    this.rowMenuFor.update(open => (open === code ? null : code));
  }
  private _closeMenus = () => this.rowMenuFor.set(null);
  constructor() { document.addEventListener('click', this._closeMenus, true); }
  ngOnDestroy() { document.removeEventListener('click', this._closeMenus, true); }

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.api.list());
      const items = (res as any)?.items ?? (res as any) ?? res ?? [];
      this.rows.set(items);
    } catch (e: any) {
      this.toast.error(e?.error?.message || 'Failed to load referrals');
    } finally {
      this.loading.set(false);
    }
  }

  // open/close create
  openCreate() { this.showCreate.set(true); }
  closeCreate() { this.showCreate.set(false); }

  // open/close edit
  openEdit(r: ProReferral) { this.editing.set(r); }
  closeEdit() { this.editing.set(null); }

  // open/close delete
  openDelete(r: ProReferral) { this.deleting.set(r); }
  closeDelete() { this.deleting.set(null); }

  // events
  async onCreated(_: ProReferral) { this.toast.success('Referral created'); this.closeCreate(); await this.load(); }
  async onUpdated(_: ProReferral) { this.toast.success('Referral updated'); this.closeEdit(); await this.load(); }
  async onDeleted(_: string)      { this.toast.success('Referral deleted'); this.closeDelete(); await this.load(); }

  async toggleActiveInline(r: ProReferral) {
    try {
      const updated = await firstValueFrom(this.api.patch(r.referral_code, { active: !r.active }));
      // shallow update in place for UX snap
      this.rows.update(list => list.map(x => x.referral_code === r.referral_code ? updated : x));
      this.toast.success('Status updated');
    } catch (e: any) {
      this.toast.error(e?.error?.message || 'Failed to update status');
    }
  }
}
