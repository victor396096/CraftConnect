import React, { useState } from 'react';
import { User, Course, UserRole } from '../types';
import { Button } from './Button';
import { generateCourseDetails } from '../services/geminiService';
import { Plus, Trash2, Users, BookOpen, Sparkles, X, Filter, ChevronLeft, ChevronRight, Calendar as CalendarIcon, RefreshCw } from 'lucide-react';

interface DashboardProps {
  user: User;
  courses: Course[];
  allUsers: User[]; // Only relevant for Admin
  onAddCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onEnroll?: (courseId: string) => void; // Not used in dashboard but prop consistency
}

const CATEGORIES = ['Ceramics', 'Painting', 'Leather', 'Woodworking', 'Textiles', 'General'];

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  courses, 
  allUsers, 
  onAddCourse, 
  onDeleteCourse 
}) => {
  const [activeTab, setActiveTab] = useState<'my-courses' | 'all-courses' | 'users' | 'schedule'>('my-courses');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string }>({ start: '', end: '' });
  
  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // New Course Form State
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseDate, setNewCourseDate] = useState('');
  const [newCoursePrice, setNewCoursePrice] = useState('50');
  const [newCourseCapacity, setNewCourseCapacity] = useState('10');
  const [newCourseCategory, setNewCourseCategory] = useState('General');

  // Filter courses based on role and category
  const filteredByRole = activeTab === 'all-courses' 
    ? courses 
    : user.role === UserRole.INSTRUCTOR 
      ? courses.filter(c => c.instructorId === user.id)
      : courses.filter(c => c.enrolledStudentIds.includes(user.id));

  // Get list of instructors for filter
  const instructors = allUsers.filter(u => u.role === UserRole.INSTRUCTOR);
  
  // Determine if instructor filter should be shown
  const showInstructorFilter = activeTab === 'all-courses' || user.role === UserRole.STUDENT;

  const displayedCourses = filteredByRole.filter(c => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesInstructor = selectedInstructor === 'All' || c.instructorId === selectedInstructor;
    const matchesDateStart = !dateFilter.start || c.date >= dateFilter.start;
    const matchesDateEnd = !dateFilter.end || c.date <= dateFilter.end;

    return matchesCategory && matchesInstructor && matchesDateStart && matchesDateEnd;
  });

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedInstructor('All');
    setDateFilter({ start: '', end: '' });
  };

  const hasActiveFilters = selectedCategory !== 'All' || selectedInstructor !== 'All' || dateFilter.start || dateFilter.end;

  const handleGenerateAi = async () => {
    if (!newCourseTitle) return;
    setIsGenerating(true);
    const details = await generateCourseDetails(newCourseTitle);
    if (details) {
      setNewCourseDesc(`${details.description}\n\nPrerequisites: ${details.prerequisites}`);
    }
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCourse: Course = {
      id: Date.now().toString(),
      title: newCourseTitle,
      description: newCourseDesc,
      date: newCourseDate,
      price: Number(newCoursePrice),
      capacity: Number(newCourseCapacity),
      instructorId: user.id,
      instructorName: user.name,
      enrolledStudentIds: [],
      imageUrl: `https://picsum.photos/400/300?random=${Date.now()}`,
      category: newCourseCategory
    };
    onAddCourse(newCourse);
    setIsModalOpen(false);
    // Reset
    setNewCourseTitle('');
    setNewCourseDesc('');
    setNewCourseDate('');
    setNewCourseCategory('General');
  };

  // Calendar Helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay, year, month };
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
    setCurrentMonth(newDate);
  };

  const renderCalendar = () => {
    const { days, firstDay, year, month } = getDaysInMonth(currentMonth);
    const monthName = currentMonth.toLocaleString('default', { month: 'long' });
    
    // Get courses for this month
    const monthCourses = filteredByRole.filter(c => {
      const courseDate = new Date(c.date);
      return courseDate.getMonth() === month && courseDate.getFullYear() === year;
    });

    const daysArray = Array.from({ length: days }, (_, i) => i + 1);
    const emptySlots = Array.from({ length: firstDay }, (_, i) => i);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-brand-600" />
            {monthName} {year}
          </h3>
          <div className="flex gap-2">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {emptySlots.map(i => <div key={`empty-${i}`} className="h-24 md:h-32 bg-gray-50/30 rounded-lg"></div>)}
            {daysArray.map(day => {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const daysCourses = monthCourses.filter(c => c.date === dateStr);
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

              return (
                <div key={day} className={`h-24 md:h-32 border rounded-lg p-2 transition-all hover:shadow-md overflow-y-auto ${isToday ? 'border-brand-300 bg-brand-50/20' : 'border-gray-100 bg-white'}`}>
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-brand-600' : 'text-gray-700'}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {daysCourses.map(course => (
                      <div key={course.id} className="text-xs bg-brand-100 text-brand-800 p-1.5 rounded border border-brand-200 truncate" title={course.title}>
                        {course.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const isInstructorOrAdmin = user.role === UserRole.ADMIN || user.role === UserRole.INSTRUCTOR;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-500">Welcome back, {user.name} ({user.role})</p>
        </div>
        
        {isInstructorOrAdmin && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Create Course
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('my-courses')}
          className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'my-courses' ? 'border-b-2 border-brand-600 text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          {user.role === UserRole.STUDENT ? 'My Enrollments' : 'My Courses'}
        </button>
        
        {user.role === UserRole.STUDENT && (
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'schedule' ? 'border-b-2 border-brand-600 text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            My Schedule
          </button>
        )}

        {user.role === UserRole.ADMIN && (
          <>
            <button
              onClick={() => setActiveTab('all-courses')}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'all-courses' ? 'border-b-2 border-brand-600 text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              All Courses
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'users' ? 'border-b-2 border-brand-600 text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              User Management
            </button>
          </>
        )}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {activeTab === 'users' ? (
          <div className="overflow-x-auto">
             <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-sm">
                  <th className="pb-3 pl-2">User</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Email</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {allUsers.map(u => (
                  <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="py-3 pl-2 font-medium text-gray-800 flex items-center gap-2">
                      <img src={u.avatar} alt="" className="w-8 h-8 rounded-full" />
                      {u.name}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 
                          u.role === UserRole.INSTRUCTOR ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'schedule' ? (
          renderCalendar()
        ) : (
          <div>
            {/* Extended Filters Toolbar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                <h3 className="font-semibold text-gray-700 whitespace-nowrap">
                  {activeTab === 'my-courses' ? (user.role === UserRole.STUDENT ? 'Enrolled Workshops' : 'Your Workshops') : 'All Workshops'}
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-wrap">
                    {/* Filters Group */}
                    <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                        {/* Category Filter */}
                        <div className="relative min-w-[140px]">
                           <Filter className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                           <select 
                              value={selectedCategory} 
                              onChange={(e) => setSelectedCategory(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-500 bg-white appearance-none cursor-pointer hover:border-gray-300 transition-colors"
                            >
                              <option value="All">All Categories</option>
                              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* Instructor Filter - Conditional */}
                        {showInstructorFilter && (
                           <div className="relative min-w-[140px]">
                             <Users className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                             <select 
                                value={selectedInstructor} 
                                onChange={(e) => setSelectedInstructor(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-500 bg-white appearance-none cursor-pointer hover:border-gray-300 transition-colors"
                              >
                                <option value="All">All Instructors</option>
                                {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                              </select>
                          </div>
                        )}
                    </div>
                    
                    {/* Date Range & Reset */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                       <input 
                         type="date" 
                         value={dateFilter.start}
                         onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                         className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-500 bg-white text-gray-600 w-full sm:w-auto"
                         placeholder="Start Date"
                       />
                       <span className="text-gray-400 hidden sm:inline">-</span>
                       <input 
                         type="date" 
                         value={dateFilter.end}
                         onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                         className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-500 bg-white text-gray-600 w-full sm:w-auto"
                       />
                       
                       {hasActiveFilters && (
                         <button 
                           onClick={resetFilters}
                           className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto sm:ml-0"
                           title="Clear Filters"
                         >
                           <X className="w-4 h-4" />
                         </button>
                       )}
                    </div>
                </div>
            </div>

            {displayedCourses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No courses found matching your criteria.</p>
                {hasActiveFilters && (
                   <button onClick={resetFilters} className="text-brand-600 hover:underline mt-2 text-sm">
                     Clear all filters
                   </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {displayedCourses.map(course => (
                  <div key={course.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:border-brand-200 transition-colors">
                    <div className="flex items-start gap-4">
                      <img src={course.imageUrl} alt="" className="w-16 h-16 rounded-md object-cover bg-gray-100" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase font-bold text-brand-600 tracking-wider bg-brand-50 px-2 py-0.5 rounded-full">{course.category}</span>
                        </div>
                        <h4 className="font-semibold text-gray-900">{course.title}</h4>
                        <p className="text-sm text-gray-500 line-clamp-1">{course.description}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.enrolledStudentIds.length} / {course.capacity}</span>
                          <span>${course.price}</span>
                          <span>{course.date}</span>
                          <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                             <span className="font-medium">Instr:</span> {course.instructorName}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isInstructorOrAdmin && (
                      <div className="mt-4 md:mt-0 flex items-center gap-2">
                         <Button 
                            variant="danger" 
                            className="text-sm py-1 px-3" 
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this course?")) {
                                onDeleteCourse(course.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                         </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold mb-4">Create New Workshop</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Workshop Title</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    required
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="e.g., Intro to Pottery"
                  />
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={handleGenerateAi}
                    disabled={!newCourseTitle || isGenerating}
                    isLoading={isGenerating}
                    title="Generate description with Gemini"
                  >
                    <Sparkles className="w-4 h-4" />
                    Auto-Fill
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                    value={newCourseCategory}
                    onChange={(e) => setNewCourseCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  required
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-32 focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                  placeholder="What will students learn?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    value={newCourseDate}
                    onChange={(e) => setNewCourseDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                   <input 
                    type="number" 
                    required
                    min="0"
                    value={newCoursePrice}
                    onChange={(e) => setNewCoursePrice(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                 <input 
                  type="number" 
                  required
                  min="1"
                  value={newCourseCapacity}
                  onChange={(e) => setNewCourseCapacity(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Create Workshop</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
