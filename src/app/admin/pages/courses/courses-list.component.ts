import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CoursesAdminService } from '../../../core/services/admin/courses-admin.service';
import { Icources } from '../../../core/interfaces/icources';
import { COURSE_TYPES } from '../../../core/interfaces/course.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { TableColumn } from '../../../shared/components/data-table/table-column.model';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTableComponent],
  templateUrl: './courses-list.component.html',
  styleUrl: './courses-list.component.scss'
})
export class CoursesListComponent implements OnInit {
  private readonly coursesService = inject(CoursesAdminService);
  private readonly notify = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  courses = signal<Icources[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  saving = signal(false);

  showForm = signal(false);
  editingCourse = signal<Icources | null>(null);

  courseTypes = COURSE_TYPES;

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true, width: '60px' },
    { key: 'name', label: 'Course Name', sortable: true },
    { key: 'type', label: 'Type', sortable: true, type: 'badge', badgeMap: { WorksShop: 'bg-info', Training: 'bg-primary', Advising: 'bg-success' } },

    { key: 'startDate', label: 'Start Date', sortable: true, type: 'date' },
    { key: 'duration', label: 'Duration (hrs)', sortable: true, width: '120px' },
    { key: 'capacity', label: 'Capacity', sortable: true, width: '100px' },
    { key: 'price', label: 'Price', sortable: true, type: 'currency' },
    { key: 'certificationFee', label: 'Cert. Fee', sortable: true, type: 'currency' },
  ];

  courseForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    type: ['Training', [Validators.required]],

    startDate: ['', [Validators.required]],
    duration: [1, [Validators.required, Validators.min(1)]],
    capacity: [1, [Validators.required, Validators.min(1)]],
    price: [0, [Validators.required, Validators.min(0)]],
    certificationFee: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading.set(true);
    this.error.set(null);
    this.coursesService.getAll().subscribe({
      next: (data) => {
        this.courses.set(data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load courses. Please try again.');
        this.loading.set(false);
        this.notify.error('Failed to load courses.');
      }
    });
  }

  openCreateForm(): void {
    this.editingCourse.set(null);
    this.courseForm.reset({
      name: '',
      type: 'Training',

      startDate: '',
      duration: 1,
      capacity: 1,
      price: 0,
      certificationFee: 0
    });
    this.showForm.set(true);
  }

  openEditForm(course: Icources): void {
    this.editingCourse.set(course);
    this.courseForm.reset({
      name: course.name,
      type: course.type,

      startDate: course.startDate ? course.startDate.substring(0, 10) : '',
      duration: course.duration,
      capacity: course.capacity,
      price: course.price,
      certificationFee: course.certificationFee
    });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingCourse.set(null);
  }

  submitForm(): void {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formValue = this.courseForm.getRawValue();
    const editing = this.editingCourse();

    const payload = {
      name: formValue.name!,
      type: formValue.type!,

      startDate: formValue.startDate ? new Date(formValue.startDate as string).toISOString() : null,
      duration: Number(formValue.duration),
      capacity: Number(formValue.capacity),
      price: Number(formValue.price),
      certificationFee: Number(formValue.certificationFee),
    };

    const request = editing
      ? this.coursesService.update(editing.id, payload as any)
      : this.coursesService.create(payload as any);

    request.subscribe({
      next: () => {
        this.notify.success(editing ? 'Course updated successfully.' : 'Course created successfully.');
        this.saving.set(false);
        this.closeForm();
        this.loadCourses();
      },
      error: (err) => {
        this.saving.set(false);
        this.notify.error(err?.error?.message || 'Failed to save the course.');
      }
    });
  }

  async deleteCourse(course: Icources): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete Course',
      message: `Are you sure you want to delete "${course.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger'
    });

    if (!confirmed) return;

    this.coursesService.delete(course.id).subscribe({
      next: () => {
        this.notify.success('Course deleted successfully.');
        this.loadCourses();
      },
      error: () => {
        this.notify.error('Failed to delete the course.');
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.courseForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  /** Navigates to the Course Details page when a row is clicked. */
  viewCourse(course: Icources): void {
    this.router.navigate(['/admin/courses', course.id]);
  }
}
