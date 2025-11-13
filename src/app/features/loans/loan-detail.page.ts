import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { LoansService, LoanDetail } from '../../core/services/loans.service';

type Row = { label: string; value: string | number };

@Component({
  standalone: true,
  selector: 'app-loan-detail-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './loan-detail.page.html',
})
export class LoanDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(LoansService);
  private toast = inject(ToastrService);

  loading = signal(false);
  data = signal<LoanDetail | null>(null);
  rows = signal<Row[]>([]);

    STATUS_LABELS: Record<number, string> = {
        0: 'Pending',
        1: 'In Review',
        2: 'Reject',
        3: 'Customer RNR',
        4: 'Documents Collected',
        5: 'Documents Pending',
        6: 'Sent to NBFC',
        7: 'Approve',
        8: 'Disbursed',
        10: 'Transferred',
    };

  async ngOnInit() {
    const loan_id = this.route.snapshot.paramMap.get('loan_id')!;
    const user_id = this.route.snapshot.paramMap.get('user_id')!;
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.api.getDetail(loan_id, user_id));
      const d = res.data;
      this.data.set(d);
      this.rows.set(this.buildRows(d));
    } catch (e: any) {
      this.toast.error(e?.error?.message || 'Failed to load loan details');
    } finally {
      this.loading.set(false);
    }
  }
  
  private getStatusLabel(code: unknown): string {
    const n = typeof code === 'string' ? Number(code) : (code as number);
    return Number.isFinite(n) && this.STATUS_LABELS[n as number] ? this.STATUS_LABELS[n as number] : `Unknown (${code})`;
  }

  private buildRows(d: LoanDetail): Row[] {
    const entries: [string, any][] = [
      ['Loan ID', d.loan_id],
      ['User ID', d.nbfc_user_id],
      ['Name', d.username],
      ['Email', d.email],
      ['Phone', d.mobile_no],
      ['PAN', d.pan_number],
  
      // ⬇️ Use numeric status -> label
      ['Status', this.getStatusLabel(d.status)],
  
      ['Platform', d.platform],
      ['NBFC Bank', d.nbfc_company],
      ['Required Amount', d.required_amount],
      ['Total Amount', d.total_amount],
      ['Disbursed Amount', d.disburshed_amount],
      ['Disbursed Date', d.disburshed_date],
      ['Disbursed Tenure', d.disburshed_tenure],
      ['Employment Type', d.employment_type],
      ['Gender', d.gender],
      ['Date of Birth', d.date_of_birth],
      ['CIBIL Score', d.cibil_score],
      ['Net Monthly Income', d.net_montly_income],
      ['Reason to Reject', d.reason_to_reject],
      ['Address', d.address],
      ['Residence Address', d.residence_address],
      ['Office Email', d.office_email_address],
      ['Company', d.company_name],
      ['Company Type', d.company_type],
      ['Created At', d.created_at],
      ['Updated At', d.updated_at],
    ];
  
    return entries
      .filter(([, v]) => v !== null && v !== undefined && v !== '')
      .map(([label, value]) => ({ label, value }));
  }
  
}
