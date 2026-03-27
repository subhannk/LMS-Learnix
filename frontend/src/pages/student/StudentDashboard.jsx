import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Award, 
  ArrowRight,
  Search,
  LayoutGrid,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get('/student/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  const { enrollments = [], activities = [], stats = {} } = data || {};

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
            My <span className="text-indigo-600 dark:text-indigo-400">Learning</span>
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Welcome back, {user?.name}. You've completed {stats.completedCourses} courses so far!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/courses" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
          >
            Browse Catalog
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Enrolled Courses', value: stats.enrolledCourses, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Completed', value: stats.completedCourses, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
          { label: 'Average Progress', value: `${stats.overallProgress}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 overflow-hidden shadow-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Gallery */}
        <div className="lg:col-cols-2 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LayoutGrid size={20} className="text-indigo-500" />
              Active Courses
            </h2>
          </div>

          {enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrollments.map((enr) => (
                <motion.div 
                  key={enr._id}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm group"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={enr.course.thumbnail || 'https://placehold.co/600x400/indigo/white?text=Course'} 
                      alt={enr.course.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        {enr.course.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{enr.course.title}</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Progress</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{enr.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${enr.progress}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        />
                      </div>
                    </div>

                    <Link 
                      to={`/student/lesson/${enr.course._id}/status`}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-slate-200 dark:border-slate-700 text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                    >
                      {enr.progress === 100 ? 'Review Course' : 'Continue Learning'}
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="text-slate-400" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No active courses</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">
                Discover your next skill from our hand-picked high-quality courses.
              </p>
              <Link to="/courses" className="mt-6 inline-block text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                Explore Content →
              </Link>
            </div>
          )}
        </div>

        {/* Activity Feed Sidebar */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock size={20} className="text-indigo-500" />
            Recent Activity
          </h2>
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            {activities.length > 0 ? (
              <div className="flow-root">
                <ul className="-mb-8">
                  {activities.map((activity, idx) => (
                    <li key={activity._id}>
                      <div className="relative pb-8">
                        {idx !== activities.length - 1 && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-800" aria-hidden="true" />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-slate-900 ${
                              activity.action === 'ENROLLED' ? 'bg-blue-500' : 
                              activity.action === 'EARNED_CERTIFICATE' ? 'bg-amber-500' : 'bg-green-500'
                            }`}>
                              {activity.action === 'ENROLLED' ? <BookOpen size={14} className="text-white" /> : 
                               activity.action === 'EARNED_CERTIFICATE' ? <Award size={14} className="text-white" /> : 
                               <CheckCircle size={14} className="text-white" />}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 py-0.5">
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              <span className="font-bold text-slate-900 dark:text-white">{activity.details}</span>
                            </div>
                            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                              {new Date(activity.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-center text-slate-500 py-4 text-sm italic">Nothing yet. Start learning!</p>
            )}
            
            <Link to="/student/activities" className="mt-6 w-full inline-flex justify-center items-center px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
              View full timeline
            </Link>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Build Your Future</h3>
              <p className="text-indigo-100 text-sm mb-4">Complete your current goal and earn a verifiable certificate.</p>
              <Link to="/student/achievements" className="inline-flex items-center px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg text-xs font-bold transition-all">
                My Achievements <ArrowRight className="ml-2 h-3 w-3" />
              </Link>
            </div>
            <Award className="absolute -bottom-4 -right-4 text-white/10" size={120} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentDashboard;
