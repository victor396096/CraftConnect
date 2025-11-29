import React, { useState, useEffect } from 'react';
import { User, Course, UserRole } from './types';
import { Dashboard } from './components/Dashboard';
import { Button } from './components/Button';
import { 
  Menu, 
  X, 
  Palette, 
  User as UserIcon, 
  Calendar, 
  LogOut, 
  Search,
  CheckCircle,
  MapPin
} from 'lucide-react';

// --- MOCK DATA ---
const MOCK_USERS: User[] = [
  { id: '1', name: 'Alice Admin', email: 'alice@craft.com', role: UserRole.ADMIN, avatar: 'https://picsum.photos/id/1/200/200' },
  { id: '2', name: 'Bob Instructor', email: 'bob@craft.com', role: UserRole.INSTRUCTOR, avatar: 'https://picsum.photos/id/2/200/200' },
  { id: '3', name: 'Charlie Student', email: 'charlie@gmail.com', role: UserRole.STUDENT, avatar: 'https://picsum.photos/id/3/200/200' },
];

// Helper to get a date string N days from now
const getDateFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

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

// --- APP COMPONENT ---

const App: React.FC = () => {
  // Global State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [view, setView] = useState<'home' | 'courses' | 'dashboard'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('home');
  };

  const handleEnroll = (courseId: string) => {
    if (!currentUser) {
      alert("Please login to enroll.");
      return;
    }
    if (currentUser.role !== UserRole.STUDENT) {
      alert("Only students can enroll in courses.");
      return;
    }

    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        if (c.enrolledStudentIds.includes(currentUser.id)) return c;
        if (c.enrolledStudentIds.length >= c.capacity) {
          alert("Course is full!");
          return c;
        }
        return { ...c, enrolledStudentIds: [...c.enrolledStudentIds, currentUser.id] };
      }
      return c;
    }));
    alert("Successfully enrolled!");
  };

  const handleAddCourse = (newCourse: Course) => {
    setCourses([newCourse, ...courses]);
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
  };

  // Views
  const renderHome = () => (
    <div className="space-y-16 pb-16">
      {/* Hero */}
      <div className="relative bg-brand-800 text-white rounded-3xl overflow-hidden mx-4 md:mx-0 mt-4 min-h-[500px] flex items-center">
        <div className="absolute inset-0">
          <img 
            src="https://picsum.photos/id/20/1200/800" 
            alt="Crafting" 
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative z-10 px-8 md:px-16 max-w-2xl">
          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm mb-4 inline-block">
            Discover your creativity
          </span>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Handmade with <span className="text-brand-300">Heart</span>.
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Join our community of makers. Master traditional crafts or explore modern DIY techniques with expert instructors.
          </p>
          <Button onClick={() => setView('courses')} className="text-lg px-8 py-3">
            Browse Workshops
          </Button>
        </div>
      </div>

      {/* Featured */}
      <div className="px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Workshops</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {courses.slice(0, 3).map(course => (
             <div key={course.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
               <div className="h-48 overflow-hidden relative">
                 <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                 <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-700">
                   ${course.price}
                 </span>
               </div>
               <div className="p-6">
                 <div className="text-xs text-brand-600 font-semibold mb-2 uppercase tracking-wider">{course.category}</div>
                 <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                 <p className="text-gray-500 text-sm mb-4 line-clamp-2">{course.description}</p>
                 <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {course.date}
                    </div>
                    <Button variant="secondary" onClick={() => setView('courses')}>Details</Button>
                 </div>
               </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCourses = () => {
    const filteredCourses = courses.filter(c => 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-gray-900">All Workshops</h2>
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search by title or category..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => {
            const isFull = course.enrolledStudentIds.length >= course.capacity;
            const isEnrolled = currentUser && course.enrolledStudentIds.includes(currentUser.id);

            return (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                <div className="h-56 relative">
                  <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                     <p className="text-sm font-medium opacity-90">{course.instructorName}</p>
                     <h3 className="text-xl font-bold">{course.title}</h3>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                     <p className="text-gray-600 flex-1">{course.description}</p>
                     <span className="ml-2 text-[10px] uppercase font-bold text-brand-600 tracking-wider bg-brand-50 px-2 py-0.5 rounded-full whitespace-nowrap">{course.category}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-2">
                       <Calendar className="w-4 h-4 text-brand-500" />
                       {course.date}
                    </div>
                    <div className="flex items-center gap-2">
                       <MapPin className="w-4 h-4 text-brand-500" />
                       Studio A
                    </div>
                    <div className="flex items-center gap-2">
                       <UserIcon className="w-4 h-4 text-brand-500" />
                       {course.capacity - course.enrolledStudentIds.length} spots left
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">${course.price}</span>
                    {isEnrolled ? (
                      <span className="flex items-center gap-1 text-green-600 font-medium bg-green-50 px-3 py-2 rounded-lg">
                        <CheckCircle className="w-4 h-4" /> Enrolled
                      </span>
                    ) : (
                      <Button 
                        disabled={isFull || !currentUser || currentUser.role !== UserRole.STUDENT}
                        onClick={() => handleEnroll(course.id)}
                        className="w-1/2"
                      >
                        {isFull ? 'Full' : 'Enroll Now'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-brand-50 font-sans text-gray-800">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => setView('home')}>
              <div className="bg-brand-600 text-white p-2 rounded-lg mr-2">
                <Palette className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">CraftConnect</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => setView('home')} className={`${view === 'home' ? 'text-brand-600 font-semibold' : 'text-gray-500 hover:text-gray-900'}`}>Home</button>
              <button onClick={() => setView('courses')} className={`${view === 'courses' ? 'text-brand-600 font-semibold' : 'text-gray-500 hover:text-gray-900'}`}>Workshops</button>
              
              {currentUser ? (
                <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                  <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-gray-700 hover:text-brand-600">
                     <img src={currentUser.avatar} alt="" className="w-8 h-8 rounded-full border border-gray-200" />
                     <span className="font-medium">{currentUser.name}</span>
                  </button>
                  <Button variant="ghost" className="p-2" onClick={handleLogout} title="Logout">
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-400 mr-2">Demo Login:</div>
                  {MOCK_USERS.map(u => (
                    <button 
                      key={u.id}
                      onClick={() => handleLogin(u)}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors"
                    >
                      {u.role.charAt(0) + u.role.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-500 hover:text-gray-900 p-2">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100">
             <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
               <button onClick={() => { setView('home'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Home</button>
               <button onClick={() => { setView('courses'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">Workshops</button>
               {currentUser ? (
                 <>
                   <button onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-base font-medium text-brand-600 bg-brand-50 rounded-md">Dashboard</button>
                   <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md">Logout</button>
                 </>
               ) : (
                 <div className="p-3 bg-gray-50 rounded-md mt-2">
                   <p className="text-xs text-gray-500 mb-2">Login as:</p>
                   <div className="flex flex-wrap gap-2">
                     {MOCK_USERS.map(u => (
                        <button key={u.id} onClick={() => handleLogin(u)} className="text-xs bg-white border px-2 py-1 rounded shadow-sm">
                          {u.name}
                        </button>
                     ))}
                   </div>
                 </div>
               )}
             </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-0 md:px-4 py-6">
        {view === 'home' && renderHome()}
        {view === 'courses' && renderCourses()}
        {view === 'dashboard' && currentUser && (
          <Dashboard 
            user={currentUser} 
            courses={courses}
            allUsers={MOCK_USERS}
            onAddCourse={handleAddCourse}
            onDeleteCourse={handleDeleteCourse}
          />
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-4 text-brand-600">
            <Palette className="w-6 h-6" />
            <span className="font-bold text-xl">CraftConnect</span>
          </div>
          <p className="text-gray-500 text-sm">© 2024 CraftConnect. Handmade with love.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;