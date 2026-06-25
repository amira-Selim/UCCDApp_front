import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../../interfaces/api-response';
import { IStudent } from '../../interfaces/student.model';

import { IJobApplication } from '../../interfaces/job.model';
import { IVolunteerApplication } from '../../interfaces/volunteer.model';

@Injectable({
  providedIn: 'root'
})
export class StudentsAdminService {
  private readonly _http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseUrl}/api/Students`;

  getAll(): Observable<ApiResponse<IStudent[]>> {
    return this._http.get<ApiResponse<IStudent[]>>(this.baseUrl);
  }

  getById(id: number): Observable<ApiResponse<IStudent>> {
    return this._http.get<ApiResponse<IStudent>>(`${this.baseUrl}/${id}`);
  }

  getStudentJobs(id: number): Observable<ApiResponse<IJobApplication[]>> {
    return this._http.get<ApiResponse<IJobApplication[]>>(`${this.baseUrl}/${id}/jobs`);
  }

  getStudentVolunteers(id: number): Observable<ApiResponse<IVolunteerApplication[]>> {
    return this._http.get<ApiResponse<IVolunteerApplication[]>>(`${this.baseUrl}/${id}/volunteers`);
  }
}
