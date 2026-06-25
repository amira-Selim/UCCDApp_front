import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ApiResponse } from '../interfaces/api-response';
import { INotification } from '../interfaces/notification.model';

/**
 * Talks to `UCCD_App.Controllers.NotificationsController` (`api/Notifications/*`).
 * The backend itself decides whether the signed-in user gets their own
 * student notifications or the role-wide Admin notifications (based on
 * their JWT role) - so this one service works for both the student nav
 * bell and the admin topbar bell.
 */
@Injectable({ providedIn: 'root' })
export class NotificationsApiService {
  private readonly _http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseUrl}/api/Notifications`;

  getMyNotifications(): Observable<ApiResponse<INotification[]>> {
    return this._http.get<ApiResponse<INotification[]>>(`${this.baseUrl}/my`);
  }

  getUnreadCount(): Observable<ApiResponse<number>> {
    return this._http.get<ApiResponse<number>>(`${this.baseUrl}/unread-count`);
  }

  markAsRead(id: number): Observable<ApiResponse<string>> {
    return this._http.put<ApiResponse<string>>(`${this.baseUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<ApiResponse<string>> {
    return this._http.put<ApiResponse<string>>(`${this.baseUrl}/mark-all-read`, {});
  }
}
