import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IContactMessage } from '../../interfaces/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessagesAdminService {
  private readonly _http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseUrl}/api/messages`;

  getAll(): Observable<IContactMessage[]> {
    return this._http.get<IContactMessage[]>(this.baseUrl);
  }

  getById(id: number): Observable<IContactMessage> {
    return this._http.get<IContactMessage>(`${this.baseUrl}/${id}`);
  }

  markAsRead(id: number): Observable<{ message: string }> {
    return this._http.put<{ message: string }>(`${this.baseUrl}/${id}/read`, {});
  }

  delete(id: number): Observable<{ message: string }> {
    return this._http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
