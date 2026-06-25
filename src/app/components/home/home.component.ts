import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { RouterLink } from '@angular/router';
import { AuthServiceService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CarouselModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  _authService = inject(AuthServiceService);

  customOptionsTop: OwlOptions = {
    loop: true,
    autoplay: true,
    mouseDrag: true,
    autoplayTimeout: 5000,
    autoplayHoverPause: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 700,
    items: 1,
    responsiveRefreshRate: 0, 
    nav: false,
    autoWidth: false,
    animateOut: 'fadeOut',
    animateIn: 'fadeIn',
    responsive:{
      0:{items:1},
      1000:{items:1}
    }
  };

  testimonialOptions: OwlOptions = {
    loop: true,
    margin: 20,
    nav: false,
    dots: true,
    autoplay: true,
    autoplayTimeout: 4000,
    responsive: {
      0: { items: 1 },
      768: { items: 2 },
      992: { items: 3 }
    }
  };

  testimonials = [
    { name: 'Ahmed Ali', role: 'Computer Science Graduate', image: 'assets/images/team 1.jpg', text: 'UCCD helped me craft a professional resume and prepare for interviews. I landed my dream job within 2 months of graduation!' },
    { name: 'Sara Mohamed', role: 'Business Administration Student', image: 'assets/images/team 2.jpg', text: 'The soft skills workshops were game-changers for me. I feel much more confident presenting my ideas.' },
    { name: 'Omar Khaled', role: 'Engineering Alumni', image: 'assets/images/team 3.jpg', text: 'Thanks to the job shadowing program, I got real-world experience before even graduating. Highly recommend UCCD services.' },
    { name: 'Mona Youssef', role: 'IT Specialist', image: 'assets/images/team 4.jpg', text: 'The career counseling sessions helped me figure out exactly what path to take in the IT field. Truly grateful.' }
  ];

}
