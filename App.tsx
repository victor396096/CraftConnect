import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
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
  MapPin,
  Mail,
  Lock,
  ArrowRight,
  UserPlus
} from 'lucide-react';

// --- APP COMPONENT ---

const App: React.FC = () => {
  // Global State (Replaced with Live Query)
  const allUsers = useLiveQuery(() => db.users.toArray()) || [];
  const courses = useLiveQuery(() => db.courses.toArray()) || [];
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'home' | 'courses' | 'dashboard' | 'auth'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auth State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState<UserRole>(UserRole.STUDENT);

  // Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView('dashboard');
    // Reset auth form
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authMode === 'login') {
      const user = await db.users.where('email').equals(authEmail.toLowerCase()).first();
      
      if (user) {
        // In a real app, we would check the password here
        handleLogin(user);
      } else {
        alert("User not found. Please check your email or register.");
      }
    } else {
      // Register
      const existingUser = await db.users.where('email').equals(authEmail.toLowerCase()).first();
      
      if (existingUser) {
        alert("Email already exists. Please login.");
        return;
      }
      
      const newUser: User = {
        id: Date.now().toString(),
        name: authName,
        email: authEmail.toLowerCase(),
        role: authRole,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(authName)}&background=random`
      };
      
      await db.users.add(newUser);
      handleLogin(newUser);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('home');
  };

  const handleEnroll = async (courseId: string) => {
    if (!currentUser) {
      setView('auth');
      return;
    }
    if (currentUser.role !== UserRole.STUDENT) {
      alert("Only students can enroll in courses.");
      return;
    }

    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    if (course.enrolledStudentIds.includes(currentUser.id)) return;
    
    if (course.enrolledStudentIds.length >= course.capacity) {
      alert("Course is full!");
      return;
    }

    // Update DB
    await db.courses.update(courseId, {
      enrolledStudentIds: [...course.enrolledStudentIds, currentUser.id]
    });
    
    alert("Successfully enrolled!");
  };

  const handleAddCourse = async (newCourse: Course) => {
    await db.courses.add(newCourse);
  };

  const handleDeleteCourse = async (courseId: string) => {
    await db.courses.delete(courseId);
  };

  // Views
  const renderAuth = () => (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-500 mt-2">
              {authMode === 'login' ? 'Sign in to access your workshops' : 'Join our creative community today'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input 
                  type="email" 
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input 
                  type="password" 
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {authMode === 'register' && (
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">I want to...</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAuthRole(UserRole.STUDENT)}
                    className={`py-2 px-3 text-sm font-medium rounded-lg border ${authRole === UserRole.STUDENT ? 'bg-brand-50 border-brand-500 text-brand-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    Learn Crafts
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthRole(UserRole.INSTRUCTOR)}
                    className={`py-2 px-3 text-sm font-medium rounded-lg border ${authRole === UserRole.INSTRUCTOR ? 'bg-brand-50 border-brand-500 text-brand-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    Teach Workshops
                  </button>
                </div>
               </div>
            )}

            <Button type="submit" className="w-full justify-center py-3 text-lg mt-6">
              {authMode === 'login' ? 'Sign In' : 'Sign Up'} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setAuthEmail('');
                setAuthPassword('');
                setAuthName('');
              }}
              className="text-brand-600 font-semibold hover:underline"
            >
              {authMode === 'login' ? 'Register now' : 'Log in here'}
            </button>
          </div>

          {/* Demo Login Shortcuts */}
          {authMode === 'login' && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-center text-gray-400 mb-3 uppercase tracking-wider font-semibold">Demo Accounts</p>
              <div className="flex justify-center gap-2">
                 {allUsers.filter(u => ['1','2','3'].includes(u.id)).map(u => (
                    <button 
                      key={u.id}
                      onClick={() => handleLogin(u)}
                      className="text-xs px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full border border-gray-200 transition-colors"
                    >
                      {u.role}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

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
          <div className="flex gap-4">
             <Button onClick={() => setView('courses')} className="text-lg px-8 py-3">
              Browse Workshops
            </Button>
            {!currentUser && (
               <Button onClick={() => setView('auth')} variant="secondary" className="text-lg px-8 py-3 bg-white/10 text-white hover:bg-white/20 border border-white/30 backdrop-blur-sm">
                 Join Now
               </Button>
            )}
          </div>
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
                        disabled={isFull || (currentUser && currentUser.role !== UserRole.STUDENT)}
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
                <div className="flex items-center gap-4">
                  <Button onClick={() => setView('auth')} className="py-2">
                    Log In
                  </Button>
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
                 <button onClick={() => { setView('auth'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-base font-medium text-brand-600 bg-brand-50 rounded-md">Log In / Register</button>
               )}
             </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-0 md:px-4 py-6">
        {view === 'home' && renderHome()}
        {view === 'courses' && renderCourses()}
        {view === 'auth' && renderAuth()}
        {view === 'dashboard' && currentUser && (
          <Dashboard 
            user={currentUser} 
            courses={courses}
            allUsers={allUsers}
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