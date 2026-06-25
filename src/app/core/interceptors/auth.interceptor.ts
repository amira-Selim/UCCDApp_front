import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { NotificationService } from '../services/notification.service';

/**
 * Attaches `Authorization: Bearer <token>` to every request going to the
 * API base URL, and centrally handles 401 (session expired -> redirect to
 * login) and 403 (forbidden -> redirect to unauthorized page) responses.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  const notify = inject(NotificationService);

  const isApiRequest = req.url.startsWith(environment.baseUrl);
  let authReq = req;

  if (isApiRequest && isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('userToken');
    if (token) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isApiRequest && isPlatformBrowser(platformId)) {
        if (error.status === 401) {
          notify.error('Your session has expired. Please sign in again.');
          localStorage.removeItem('userToken');
          localStorage.removeItem('fullName');
          router.navigate(['/auth/login']);
        } else if (error.status === 403) {
          notify.error('You do not have permission to perform this action.');
          router.navigate(['/unauthorized']);
        }
      }
      return throwError(() => error);
    })
  );
};
