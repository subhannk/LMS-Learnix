import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  FileText, 
  CheckCircle, 
  ArrowLeft,
  Maximize2,
  Volume2,
  Settings,
  MessageSquare,
  HelpCircle,
  LayoutGrid, 
  List, 
  Star, 
  Clock, 
  BookOpen,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../api/axios';

const LessonPlayer = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [completedLessons, setCompletedLessons] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, enrollRes] = await Promise.all([
          API.get(`/courses/${courseId}`),
          API.get(`/enrollments/my`) // Simplified, ideally we have a specific enrollment for this course
        ]);
        
        setCourse(courseRes.data);
        const myEnrollment = enrollRes.data.find(e => e.course._id === courseId);
        if (myEnrollment) {
          setCompletedLessons(myEnrollment.completedLessons || []);
        }
      } catch (err) {
        console.error('Error fetching lesson data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  if (loading || !course) return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  // Find current lesson or default to first
  let currentLesson = null;
  course.sections.forEach(s => {
    const found = s.lessons.find(l => l._id === lessonId);
    if (found) currentLesson = found;
  });

  if (!currentLesson && course.sections.length > 0 && course.sections[0].lessons.length > 0) {
    currentLesson = course.sections[0].lessons[0];
  }

  const handleMarkComplete = async () => {
    try {
      await API.put(`/enrollments/${courseId}/progress`, { lessonId: currentLesson._id });
      setCompletedLessons([...completedLessons, currentLesson._id]);
      // Logic for next lesson navigation could go here
    } catch (err) {
      console.error('Error marking complete:', err);
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <Link to="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-black uppercase tracking-widest mb-4 transition-colors">
                <ArrowLeft size={16} strokeWidth={3} />
                Back to Campus
              </Link>
              <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight line-clamp-2 uppercase tracking-tighter">
                {course.title}
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar p-2">
              {course.sections.map((section, sIdx) => (
                <div key={section._id} className="mb-4">
                  <div className="px-4 py-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[8px] text-slate-500">
                      {sIdx + 1}
                    </span>
                    {section.title}
                  </div>
                  <div className="space-y-1">
                    {section.lessons.map((lesson) => (
                      <button
                        key={lesson._id}
                        onClick={() => navigate(`/student/lesson/${courseId}/${lesson._id}`)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                          lessonId === lesson._id 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm'
                        }`}
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                          lessonId === lesson._id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20'
                        }`}>
                          {completedLessons.includes(lesson._id) ? (
                            <CheckCircle size={14} strokeWidth={3} />
                          ) : lesson.type === 'video' ? (
                            <Play size={14} className={lessonId === lesson._id ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'} />
                          ) : (
                            <FileText size={14} className={lessonId === lesson._id ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'} />
                          )}
                        </div>
                        <div className="text-left">
                           <p className={`text-sm font-bold truncate max-w-[180px] ${lessonId === lesson._id ? 'text-white' : 'text-slate-900 dark:text-slate-200'}`}>
                            {lesson.title}
                          </p>
                          <p className={`text-[10px] font-bold uppercase tracking-widest ${lessonId === lesson._id ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {lesson.duration || '5 min'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Player */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 relative">
        {/* Top Control Bar */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500"
           >
             <Maximize2 size={20} />
           </button>
           
           <div className="flex items-center gap-6">
             <div className="flex items-center gap-1 text-slate-400 hover:text-indigo-500 cursor-pointer transition-colors group">
               <MessageSquare size={18} />
               <span className="text-xs font-bold uppercase tracking-widest">Discuss</span>
             </div>
             <div className="flex items-center gap-1 text-slate-400 hover:text-indigo-500 cursor-pointer transition-colors group">
               <HelpCircle size={18} />
               <span className="text-xs font-bold uppercase tracking-widest">Support</span>
             </div>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
          <div className="max-w-5xl mx-auto p-8 md:p-12 space-y-12">
            
            {/* Viewport */}
            <div className="aspect-video bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl relative group">
              {currentLesson?.type === 'video' ? (
                <iframe 
                  src={currentLesson.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ'} 
                  className="w-full h-full border-none"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center text-white space-y-6">
                   <FileText size={80} className="text-indigo-400 opacity-20" />
                   <h2 className="text-3xl font-black uppercase tracking-tighter">Read: {currentLesson?.title}</h2>
                   <p className="text-slate-400 max-w-md">This is a text-based lesson. Please read the accompanying documentation below.</p>
                </div>
              )}
            </div>

            {/* Content Details */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-12">
               <div className="flex-1 space-y-6">
                  <div className="space-y-2">
                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                       Lesson {currentLesson?.type}
                    </span>
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                      {currentLesson?.title}
                    </h1>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                    In this session, we dive deep into the core concepts of {currentLesson?.title} and how it fits into the broader architecture of {course.title}. Take notes and follow along with the exercises provided.
                  </p>
               </div>

               <div className="w-full md:w-80 space-y-6">
                 <button 
                  onClick={handleMarkComplete}
                  disabled={completedLessons.includes(currentLesson._id)}
                  className={`w-full py-6 rounded-[24px] flex flex-col items-center justify-center gap-2 transition-all shadow-xl ${
                    completedLessons.includes(currentLesson._id)
                    ? 'bg-green-500 text-white cursor-default'
                    : 'bg-indigo-600 dark:bg-indigo-500 text-white hover:scale-105 active:scale-95'
                  }`}
                 >
                   {completedLessons.includes(currentLesson._id) ? (
                     <>
                        <CheckCircle size={32} strokeWidth={2.5} />
                        <span className="text-xs font-black uppercase tracking-widest">Module Completed</span>
                     </>
                   ) : (
                     <>
                        <span className="text-xs font-black uppercase tracking-widest mb-1 opacity-60">Ready to Advance?</span>
                        <span className="text-xl font-black uppercase tracking-tighter">Mark as Complete</span>
                     </>
                   )}
                 </button>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-indigo-600 transition-all flex flex-col items-center">
                       <ChevronLeft size={24} />
                       <span className="text-[10px] font-black uppercase mt-1">Prev</span>
                    </button>
                    <button className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-indigo-600 transition-all flex flex-col items-center">
                       <ChevronRight size={24} />
                       <span className="text-[10px] font-black uppercase mt-1">Next</span>
                    </button>
                 </div>
               </div>
            </div>

            {/* Distraction-free Footnote */}
            <div className="pt-20 text-center">
              <p className="text-[10px] font-black text-slate-300 dark:text-slate-800 uppercase tracking-[0.3em]">
                CyberSquare Immersive Mode Active
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;
