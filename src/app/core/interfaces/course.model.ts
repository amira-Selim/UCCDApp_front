export const COURSE_TYPES = ['WorksShop', 'Training', 'Advising'] as const;
export type CourseType = typeof COURSE_TYPES[number];

export interface ICreateCourse {
  name: string;
  startDate?: string | null;
  duration: number;
  capacity: number;
  price: number;
  certificationFee: number;
  type: CourseType | string;

}

export interface IUpdateCourse {
  name: string;
  capacity: number;
  certificationFee: number;
  duration: number;
  price: number;
  startDate: string;
  type: CourseType | string;

}
