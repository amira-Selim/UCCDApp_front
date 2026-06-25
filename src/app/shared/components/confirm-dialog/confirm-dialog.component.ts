import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  readonly dialog = inject(ConfirmDialogService);

  confirm(): void {
    this.dialog.resolve(true);
  }

  cancel(): void {
    this.dialog.resolve(false);
  }
}
