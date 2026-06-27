import { Component, OnInit, PLATFORM_ID, Inject, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as AOS from 'aos';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit, AfterViewInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      AOS.init({
        duration: 1000,
        once: true,
        offset: 100
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

}
