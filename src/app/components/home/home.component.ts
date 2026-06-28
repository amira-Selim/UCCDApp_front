import { Component, HostListener, inject, OnInit, PLATFORM_ID, Inject, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { RouterLink } from '@angular/router';
import { AuthServiceService } from '../../core/services/auth.service';
import * as AOS from 'aos';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CarouselModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit {

  _authService = inject(AuthServiceService);
  isBrowser = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      AOS.init({
        duration: 800,
        once: true,
        offset: 50
      });
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.animateCounters();
    }
  }

  private animateCounters(): void {
    const counters = document.querySelectorAll('.count-num');
    const speed = 200; // The lower the slower

    counters.forEach((counter: any) => {
      const updateCount = () => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        
        // Lower inc to slow and higher to fast
        const inc = target / speed;

        // Check if target is reached
        if (count < target) {
          // Add inc to count and output in counter
          counter.innerText = Math.ceil(count + inc);
          // Call function every ms
          setTimeout(updateCount, 15);
        } else {
          counter.innerText = target;
        }
      };

      // Use IntersectionObserver to start animation when visible
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          updateCount();
          observer.disconnect();
        }
      }, { threshold: 0.5 });

      observer.observe(counter);
    });
  }

  customOptionsTop: OwlOptions = {
    loop: true,
    autoplay: true,
    mouseDrag: true,
    autoplayTimeout: 5000,
    autoplayHoverPause: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 1000,
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