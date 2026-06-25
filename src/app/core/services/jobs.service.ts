import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';

export interface IJob {
  id: number;
  title: string;
  companyName: string;
  location: string;
  description: string;
  requirements: string;
  type: string;
  salary?: string;
  postedDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class JobsService {
  private readonly _HttpClient = inject(HttpClient);

  getAllJobs(): Observable<IJob[]> {
    return this._HttpClient.get<any>(`${environment.baseUrl}/api/Jobs/available`).pipe(
      map(res => {
        return (res.data || []).map((j: any) => ({
          id: j.id,
          title: j.title,
          companyName: j.companyName,
          location: j.location || 'Remote',
          description: j.description,
          requirements: j.requirements,
          type: j.type || 'FullTime',
          salary: j.salaryRange?.toString(),
          postedDate: j.createdAt
        }));
      })
    );
  }

  applyForJob(jobId: number, coverLetter: string, cvFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('CoverLetter', coverLetter);
    formData.append('CvFile', cvFile);
    return this._HttpClient.post(`${environment.baseUrl}/api/Jobs/${jobId}/apply`, formData);
  }

  getMyApplications(): Observable<any> {
    return this._HttpClient.get(`${environment.baseUrl}/api/Jobs/my-applications`);
  }

  cancelApplication(applicationId: number): Observable<any> {
    return this._HttpClient.delete(`${environment.baseUrl}/api/Jobs/applications/${applicationId}/cancel`);
  }
}
