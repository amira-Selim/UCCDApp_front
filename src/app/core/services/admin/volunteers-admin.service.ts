import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../../interfaces/api-response';
import {
  ICreateVolunteerOpportunity,
  IVolunteerApplication,
  IVolunteerOpportunity,
  VolunteerStatus
} from '../../interfaces/volunteer.model';

@Injectable({
  providedIn: 'root'
})
export class VolunteersAdminService {
  private readonly _http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseUrl}/api/Volunteers`;

  getAllOpportunities(isActive?: boolean): Observable<ApiResponse<IVolunteerOpportunity[]>> {
    let url = `${this.baseUrl}/opportunities`;
    if (isActive !== undefined) {
      url += `?isActive=${isActive}`;
    }
    return this._http.get<ApiResponse<IVolunteerOpportunity[]>>(url);
  }

  create(dto: ICreateVolunteerOpportunity): Observable<ApiResponse<IVolunteerOpportunity>> {
    return this._http.post<ApiResponse<IVolunteerOpportunity>>(`${this.baseUrl}/opportunities`, dto);
  }

  update(id: number, dto: ICreateVolunteerOpportunity): Observable<ApiResponse<IVolunteerOpportunity>> {
    return this._http.put<ApiResponse<IVolunteerOpportunity>>(`${this.baseUrl}/opportunities/${id}`, dto);
  }

  getApplications(opportunityId: number): Observable<ApiResponse<IVolunteerApplication[]>> {
    return this._http.get<ApiResponse<IVolunteerApplication[]>>(`${this.baseUrl}/opportunities/${opportunityId}/applications`);
  }

  updateApplicationStatus(applicationId: number, newStatus: VolunteerStatus): Observable<ApiResponse<IVolunteerApplication>> {
    return this._http.put<ApiResponse<IVolunteerApplication>>(`${this.baseUrl}/applications/update-status`, {
      applicationId,
      newStatus
    });
  }
}
