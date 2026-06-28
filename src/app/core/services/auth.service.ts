import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { decodeJwt, isTokenExpired } from '../utils/jwt.util';

export interface CurrentUser {
  fullName: string;
  email: string;
  roles: string[];
  requirePasswordChange?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private readonly _HttpClient = inject(HttpClient)
  private readonly _platformId = inject(PLATFORM_ID)
  private readonly _router = inject(Router)

  /** Reactive signal holding the currently logged in user (or null). Kept in sync on login/logout. */
  readonly currentUser = signal<CurrentUser | null>(this.readUserFromStorage());

  constructor() { }

  setRegisterForm(data: object): Observable<any> {
    return this._HttpClient.post(`${environment.baseUrl}/api/Account/register`, data)
  }

  setloginForm(data: object): Observable<any> {
    return this._HttpClient.post(`${environment.baseUrl}/api/Account/login`, data).pipe(
      tap((res: any) => {
        if (res?.success && res?.data?.token) {
          this.persistSession(res.data.token, res.data.fullName, res.data.requirePasswordChange);
        }
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this._HttpClient.post(`${environment.baseUrl}/api/Account/forgot-password`, { email });
  }

  resetPassword(data: object): Observable<any> {
    return this._HttpClient.post(`${environment.baseUrl}/api/Account/reset-password`, data);
  }

  /** Persists the JWT + derived user info to localStorage (browser only) and updates the signal. */
  persistSession(token: string, fullName?: string, requirePasswordChange: boolean = false): void {
    if (isPlatformBrowser(this._platformId)) {
      localStorage.setItem('userToken', token);
      if (fullName) {
        localStorage.setItem('fullName', fullName);
      }
      localStorage.setItem('requirePasswordChange', requirePasswordChange ? 'true' : 'false');
    }
    this.currentUser.set(this.buildCurrentUser(token, fullName, requirePasswordChange));
  }

  logout(): void {
    if (isPlatformBrowser(this._platformId)) {
      localStorage.removeItem('userToken');
      localStorage.removeItem('fullName');
      localStorage.removeItem('requirePasswordChange');
    }
    this.currentUser.set(null);
    this._router.navigate(['/home']);
  }

  getToken(): string | null {
    return this.getLocalStorage('userToken');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !isTokenExpired(token);
  }

  getRoles(): string[] {
    return this.currentUser()?.roles ?? [];
  }

  hasRole(role: string): boolean {
    return this.getRoles().some(r => r.toLowerCase() === role.toLowerCase());
  }

  isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  isCompany(): boolean {
    return this.hasRole('Company');
  }

  changePassword(data: object): Observable<any> {
    return this._HttpClient.post(`${environment.baseUrl}/api/Account/change-password`, data);
  }

  private buildCurrentUser(token: string, fullNameFallback?: string, requirePasswordChange: boolean = false): CurrentUser | null {
    const decoded = decodeJwt(token);
    if (!decoded) return null;
    return {
      fullName: decoded.fullName || fullNameFallback || 'User',
      email: decoded.email || '',
      roles: decoded.roles || [],
      requirePasswordChange: requirePasswordChange
    };
  }

  private readUserFromStorage(): CurrentUser | null {
    const token = this.getLocalStorage('userToken');
    if (!token || isTokenExpired(token)) return null;
    const reqPwChangeStr = this.getLocalStorage('requirePasswordChange');
    const reqPwChange = reqPwChangeStr === 'true';
    return this.buildCurrentUser(token, this.getLocalStorage('fullName') || undefined, reqPwChange);
  }

  //////for the local storage
  private getLocalStorage(key: string): string | null {
    if (isPlatformBrowser(this._platformId)) {
      return localStorage.getItem(key);
    }
    return null;
  }
}
