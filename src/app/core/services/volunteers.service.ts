import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ApiResponse } from '../interfaces/api-response';
import { IVolunteerApplication, IVolunteerOpportunity } from '../interfaces/volunteer.model';

/**
 * Public/student-facing volunteer opportunities service.
 *
 * Talks to `UCCD_App.Controllers.VolunteersController`. Reuses the same
 * `IVolunteerOpportunity` / `IVolunteerApplication` interfaces as the admin
 * side (`volunteer.model.ts`) since they describe the exact same backend
 * DTOs - the previous version of this service declared its own
 * `IVolunteer` shape that didn't match the real API response at all
 * (missing fields like committee/requiredCount/deadline, and never
 * unwrapped the `{ success, data }` envelope), which is why opportunities
 * created by Admin never showed up for students.
 */
@Injectable({
  providedIn: 'root'
})
export class VolunteersService {
  private readonly _HttpClient = inject(HttpClient);
  private readonly baseUrl = `${environment.baseUrl}/api/Volunteers`;

  /** GET /api/Volunteers/opportunities - public; pass isActive=true to only show currently-open ones. */
  getAllVolunteers(isActive?: boolean): Observable<ApiResponse<IVolunteerOpportunity[]>> {
    let url = `${this.baseUrl}/opportunities`;
    if (isActive !== undefined) {
      url += `?isActive=${isActive}`;
    }
    return this._HttpClient.get<ApiResponse<IVolunteerOpportunity[]>>(url);
  }

  getVolunteerById(id: number): Observable<ApiResponse<IVolunteerOpportunity>> {
    return this._HttpClient.get<ApiResponse<IVolunteerOpportunity>>(`${this.baseUrl}/opportunities/${id}`);
  }

  /** POST /api/Volunteers/opportunities/{id}/apply - requires the "Student" role; body matches ApplyVolunteerDto. */
  applyForVolunteer(volunteerId: number, motivation: string, skills: string = ''): Observable<ApiResponse<IVolunteerApplication>> {
    return this._HttpClient.post<ApiResponse<IVolunteerApplication>>(
      `${this.baseUrl}/opportunities/${volunteerId}/apply`,
      { motivation, skills }
    );
  }

  getMyApplications(): Observable<ApiResponse<IVolunteerApplication[]>> {
    return this._HttpClient.get<ApiResponse<IVolunteerApplication[]>>(`${this.baseUrl}/my-applications`);
  }

  cancelApplication(applicationId: number): Observable<ApiResponse<any>> {
    return this._HttpClient.delete<ApiResponse<any>>(`${this.baseUrl}/applications/${applicationId}/cancel`);
  }
}
