import Dexie, { type EntityTable } from 'dexie';
import { User, Course, UserRole } from './types';

// Helper to get a date string N days from now
const getDateFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const INITIAL_USERS: User[] = [
  { id: '1', name: 'Alice Admin', email: 'alice@craft.com', role: UserRole.ADMIN, avatar: 'https://picsum.photos/id/1/200/200' },
  { id: '2', name: 'Bob Instructor', email: 'bob@craft.com', role: UserRole.INSTRUCTOR, avatar: 'https://picsum.photos/id/2/200/200' },
  { id: '3', name: 'Charlie Student', email: 'charlie@gmail.com', role: UserRole.STUDENT, avatar: 'https://picsum.photos/id/3/200/200' },
];

const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Modern Ceramics & Glazing',
    description: 'Learn the fundamentals of wheel throwing and glazing techniques. Create your own bowl set.',
    instructorId: '2',
    instructorName: 'Bob Instructor',
    date: getDateFromNow(2),
    price: 120,
    capacity: 8,
    enrolledStudentIds: ['3'],
    imageUrl: 'https://picsum.photos/id/40/800/600',
    category: 'Ceramics'
  },
  {
    id: 'c2',
    title: 'Leather Crafting Basics',
    description: 'Design and stitch your own leather wallet. Tools and materials provided.',
    instructorId: '2',
    instructorName: 'Bob Instructor',
    date: getDateFromNow(7),
    price: 95,
    capacity: 6,
    enrolledStudentIds: [],
    imageUrl: 'https://picsum.photos/id/80/800/600',
    category: 'Leather'
  },
  {
    id: 'c3',
    title: 'Watercolor Landscapes',
    description: 'Capture the beauty of nature with watercolor techniques. Suitable for beginners.',
    instructorId: '1',
    instructorName: 'Alice Admin',
    date: getDateFromNow(10),
    price: 60,
    capacity: 12,
    enrolledStudentIds: ['3'],
    imageUrl: 'https://picsum.photos/id/90/800/600',
    category: 'Painting'
  },
  {
    id: 'c4',
    title: 'Rustic Wood Stool',
    description: 'Build your own three-legged stool using traditional joinery. No power tools needed.',
    instructorId: '2',
    instructorName: 'Bob Instructor',
    date: getDateFromNow(14),
    price: 150,
    capacity: 5,
    enrolledStudentIds: [],
    imageUrl: 'https://picsum.photos/id/106/800/600',
    category: 'Woodworking'
  },
  {
    id: 'c5',
    title: 'Intro to Weaving',
    description: 'Learn the basics of weaving on a frame loom. Create a beautiful wall hanging.',
    instructorId: '1',
    instructorName: 'Alice Admin',
    date: getDateFromNow(20),
    price: 85,
    capacity: 10,
    enrolledStudentIds: [],
    imageUrl: 'https://picsum.photos/id/225/800/600',
    category: 'Textiles'
  }
];

// Define the Database
const db = new Dexie('CraftConnectDB') as Dexie & {
  users: EntityTable<User, 'id'>;
  courses: EntityTable<Course, 'id'>;
};

// Define Schema
db.version(1).stores({
  users: 'id, email, role', // Primary key and indexed props
  courses: 'id, instructorId, category'
});

// Seed Data on first run
db.on('populate', async () => {
  await db.users.bulkAdd(INITIAL_USERS);
  await db.courses.bulkAdd(MOCK_COURSES);
});

export { db };