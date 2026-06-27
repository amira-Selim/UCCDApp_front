import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../../interfaces/api-response';
import { IJobOpportunity } from '../../interfaces/job.model';

export interface ICompany {
  id: string;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompaniesService {
  private _http = inject(HttpClient);
  private baseUrl = `${environment.baseUrl}/api`;

  getCompanies(): Observable<ApiResponse<ICompany[]>> {
    return this._http.get<ApiResponse<ICompany[]>>(`${this.baseUrl}/Companies`);
  }

  createCompany(data: any): Observable<ApiResponse<ICompany>> {
    return this._http.post<ApiResponse<ICompany>>(`${this.baseUrl}/Companies`, data);
  }

  getCompanyJobs(email: string): Observable<ApiResponse<IJobOpportunity[]>> {
    return this._http.get<ApiResponse<IJobOpportunity[]>>(`${this.baseUrl}/Jobs/company/${email}`);
  }

  approveJob(jobId: number): Observable<ApiResponse<boolean>> {
    return this._http.put<ApiResponse<boolean>>(`${this.baseUrl}/Jobs/${jobId}/approve`, {});
  }

  rejectJob(jobId: number, reason: string): Observable<ApiResponse<boolean>> {
    return this._http.put<ApiResponse<boolean>>(`${this.baseUrl}/Jobs/${jobId}/reject`, { reason });
  }
}
