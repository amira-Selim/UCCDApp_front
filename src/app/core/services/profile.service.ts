import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly _HttpClient = inject(HttpClient);
  private readonly _platformId = inject(PLATFORM_ID);
  
  constructor() { }

  private getHeaders(): HttpHeaders {
  let token = localStorage.getItem('userToken');
  console.log("Token being sent:", token); // <-- أضف هذا السطر
  
  return new HttpHeaders({
    'Authorization': `Bearer ${token}` // تأكد من وجود مسافة بعد كلمة Bearer
  });
}

  completeProfile(data: object): Observable<any> {
  const token = localStorage.getItem('userToken'); // جلب مباشر
  
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
  return this._HttpClient.post(`${environment.baseUrl}/api/Account/CompleteProfile`, data, { 
    headers: headers 
  });
} 
}