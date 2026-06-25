/**
 * Mirrors `UCCD_App.Models.StudentStatus`:
 *
 *   public enum StudentStatus { Aproved, Rejected, Pending, Completed }
 *
 * IMPORTANT: `UpdateEnrollmentStatusDto.Status` is typed directly as the
 * `StudentStatus` enum (not a string), and the API has no
 * `JsonStringEnumConverter` registered (checked Program.cs / Extensions/*).
 * That means System.Text.Json will deserialize it using its DEFAULT
 * behaviour for enums: a numeric ordinal. Sending the string "Approved"
 * here would fail backend model binding. We therefore always send the
 * ordinal number show below, while still labeling it "Approved" in the UI
 * (the enum's own spelling, "Aproved", is a backend typo we don't want to
 * surface to admins).
 *
 * "Completed" can only be set by the backend if the enrollment was already
 * "Aproved" - the API rejects Pending/Rejected -> Completed transitions.
 */
export enum EnrollmentStatusOrdinal {
  Approved = 0,  // StudentStatus.Aproved
  Rejected = 1,  // StudentStatus.Rejected
  Pending = 2,   // StudentStatus.Pending
  Completed = 3, // StudentStatus.Completed
}

export type EnrollmentStatusLabel = 'Approved' | 'Rejected' | 'Pending' | 'Completed';

export const ENROLLMENT_STATUS_OPTIONS: { label: EnrollmentStatusLabel; value: EnrollmentStatusOrdinal }[] = [
  { label: 'Approved', value: EnrollmentStatusOrdinal.Approved },
  { label: 'Pending', value: EnrollmentStatusOrdinal.Pending },
  { label: 'Rejected', value: EnrollmentStatusOrdinal.Rejected },
  { label: 'Completed', value: EnrollmentStatusOrdinal.Completed },
];

export interface IUpdateEnrollmentStatus {
  studentId: number;
  courseId: number;
  status: EnrollmentStatusOrdinal;
}

/**
 * Minimal course info embedded in a student's own enrollment records.
 * Mirrors `UCCD_App.Dto.CourseDto`. Note: this slimmed-down DTO does not
 * carry an `instructor` field today, so the UI must treat it as optional.
 */
export interface IMyEnrollmentCourse {
  id: number;
  name: string;
  description: string;
  price: number;
  capacity: number;

}

/**
 * One row of the signed-in student's own enrollments.
 * Mirrors `UCCD_App.Dto.StudentEnrollmentDto` from
 * `GET /api/StudentCourse/my-enrollments`.
 * `status` is the raw backend enum text, e.g. "Aproved" | "Rejected" |
 * "Pending" | "Completed" (note the backend's own "Aproved" typo).
 */
export interface IMyEnrollment {
  studentId: number;
  courseId: number;
  status: string;
  courseDetails: IMyEnrollmentCourse | null;
}

/**
 * Response of `POST /api/StudentCourse/enroll/{courseId}`.
 * Mirrors `UCCD_App.Dto.EnrollmentResponseDto`.
 */
export interface IEnrollmentResult {
  studentId: number;
  status: string;
  requiresPayment: boolean;
  courseDetails: IMyEnrollmentCourse | null;
}

/**
 * One row in the Course Details page's "Enrolled Students" table.
 * Mirrors `UCCD_App.Dto.EnrolledStudentDto` from
 * `GET /api/StudentCourse/course/{courseId}/students`.
 */
export interface IEnrolledStudent {
  studentId: number;
  fullName: string;
  email: string;
  phone: string;
  /** ISO date string, or null for enrollments made before this field existed. */
  enrollmentDate: string | null;
  /** Raw backend enum text, e.g. "Aproved" | "Rejected" | "Pending". */
  status: string;
}

/**
 * One row in the Student Details panel's "Registered Courses" section.
 * Mirrors `UCCD_App.Dto.StudentRegisteredCourseDto` from
 * `GET /api/StudentCourse/student/{studentId}/courses`.
 */
export interface IStudentRegisteredCourse {
  courseId: number;
  courseName: string;

  startDate: string | null;
  /** Raw backend enum text, e.g. "Aproved" | "Rejected" | "Pending". */
  status: string;
}
