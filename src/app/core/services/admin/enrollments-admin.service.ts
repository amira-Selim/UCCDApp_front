import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../../interfaces/api-response';
import { IUpdateEnrollmentStatus, IEnrolledStudent, IStudentRegisteredCourse } from '../../interfaces/enrollment.model';

/**
 * Wraps `StudentCourseController` (`/api/StudentCourse`).
 *
 * Besides the student-facing `enroll/{courseId}` and `my-enrollments`
 * endpoints, the controller exposes three Admin-only endpoints used by the
 * admin dashboard:
 *  - `PUT  admin/update-status`        update a single enrollment's status
 *  - `GET  course/{courseId}/students` all students enrolled in a course
 *  - `GET  student/{studentId}/courses` all courses a given student registered for
 */
@Injectable({
  providedIn: 'root'
})
export class EnrollmentsAdminService {
  private readonly _http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseUrl}/api/StudentCourse`;

  updateStatus(dto: IUpdateEnrollmentStatus): Observable<ApiResponse<string>> {
    return this._http.put<ApiResponse<string>>(`${this.baseUrl}/admin/update-status`, dto);
  }

  /** Students enrolled in a given course — powers the Course Details page. */
  getStudentsByCourse(courseId: number): Observable<ApiResponse<IEnrolledStudent[]>> {
    return this._http.get<ApiResponse<IEnrolledStudent[]>>(`${this.baseUrl}/course/${courseId}/students`);
  }

  /** Courses a given student is registered for — powers the Student Details "Registered Courses" section. */
  getCoursesByStudent(studentId: number): Observable<ApiResponse<IStudentRegisteredCourse[]>> {
    return this._http.get<ApiResponse<IStudentRegisteredCourse[]>>(`${this.baseUrl}/student/${studentId}/courses`);
  }
}
