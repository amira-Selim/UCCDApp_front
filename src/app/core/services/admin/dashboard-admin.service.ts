import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StudentsAdminService } from './students-admin.service';
import { CoursesAdminService } from './courses-admin.service';
import { JobsAdminService } from './jobs-admin.service';
import { VolunteersAdminService } from './volunteers-admin.service';
import { MessagesAdminService } from './messages-admin.service';

export interface DashboardStats {
  studentsCount: number;
  coursesCount: number;
  jobsCount: number;
  approvedJobsCount: number;
  totalJobApplicants: number;
  volunteerOpportunitiesCount: number;
  activeVolunteerOpportunitiesCount: number;
  messagesCount: number;
  unreadMessagesCount: number;
  facultyBreakdown: { faculty: string; count: number }[];
  courseTypeBreakdown: { type: string; count: number }[];
}

/**
 * The backend doesn't expose a single "/api/dashboard" analytics endpoint,
 * so this service composes the dashboard statistics from the existing
 * Admin-protected endpoints already implemented in the API
 * (Students, Courses, Jobs, Volunteers, Messages).
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardAdminService {
  private readonly studentsSvc = inject(StudentsAdminService);
  private readonly coursesSvc = inject(CoursesAdminService);
  private readonly jobsSvc = inject(JobsAdminService);
  private readonly volunteersSvc = inject(VolunteersAdminService);
  private readonly messagesSvc = inject(MessagesAdminService);

  getStats(): Observable<DashboardStats> {
    return forkJoin({
      students: this.studentsSvc.getAll().pipe(catchError(() => of({ success: false, data: [] as any[] }))),
      courses: this.coursesSvc.getAll().pipe(catchError(() => of([] as any[]))),
      jobs: this.jobsSvc.getAllForAdmin().pipe(catchError(() => of({ success: false, data: [] as any[] }))),
      volunteers: this.volunteersSvc.getAllOpportunities().pipe(catchError(() => of({ success: false, data: [] as any[] }))),
      messages: this.messagesSvc.getAll().pipe(catchError(() => of([] as any[])))
    }).pipe(
      map(({ students, courses, jobs, volunteers, messages }) => {
        const studentsData = students.data ?? [];
        const jobsData = jobs.data ?? [];
        const volunteersData = volunteers.data ?? [];

        const facultyMap = new Map<string, number>();
        studentsData.forEach(s => {
          const faculty = s.faculty || 'Unspecified';
          facultyMap.set(faculty, (facultyMap.get(faculty) ?? 0) + 1);
        });

        const courseTypeMap = new Map<string, number>();
        courses.forEach(c => {
          const type = c.type || 'Unspecified';
          courseTypeMap.set(type, (courseTypeMap.get(type) ?? 0) + 1);
        });

        return {
          studentsCount: studentsData.length,
          coursesCount: courses.length,
          jobsCount: jobsData.length,
          approvedJobsCount: jobsData.filter(j => j.isApproved).length,
          totalJobApplicants: jobsData.reduce((sum, j) => sum + (j.totalApplicants || 0), 0),
          volunteerOpportunitiesCount: volunteersData.length,
          activeVolunteerOpportunitiesCount: volunteersData.filter(v => v.isActive).length,
          messagesCount: messages.length,
          unreadMessagesCount: messages.filter(m => !m.isRead).length,
          facultyBreakdown: Array.from(facultyMap.entries()).map(([faculty, count]) => ({ faculty, count })),
          courseTypeBreakdown: Array.from(courseTypeMap.entries()).map(([type, count]) => ({ type, count }))
        };
      })
    );
  }
}
