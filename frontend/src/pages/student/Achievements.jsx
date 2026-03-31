import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, Download, ExternalLink, ShieldCheck, Star } from 'lucide-react';
import API from '../../api/axios';

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await API.get('/student/achievements');
        setAchievements(res.data);
      } catch (err) {
        console.error('Error fetching achievements:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My <span className="text-indigo-600 dark:text-indigo-400">Achievements</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl font-medium">
            A comprehensive list of your earned certifications and milestone accomplishments during your journey.
          </p>
        </div>
        <div className="flex gap-4 bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="px-4 py-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total</p>
             <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{achievements.length}</p>
          </div>
        </div>
      </div>

      {achievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {achievements.map((item, idx) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="group relative bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative space-y-6">
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
                    <Award size={32} />
                  </div>
                  <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle size={10} strokeWidth={3} />
                    Verified
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                    {item.course.title}
                  </h3>
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">
                    {item.course.category} Certification
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-tighter">
                    <span>Issue Date</span>
                    <span className="text-slate-900 dark:text-slate-200">
                      {new Date(item.updatedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black transition-all shadow-lg shadow-indigo-200 dark:shadow-none">
                      <Download size={14} strokeWidth={3} />
                      PDF
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-black transition-all">
                      <ExternalLink size={14} strokeWidth={3} />
                      Verify
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800 p-20 text-center">
          <div className="mx-auto w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[32px] flex items-center justify-center text-4xl mb-8 grayscale opacity-50">
            🏆
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Your trophy room is empty</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-sm mx-auto text-lg font-medium leading-relaxed">
            Every master was once a beginner. Complete your first course and earn a certified achievement.
          </p>
          <div className="mt-10">
            <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 dark:shadow-none hover:scale-105 transition-all">
              Launch Your First Course
            </button>
          </div>
        </div>
      )}

      {/* Security Tag */}
      <div className="flex justify-center pt-20">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 font-bold text-xs uppercase tracking-widest shadow-inner">
          <ShieldCheck size={16} className="text-indigo-500" />
          Secured by CyberSquare Enterprise Certification
        </div>
      </div>
    </div>
  );
};

export default Achievements; 
