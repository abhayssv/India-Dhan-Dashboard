import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { Observable } from 'rxjs';

export type LoanListItem = {
  loan_id: number;
  nbfc_user_id: string;
  username: string;
  email: string;
  status: number;
  mobile_no: string;
  pan_number: string;
  date_of_birth: string;
  required_amount: string;
  loan_status: string;
  nbfc_company: string;
};

export type LoansListResponse = {
  success: boolean;
  total_records: number;
  current_page: number;
  per_page: number;
  total_pages: number;
  data: LoanListItem[];
};

export type LoansListQuery = {
  page: number;
  limit: number;
  search: string;
  status: number[];        // e.g. [0,2,1,10]
  nbfc_company: string;    // '' for any
  sortBy: 'loan_status' | 'created_at' | 'username' | string;
  sortOrder: 'ASC' | 'DESC';
};

export type LoanDetail = {
  id: number;
  loan_id: number;
  nbfc_user_id: string;
  username: string;
  email: string;
  mobile_no: string;
  pan_number: string | null;
  address: string | null;
  status: number;
  loan_status: string;
  platform: string | null;
  nbfc_company: string;
  disburshed_amount: string | number | null;
  disburshed_date: string | null;
  disburshed_tenure: string | number | null;
  comments: string | null;
  loan_type: string | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  gender: string | null;
  profession_type: string | null;
  father_name: string | null;
  mother_name: string | null;
  marital_status: string | null;
  aadhar_no: string | null;
  date_of_birth: string | null;
  mode_of_salary: string | null;
  salary_account_bank_name: string | null;
  cibil_score: string | number | null;
  payment_delay: string | number | null;
  company_name: string | null;
  company_type: string | null;
  employment_type: string | null;
  net_montly_income: string | number | null;
  total_work_experience: string | number | null;
  work_experience_in_current_company: string | number | null;
  current_residence_type: string | null;
  current_residence_stability: string | null;
  total_emi_amount: string | number | null;
  credit_card_outstanding_amount: string | number | null;
  qualification: string | null;
  office_email_address: string | null;
  reason_for_loan: string | null;
  residence_address: string | null;
  p_house_no: string | null;
  p_appartment_building: string | null;
  p_area_sector: string | null;
  p_pincode: string | null;
  p_state: string | null;
  p_city: string | null;
  o_house_no: string | null;
  o_appartment_building: string | null;
  o_area_sector: string | null;
  o_pincode: string | null;
  o_state: string | null;
  o_city: string | null;
  required_amount: string | number | null;
  tenure: string | number | null;
  loan_amount: string | number | null;
  interest_rate: string | number | null;
  loan_tenure: string | number | null;
  monthly_emi: string | number | null;
  total_interest: string | number | null;
  total_amount: string | number | null;
  company_id: number;
  reviewer_1: string | null;
  reviewer_2: string | null;
  reason_to_reject: string | null;
  gst: string | null;
  anual_turn_over: string | null;
  data_of_incorporation: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LoanDetailResponse = {
  success: boolean;
  data: LoanDetail;
};

@Injectable({ providedIn: 'root' })
export class LoansService {
  private http = inject(HttpClient);
  private base = environment.vizzveApiBase; // different origin

  list(body: LoansListQuery): Observable<LoansListResponse> {
    // NOTE: cookie-based auth → must send credentials
    return this.http.post<LoansListResponse>(`${this.base}/loans`, body, {
      withCredentials: true,
    });
  }

  getDetail(loan_id: number | string, user_id: string): Observable<LoanDetailResponse> {
    return this.http.get<LoanDetailResponse>(`${this.base}/loan/${loan_id}/${user_id}`, {
      withCredentials: true,
    });
  }
}
