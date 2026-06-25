import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface AiResponse {
  resultText: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private readonly _HttpClient = inject(HttpClient);

  generateCoverLetter(jobId: number): Observable<any> {
    return this._HttpClient.post(`${environment.baseUrl}/api/Ai/cover-letter`, { jobId });
  }

  getRecommendations(): Observable<any> {
    return this._HttpClient.get(`${environment.baseUrl}/api/Ai/recommendations`);
  }

  getCourseRecommendations(request: any): Observable<any> {
    return this._HttpClient.post(`${environment.baseUrl}/api/Ai/recommendations/courses`, request);
  }
}
