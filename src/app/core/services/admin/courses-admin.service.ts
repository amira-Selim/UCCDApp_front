import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Icources } from '../../interfaces/icources';
import { ICreateCourse, IUpdateCourse } from '../../interfaces/course.model';

/**
 * Admin-facing course management service.
 * Reuses the same `/api/Courses` endpoint that the public-facing
 * CoursesService (core/services/courses.service.ts) reads from, but adds the
 * Admin-only write operations (Create / Update / Delete) without touching
 * the existing read-only service used by the storefront pages.
 */
@Injectable({
  providedIn: 'root'
})
export class CoursesAdminService {
  private readonly _http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseUrl}/api/Courses`;

  getAll(): Observable<Icources[]> {
    return this._http.get<Icources[]>(this.baseUrl);
  }

  getById(id: number): Observable<Icources> {
    return this._http.get<Icources>(`${this.baseUrl}/${id}`);
  }

  create(dto: ICreateCourse): Observable<Icources> {
    return this._http.post<Icources>(this.baseUrl, dto);
  }

  update(id: number, dto: IUpdateCourse): Observable<Icources> {
    return this._http.put<Icources>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<boolean> {
    return this._http.delete<boolean>(`${this.baseUrl}/${id}`);
  }
}
