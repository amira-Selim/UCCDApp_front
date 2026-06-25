import { environment } from './../environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/api-response';
import { IEnrollmentResult, IMyEnrollment } from '../interfaces/enrollment.model';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {

  private readonly _HttpClient = inject(HttpClient);

  getAllcources(): Observable<any> {
    return this._HttpClient.get(`${environment.baseUrl}/api/Courses`);
  }
 
  getCourseByID(id: string): Observable<any> {
    return this._HttpClient.get(`${environment.baseUrl}/api/Courses/${id}`);
  }

  /** GET /api/StudentCourse/my-enrollments - the signed-in student's own enrollments (requires the "Student" role). */
  getMyEnrollments(): Observable<ApiResponse<IMyEnrollment[]>> {
    return this._HttpClient.get<ApiResponse<IMyEnrollment[]>>(`${environment.baseUrl}/api/StudentCourse/my-enrollments`);
  }

  /**
   * POST /api/StudentCourse/enroll/{courseId} - enrolls the signed-in student in a course (requires the "Student" role).
   * The backend itself also refuses this if the student hasn't completed their profile yet
   * (no row in the Students table), returning `success: false` with an Arabic explanation -
   * callers should still pre-check `auth.hasRole('Student')` for a smoother UX, but this is the
   * authoritative source of truth.
   */
  enrollInCourse(courseId: number): Observable<ApiResponse<IEnrollmentResult>> {
    return this._HttpClient.post<ApiResponse<IEnrollmentResult>>(`${environment.baseUrl}/api/StudentCourse/enroll/${courseId}`, {});
  }

  cancelEnrollment(courseId: number): Observable<ApiResponse<any>> {
    return this._HttpClient.delete<ApiResponse<any>>(`${environment.baseUrl}/api/StudentCourse/cancel/${courseId}`);
  }
}
