import React, { useState, useCallback } from 'react';
import { User, Course, UserRole } from '../types';
import { Button } from './Button';
import { generateCourseDetails } from '../services/geminiService';
import { Plus, Trash2, Edit2, Users, BookOpen, Sparkles, X, Filter } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'my-courses' | 'all-courses' | 'users'>('my-courses');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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

  const displayedCourses = filteredByRole.filter(c => 
    selectedCategory === 'All' || c.category === selectedCategory
  );

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
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-gray-700 hidden md:block">
                  {activeTab === 'my-courses' ? (user.role === UserRole.STUDENT ? 'Enrolled Workshops' : 'Your Workshops') : 'All Workshops'}
                </h3>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 outline-none focus:border-brand-500 bg-white flex-1"
                    >
                      <option value="All">All Categories</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {displayedCourses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No courses found in this view.</p>
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
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.enrolledStudentIds.length} / {course.capacity}</span>
                          <span>${course.price}</span>
                          <span>{course.date}</span>
                        </div>
                      </div>
                    </div>
                    {isInstructorOrAdmin && (
                      <div className="mt-4 md:mt-0 flex items-center gap-2">
                         <Button variant="danger" className="text-sm py-1 px-3" onClick={() => onDeleteCourse(course.id)}>
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