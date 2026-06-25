import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { StudentsAdminService } from '../../../core/services/admin/students-admin.service';
import { EnrollmentsAdminService } from '../../../core/services/admin/enrollments-admin.service';
import { IStudent } from '../../../core/interfaces/student.model';
import { IStudentRegisteredCourse, EnrollmentStatusOrdinal } from '../../../core/interfaces/enrollment.model';
import { IJobApplication } from '../../../core/interfaces/job.model';
import { IVolunteerApplication } from '../../../core/interfaces/volunteer.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { TableColumn } from '../../../shared/components/data-table/table-column.model';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent, EmptyStateComponent, StatusBadgeComponent],
  templateUrl: './students-list.component.html',
  styleUrl: './students-list.component.scss'
})
export class StudentsListComponent implements OnInit {
  private readonly studentsService = inject(StudentsAdminService);
  private readonly enrollmentsService = inject(EnrollmentsAdminService);
  private readonly notify = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  students = signal<IStudent[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedStudent = signal<IStudent | null>(null);

  registeredCourses = signal<IStudentRegisteredCourse[]>([]);
  registeredCoursesLoading = signal(true);
  registeredCoursesError = signal<string | null>(null);

  studentJobs = signal<IJobApplication[]>([]);
  studentJobsLoading = signal(false);
  studentJobsError = signal<string | null>(null);
  studentJobsLoaded = signal(false);

  studentVolunteers = signal<IVolunteerApplication[]>([]);
  studentVolunteersLoading = signal(false);
  studentVolunteersError = signal<string | null>(null);
  studentVolunteersLoaded = signal(false);

  activeTab = signal<'courses' | 'jobs' | 'volunteers'>('courses');

  /** courseId currently being updated (disables that row's buttons while the request is in flight). */
  updatingCourseId = signal<number | null>(null);

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true, width: '60px' },
    { key: 'fullName', label: 'Full Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'faculty', label: 'Faculty', sortable: true },
    { key: 'graduationYear', label: 'Grad. Year', sortable: true, width: '110px' },
    { key: 'enrolledCoursesCount', label: 'Courses', sortable: true, width: '90px' },
  ];

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading.set(true);
    this.error.set(null);
    this.studentsService.getAll().subscribe({
      next: (res) => {
        this.students.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load students. Please try again.');
        this.loading.set(false);
        this.notify.error('Failed to load students.');
      }
    });
  }

  viewStudent(student: IStudent): void {
    this.selectedStudent.set(student);
    this.activeTab.set('courses');
    
    // Reset state
    this.registeredCourses.set([]);
    this.studentJobs.set([]);
    this.studentJobsLoaded.set(false);
    this.studentVolunteers.set([]);
    this.studentVolunteersLoaded.set(false);
    
    this.loadRegisteredCourses(student.id);
  }

  switchTab(tab: 'courses' | 'jobs' | 'volunteers'): void {
    this.activeTab.set(tab);
    const studentId = this.selectedStudent()?.id;
    if (!studentId) return;

    if (tab === 'jobs' && !this.studentJobsLoaded()) {
      this.loadStudentJobs(studentId);
    } else if (tab === 'volunteers' && !this.studentVolunteersLoaded()) {
      this.loadStudentVolunteers(studentId);
    }
  }

  loadRegisteredCourses(studentId: number): void {
    this.registeredCoursesLoading.set(true);
    this.registeredCoursesError.set(null);

    this.enrollmentsService.getCoursesByStudent(studentId).subscribe({
      next: (res) => {
        this.registeredCourses.set(res.data ?? []);
        this.registeredCoursesLoading.set(false);
      },
      error: () => {
        this.registeredCoursesError.set('Failed to load registered courses.');
        this.registeredCoursesLoading.set(false);
        this.notify.error('Failed to load registered courses.');
      }
    });
  }

  loadStudentJobs(studentId: number): void {
    this.studentJobsLoading.set(true);
    this.studentJobsError.set(null);

    this.studentsService.getStudentJobs(studentId).subscribe({
      next: (res) => {
        this.studentJobs.set(res.data ?? []);
        this.studentJobsLoading.set(false);
        this.studentJobsLoaded.set(true);
      },
      error: () => {
        this.studentJobsError.set('Failed to load job applications.');
        this.studentJobsLoading.set(false);
        this.notify.error('Failed to load job applications.');
      }
    });
  }

  loadStudentVolunteers(studentId: number): void {
    this.studentVolunteersLoading.set(true);
    this.studentVolunteersError.set(null);

    this.studentsService.getStudentVolunteers(studentId).subscribe({
      next: (res) => {
        this.studentVolunteers.set(res.data ?? []);
        this.studentVolunteersLoading.set(false);
        this.studentVolunteersLoaded.set(true);
      },
      error: () => {
        this.studentVolunteersError.set('Failed to load volunteer applications.');
        this.studentVolunteersLoading.set(false);
        this.notify.error('Failed to load volunteer applications.');
      }
    });
  }

  /** The backend enum is spelled "Aproved" - relabel it before it reaches the UI. */
  statusLabel(status: string): string {
    return status === 'Aproved' ? 'Approved' : status;
  }

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

  async approve(course: IStudentRegisteredCourse): Promise<void> {
    await this.changeStatus(course, EnrollmentStatusOrdinal.Approved, 'Approved', 'Aproved');
  }

  async reject(course: IStudentRegisteredCourse): Promise<void> {
    await this.changeStatus(course, EnrollmentStatusOrdinal.Rejected, 'Rejected', 'Rejected');
  }

  async markCompleted(course: IStudentRegisteredCourse): Promise<void> {
    await this.changeStatus(course, EnrollmentStatusOrdinal.Completed, 'Completed', 'Completed');
  }

  private async changeStatus(
    course: IStudentRegisteredCourse,
    ordinal: EnrollmentStatusOrdinal,
    label: string,
    rawStatus: string
  ): Promise<void> {
    const student = this.selectedStudent();
    if (!student) return;

    const confirmed = await this.confirmDialog.confirm({
      title: `Mark Enrollment as ${label}`,
      message: `Are you sure you want to mark ${student.fullName}'s enrollment in "${course.courseName}" as ${label}?`,
      confirmText: label,
      variant: label === 'Rejected' ? 'danger' : 'primary'
    });

    if (!confirmed) return;

    this.updatingCourseId.set(course.courseId);

    this.enrollmentsService
      .updateStatus({ studentId: student.id, courseId: course.courseId, status: ordinal })
      .subscribe({
        next: () => {
          this.notify.success(`Enrollment marked as ${label}.`);
          this.registeredCourses.update(list =>
            list.map(c => (c.courseId === course.courseId ? { ...c, status: rawStatus } : c))
          );
          this.updatingCourseId.set(null);
        },
        error: (err) => {
          const msg = err?.error?.message || 'Failed to update enrollment status.';
          this.notify.error(msg);
          this.updatingCourseId.set(null);
        }
      });
  }

  closeDetail(): void {
    this.selectedStudent.set(null);
    this.registeredCourses.set([]);
    this.registeredCoursesError.set(null);
  }
}
