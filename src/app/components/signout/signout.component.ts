import { Component, inject } from '@angular/core';
import { AuthServiceService } from '../../core/services/auth.service';
import { WishlistStateService } from '../../core/services/wishlist-state.service';

@Component({
  selector: 'app-signout',
  standalone: true,
  template: `` // No UI - immediate redirect, like before.
})
export class SignoutComponent {

  private readonly _auth = inject(AuthServiceService);
  private readonly _wishlistState = inject(WishlistStateService);

  ngOnInit(): void {
    // Route through the single, centralized logout path (clears the
    // token + persisted name, resets the in-memory currentUser signal so
    // authGuard/hasRole() checks are correct immediately, and navigates
    // to /auth/login) instead of manually poking localStorage here -
    // the previous version didn't reset that signal at all, so a user
    // could still appear "logged in" elsewhere in the SPA until a hard
    // refresh, and it cleared a "userData" key that was never actually
    // used anywhere ("fullName" is the real key).
    this._wishlistState.clear();
    this._auth.logout();
  }
}
