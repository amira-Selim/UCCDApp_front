import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Admin · Dashboard'
  },
  {
    path: 'students',
    loadComponent: () => import('./pages/students/students-list.component').then(m => m.StudentsListComponent),
    title: 'Admin · Students'
  },
  {
    path: 'courses',
    loadComponent: () => import('./pages/courses/courses-list.component').then(m => m.CoursesListComponent),
    title: 'Admin · Courses'
  },
  {
    path: 'courses/:id',
    loadComponent: () => import('./pages/course-details/course-details.component').then(m => m.CourseDetailsComponent),
    title: 'Admin · Course Details'
  },
  {
    path: 'jobs',
    loadComponent: () => import('./pages/jobs/jobs-list.component').then(m => m.JobsListComponent),
    title: 'Admin · Jobs'
  },
  {
    path: 'jobs/:id',
    loadComponent: () => import('./pages/job-details/job-details.component').then(m => m.JobDetailsComponent),
    title: 'Admin · Job Details'
  },
  {
    path: 'volunteers',
    loadComponent: () => import('./pages/volunteers/volunteers-list.component').then(m => m.VolunteersListComponent),
    title: 'Admin · Volunteering'
  },
  {
    path: 'volunteers/:id',
    loadComponent: () => import('./pages/volunteer-details/volunteer-details.component').then(m => m.VolunteerDetailsComponent),
    title: 'Admin · Volunteer Details'
  },
  {
    path: 'messages',
    loadComponent: () => import('./pages/messages/messages-list.component').then(m => m.MessagesListComponent),
    title: 'Admin · Messages'
  }
];
