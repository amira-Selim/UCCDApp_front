import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServiceService } from '../core/services/auth.service';

/**
 * Route guard restricting access to authenticated users (any role).
 *
 * Delegates to `AuthServiceService.isLoggedIn()` instead of reading
 * `localStorage` directly: that helper is SSR-safe (it only touches
 * `localStorage` in the browser) and also checks the token's expiry,
 * not just its presence.
 *
 * On failure, redirects to /auth/login and preserves the originally
 * requested URL as `?returnUrl=...` so the login flow can send the user
 * back to where they came from.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthServiceService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
