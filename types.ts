export enum UserRole {
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  date: string;
  price: number;
  capacity: number;
  enrolledStudentIds: string[];
  imageUrl: string;
  category: string;
}

export interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
}
