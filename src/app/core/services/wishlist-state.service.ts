import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WishListService } from './wishlist.service';
import { AuthServiceService } from './auth.service';
import { NotificationService } from './notification.service';
import { IWishlistItem } from '../interfaces/wishlist.model';

/**
 * Single source of truth for "is this course wishlisted?" across the app
 * (Courses page, Wishlist page, and any other page that wants a heart
 * icon). Wraps the existing `WishListService` (reused as-is) and adds:
 *  - in-memory cached state so the heart icon can render correctly the
 *    instant a page loads, without every component re-fetching the
 *    whole wishlist itself,
 *  - optimistic add/remove with rollback on failure,
 *  - a single load from the backend so state is correct on full page
 *    reloads (the wishlist is always re-fetched from the server, never
 *    guessed from local storage).
 *
 * NOTE: the backend's Wishlist feature is course-specific only (the
 * `Wishlist` table has a single `CourseId` FK, no item-type column), so
 * this service - like the API behind it - only supports Courses today.
 * It's written generically enough (plain numeric ids) that if/when Jobs
 * or Volunteer Opportunities ever get backend wishlist support, the same
 * pattern (and even this same service, with an item-type parameter)
 * could be extended to cover them too.
 */
@Injectable({ providedIn: 'root' })
export class WishlistStateService {
  private readonly _wishlistApi = inject(WishListService);
  private readonly _auth = inject(AuthServiceService);
  private readonly _notify = inject(NotificationService);
  private readonly _router = inject(Router);

  /** courseId -> wishlist row id (needed by nothing right now, but cheap to keep). */
  private wishlistedIds = new Set<number>();
  /** Full cached items, used by the dedicated Wishlist page so it doesn't need its own fetch. */
  private items: IWishlistItem[] = [];

  private loaded = false;
  private loading = false;

  /**
   * Loads the signed-in student's wishlist from the backend (always fresh -
   * this is what makes the heart state correct again after a page reload).
   * Safe to call multiple times; only the first concurrent call actually hits the network.
   */
  ensureLoaded(): void {
    if (this.loaded || this.loading) return;
    if (!this._auth.isLoggedIn() || !this._auth.hasRole('Student')) return;
    this.refresh();
  }

  /** Forces a fresh fetch from the backend (e.g. after login, or to recover from a desync). */
  refresh(): void {
    if (!this._auth.isLoggedIn() || !this._auth.hasRole('Student')) return;
    this.loading = true;
    this._wishlistApi.userWishlist().subscribe({
      next: (res) => {
        const list: IWishlistItem[] = Array.isArray(res) ? res : (res?.data || []);
        this.items = list;
        this.wishlistedIds = new Set(list.map(i => i.courseId));
        this.loaded = true;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading wishlist state', err);
        this.loading = false;
      }
    });
  }

  /** Clears cached state - call this on logout so a different user never sees a stale wishlist. */
  clear(): void {
    this.wishlistedIds = new Set();
    this.items = [];
    this.loaded = false;
  }

  isWishlisted(courseId: number | undefined | null): boolean {
    if (!courseId) return false;
    return this.wishlistedIds.has(courseId);
  }

  /** Cached wishlist items for the Wishlist page; triggers a load if we don't have any yet. */
  getItems(): IWishlistItem[] {
    this.ensureLoaded();
    return this.items;
  }

  get isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Adds or removes a course from the wishlist, updating local state
   * immediately (optimistic UI) and rolling back if the API call fails.
   */
  toggle(courseId: number | undefined | null, courseName?: string): void {
    if (!courseId) return;

    if (!this._auth.isLoggedIn()) {
      this._notify.info('Please sign in to save courses to your wishlist.');
      this._router.navigate(['/auth/login'], { queryParams: { returnUrl: this._router.url } });
      return;
    }

    if (this.isWishlisted(courseId)) {
      this.removeOptimistic(courseId, courseName);
    } else {
      this.addOptimistic(courseId, courseName);
    }
  }

  private addOptimistic(courseId: number, courseName?: string): void {
    this.wishlistedIds.add(courseId);

    this._wishlistApi.addToWishlist(courseId).subscribe({
      next: (res) => {
        // Refresh the cached item list (cheap - only happens on a successful add) so the
        // Wishlist page shows correct course name/price without a second round trip.
        const added = res?.data;
        if (added) {
          this.items = [...this.items.filter(i => i.courseId !== courseId), added];
        }
        this._notify.success(res?.message || `${courseName || 'Course'} added to your wishlist!`);
      },
      error: (err) => {
        // Rollback: the add failed, so the heart shouldn't have turned red.
        this.wishlistedIds.delete(courseId);
        if (err?.status === 409) {
          // Already in wishlist server-side (state had drifted) - treat as success, not an error.
          this.wishlistedIds.add(courseId);
          this.refresh();
          return;
        }
        console.error('Error adding to wishlist', err);
        this._notify.error(err?.error?.message || 'Could not add this course to your wishlist.');
      }
    });
  }

  private removeOptimistic(courseId: number, courseName?: string): void {
    this.wishlistedIds.delete(courseId);
    const previousItems = this.items;
    this.items = this.items.filter(i => i.courseId !== courseId);

    this._wishlistApi.deleteProduct(courseId).subscribe({
      next: () => {
        this._notify.success(`${courseName || 'Course'} removed from your wishlist.`);
      },
      error: (err) => {
        // Rollback: the remove failed, so the heart should stay red.
        this.wishlistedIds.add(courseId);
        this.items = previousItems;
        console.error('Error removing from wishlist', err);
        this._notify.error(err?.error?.message || 'Could not remove this course from your wishlist.');
      }
    });
  }
}
