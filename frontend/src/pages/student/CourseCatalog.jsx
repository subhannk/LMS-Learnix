import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Star, 
  Clock, 
  BookOpen,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [sort, setSort] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  const categories = ['All', 'Web Dev', 'Frontend', 'Backend', 'Python', 'Database', 'CSS', 'TypeScript', 'DevOps', 'Security', 'Mobile', 'Cloud', 'AI/ML'];
  const levels = ['All', 'beginner', 'intermediate', 'advanced'];

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await API.get('/courses', {
        params: { search, category, level, sort }
      });
      setCourses(res.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCourses();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, category, level, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight"
        >
          Discover Your <span className="text-indigo-600 dark:text-indigo-400">Next Skill</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-slate-600 dark:text-slate-400"
        >
          Explore over 200+ expert-led courses designed to help you master the latest technologies.
        </motion.p>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search courses, instructors, or topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Level Filter */}
            <div className="relative">
              <select 
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white capitalize"
              >
                {levels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>

            {/* Sort */}
            <div className="relative">
              <select 
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <TrendingUp className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>

            {/* View Switch */}
            <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Capsules */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                category === cat 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Listing */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-20"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </motion.div>
        ) : (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "space-y-6"}
          >
            {courses.length > 0 ? (
              courses.map((course) => (
                <motion.div
                  key={course._id}
                  whileHover={{ y: -8 }}
                  className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group ${viewMode === 'list' ? 'flex flex-col md:flex-row' : ''}`}
                >
                  <div className={`${viewMode === 'list' ? 'md:w-72' : 'aspect-video'} relative overflow-hidden`}>
                    <img 
                      src={course.thumbnail || 'https://placehold.co/600x400/indigo/white?text=Course'} 
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                        {course.level}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                    <div className="space-y-2">
                       <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-tighter">
                        {course.category}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        By <span className="font-semibold text-slate-700 dark:text-slate-200">{course.instructor?.name}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                        <span className="font-bold text-slate-900 dark:text-slate-200">{course.averageRating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{course.sections?.length || 0} Sections</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                      </span>
                      <Link 
                        to={`/courses/${course._id}`}
                        className="p-3 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                      >
                        <ArrowRight size={20} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="mx-auto w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-4xl mb-6">
                  😕
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No courses match your search</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  Try adjusting your filters or search keywords to find what you're looking for.
                </p>
                <button 
                  onClick={() => { setSearch(''); setCategory('All'); setLevel('All'); }}
                  className="mt-4 text-indigo-600 dark:text-indigo-400 font-bold underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseCatalog;
