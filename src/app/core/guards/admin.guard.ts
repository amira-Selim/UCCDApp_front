import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthServiceService } from '../services/auth.service';

/**
 * Route guard restricting access to authenticated users holding the
 * "Admin" role (as decoded from the JWT issued by UCCD_App's AccountController).
 *
 * - Not logged in            -> redirect to /auth/login
 * - Logged in but not Admin  -> redirect to /unauthorized
 * - Logged in and Admin      -> allow
 */
export const adminGuard: CanActivateFn & CanMatchFn = () => {
  const auth = inject(AuthServiceService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (!auth.isAdmin() && !auth.isCompany()) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};
