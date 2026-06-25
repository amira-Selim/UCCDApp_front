import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class WishListService {
  private readonly _HttpClient = inject(HttpClient);

  getOptions() {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
      })
    };
  }

  addToWishlist(courseId: number): Observable<any> {
    return this._HttpClient.post(`${environment.baseUrl}/api/Wishlist`, 
      { "courseId": courseId }, 
      this.getOptions() 
    );
  }

  userWishlist(): Observable<any> {
    return this._HttpClient.get(`${environment.baseUrl}/api/Wishlist`, 
      this.getOptions()
    );
  }

  deleteProduct(courseId: number): Observable<any> {
    return this._HttpClient.delete(`${environment.baseUrl}/api/Wishlist/${courseId}`, 
      this.getOptions()
    );
  }
}