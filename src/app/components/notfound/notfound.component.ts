import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-notfound',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './notfound.component.html',
  styleUrl: './notfound.component.scss'
})
export class NotfoundComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
