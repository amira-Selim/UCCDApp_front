import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../../interfaces/api-response';
import { ICreateJobOpportunity, IJobApplication, IJobOpportunity } from '../../interfaces/job.model';

@Injectable({
  providedIn: 'root'
})
export class JobsAdminService {
  private readonly _http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseUrl}/api/Jobs`;

  getAllForAdmin(): Observable<ApiResponse<IJobOpportunity[]>> {
    return this._http.get<ApiResponse<IJobOpportunity[]>>(`${this.baseUrl}/admin-all`);
  }

  create(dto: ICreateJobOpportunity): Observable<ApiResponse<IJobOpportunity>> {
    return this._http.post<ApiResponse<IJobOpportunity>>(`${this.baseUrl}/create`, dto);
  }

  getApplications(jobId: number): Observable<ApiResponse<IJobApplication[]>> {
    return this._http.get<ApiResponse<IJobApplication[]>>(`${this.baseUrl}/${jobId}/applications`);
  }

  getJobById(jobId: number): Observable<ApiResponse<IJobOpportunity>> {
    return this._http.get<ApiResponse<IJobOpportunity>>(`${this.baseUrl}/${jobId}`);
  }

  getCompanyJobs(): Observable<ApiResponse<IJobOpportunity[]>> {
    return this._http.get<ApiResponse<IJobOpportunity[]>>(`${this.baseUrl}/my-company-jobs`);
  }

  createByCompany(dto: ICreateJobOpportunity): Observable<ApiResponse<IJobOpportunity>> {
    return this._http.post<ApiResponse<IJobOpportunity>>(`${this.baseUrl}/company-create`, dto);
  }
}
