import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServiceService } from '../services/auth.service';
import Swal from 'sweetalert2';

export const profileGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthServiceService);
  const router = inject(Router);

  // If not logged in, let the auth interceptor or other guards handle it, 
  // or redirect to login. We will redirect to login here.
  if (!auth.isLoggedIn()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // If logged in but doesn't have Student role (and not Admin)
  if (!auth.hasRole('Student') && !auth.isAdmin()) {
    Swal.fire({
      title: 'Complete Profile',
      text: 'Please complete your profile to proceed. It only takes a minute!',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Complete Now',
      cancelButtonText: 'Later',
      background: 'var(--bs-body-bg)',
      color: 'var(--bs-body-color)',
      customClass: {
        popup: 'rounded-4 shadow-lg border-0',
        title: 'fs-4 fw-bold font-heading',
        confirmButton: 'btn btn-main px-4 py-2 rounded-pill fw-medium',
        cancelButton: 'btn btn-secondary px-4 py-2 rounded-pill ms-2 fw-medium'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        router.navigate(['/profile'], { queryParams: { returnUrl: state.url } });
      }
    });
    return false; // Prevent navigation to Jobs so we don't get 403 Unauthorized
  }

  return true;
};
