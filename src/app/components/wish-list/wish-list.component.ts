import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistStateService } from '../../core/services/wishlist-state.service';
import { IWishlistItem } from '../../core/interfaces/wishlist.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-wish-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './wish-list.component.html',
  styleUrl: './wish-list.component.scss'
})
export class WishListComponent implements OnInit {
  private readonly _wishlistState = inject(WishlistStateService);

  isLoading = true;

  ngOnInit(): void {
    // Always re-fetch from the backend on this page so the list (and every
    // other heart icon in the app, since this is the same shared service)
    // reflects the real, current wishlist state - not stale local data.
    this._wishlistState.refresh();
    // A simple settle delay keeps this page's loading UX simple without
    // needing a second observable just for a one-shot spinner.
    setTimeout(() => { this.isLoading = false; }, 400);
  }

  get wishItems(): IWishlistItem[] {
    return this._wishlistState.getItems();
  }

  remove(courseId: number, courseName?: string): void {
    this._wishlistState.toggle(courseId, courseName);
  }
}
