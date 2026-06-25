import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ICreateContactMessage, IContactMessage } from '../interfaces/message.model';

/**
 * Talks to `UCCD_App.Controllers.ContactController` (`api/messages`, POST).
 * Public endpoint - no auth required - matching the [AllowAnonymous] now
 * set on the backend Create action.
 */
@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly _http = inject(HttpClient);

  submit(message: ICreateContactMessage): Observable<IContactMessage> {
    return this._http.post<IContactMessage>(`${environment.baseUrl}/api/messages`, message);
  }
}
