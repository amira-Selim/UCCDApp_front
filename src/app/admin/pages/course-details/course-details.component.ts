import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CoursesAdminService } from '../../../core/services/admin/courses-admin.service';
import { EnrollmentsAdminService } from '../../../core/services/admin/enrollments-admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { Icources } from '../../../core/interfaces/icources';
import { IEnrolledStudent, EnrollmentStatusOrdinal } from '../../../core/interfaces/enrollment.model';

import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

/**
 * Admin "Course Details" page.
 *
 * Reached by clicking a row in the Courses table (`/admin/courses/:id`).
 * Shows full course information plus a table of every student enrolled
 * in the course, fetched from `GET /api/StudentCourse/course/{id}/students`.
 *
 * Admins can also Approve / Reject a Pending enrollment, or mark an
 * Approved enrollment as Completed, directly from this table.
 */
@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent, StatusBadgeComponent],
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.scss'
})
export class CourseDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly coursesService = inject(CoursesAdminService);
  private readonly enrollmentsService = inject(EnrollmentsAdminService);
  private readonly notify = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly typeBadgeMap: Record<string, string> = {
    WorksShop: 'bg-info',
    Training: 'bg-primary',
    Advising: 'bg-success'
  };

  course = signal<Icources | null>(null);
  courseLoading = signal(true);
  courseError = signal<string | null>(null);

  students = signal<IEnrolledStudent[]>([]);
  studentsLoading = signal(true);
  studentsError = signal<string | null>(null);

  /** studentId currently being updated (disables that row's buttons while the request is in flight). */
  updatingStudentId = signal<number | null>(null);

  private courseId = 0;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      const id = Number(idParam);

      if (!idParam || Number.isNaN(id)) {
        this.courseLoading.set(false);
        this.studentsLoading.set(false);
        this.courseError.set('Invalid course id.');
        return;
      }

      this.courseId = id;
      this.loadCourse();
      this.loadStudents();
    });
  }

  loadCourse(): void {
    this.courseLoading.set(true);
    this.courseError.set(null);

    this.coursesService.getById(this.courseId).subscribe({
      next: (course) => {
        this.course.set(course);
        this.courseLoading.set(false);
      },
      error: () => {
        this.courseError.set('Failed to load course details. Please try again.');
        this.courseLoading.set(false);
        this.notify.error('Failed to load course details.');
      }
    });
  }

  loadStudents(): void {
    this.studentsLoading.set(true);
    this.studentsError.set(null);

    this.enrollmentsService.getStudentsByCourse(this.courseId).subscribe({
      next: (res) => {
        this.students.set(res.data ?? []);
        this.studentsLoading.set(false);
      },
      error: () => {
        this.studentsError.set('Failed to load enrolled students. Please try again.');
        this.studentsLoading.set(false);
        this.notify.error('Failed to load enrolled students.');
      }
    });
  }

  /** The backend enum is spelled "Aproved" - relabel it before it reaches the UI. */
  statusLabel(status: string): string {
    return status === 'Aproved' ? 'Approved' : status;
  }

  /** Raw backend status (as stored: "Pending" | "Aproved" | "Rejected" | "Completed"). */
  canApprove(status: string): boolean {
    return status === 'Pending' || status === 'Rejected';
  }

  canReject(status: string): boolean {
    return status === 'Pending' || status === 'Aproved';
  }

  canComplete(status: string): boolean {
    return status === 'Aproved';
  }

  hasAnyAction(status: string): boolean {
    return this.canApprove(status) || this.canReject(status) || this.canComplete(status);
  }

  async approve(student: IEnrolledStudent): Promise<void> {
    await this.changeStatus(student, EnrollmentStatusOrdinal.Approved, 'Approved', 'Aproved');
  }

  async reject(student: IEnrolledStudent): Promise<void> {
    await this.changeStatus(student, EnrollmentStatusOrdinal.Rejected, 'Rejected', 'Rejected');
  }

  async markCompleted(student: IEnrolledStudent): Promise<void> {
    await this.changeStatus(student, EnrollmentStatusOrdinal.Completed, 'Completed', 'Completed');
  }

  private async changeStatus(
    student: IEnrolledStudent,
    ordinal: EnrollmentStatusOrdinal,
    label: string,
    rawStatus: string
  ): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: `Mark Enrollment as ${label}`,
      message: `Are you sure you want to mark ${student.fullName}'s enrollment as ${label}?`,
      confirmText: label,
      variant: label === 'Rejected' ? 'danger' : 'primary'
    });

    if (!confirmed) return;

    this.updatingStudentId.set(student.studentId);

    this.enrollmentsService
      .updateStatus({ studentId: student.studentId, courseId: this.courseId, status: ordinal })
      .subscribe({
        next: () => {
          this.notify.success(`Enrollment marked as ${label}.`);
          this.students.update(list =>
            list.map(s => (s.studentId === student.studentId ? { ...s, status: rawStatus } : s))
          );
          this.updatingStudentId.set(null);
        },
        error: (err) => {
          const msg = err?.error?.message || 'Failed to update enrollment status.';
          this.notify.error(msg);
          this.updatingStudentId.set(null);
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/admin/courses']);
  }
}
