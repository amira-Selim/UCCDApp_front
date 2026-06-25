import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ApiResponse } from '../interfaces/api-response';
import { IstudentProfile, IUpdateBasicProfile, IUpdateProfessionalInfo } from '../interfaces/istudentprofile';

/**
 * Talks to `UCCD_App.Controllers.ProfileController` (`api/Profile/*`).
 * All three endpoints require the "Student" role - i.e. the signed-in
 * user must have already finished the Complete Profile step. The global
 * `authInterceptor` attaches the bearer token automatically, so no manual
 * headers are needed here.
 */
@Injectable({ providedIn: 'root' })
export class ShowProfileService {
  private readonly _HttpClient = inject(HttpClient);

  /** GET /api/Profile/me - the merged Register + Complete Profile + optional info for the signed-in student. */
  getMyProfile(): Observable<ApiResponse<IstudentProfile>> {
    return this._HttpClient.get<ApiResponse<IstudentProfile>>(`${environment.baseUrl}/api/Profile/me`);
  }

  /** PUT /api/Profile/update - updates full name, phone, faculty & graduation year. */
  updateBasicInfo(data: IUpdateBasicProfile): Observable<ApiResponse<IstudentProfile>> {
    return this._HttpClient.put<ApiResponse<IstudentProfile>>(`${environment.baseUrl}/api/Profile/update`, data);
  }

  /** PUT /api/Profile/update-professional-info - updates the optional education/skills/interests/career goal fields. */
  updateProfessionalInfo(data: IUpdateProfessionalInfo): Observable<ApiResponse<IstudentProfile>> {
    return this._HttpClient.put<ApiResponse<IstudentProfile>>(`${environment.baseUrl}/api/Profile/update-professional-info`, data);
  }
}
