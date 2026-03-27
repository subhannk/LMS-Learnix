import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  CreditCard, 
  Bell, 
  Shield, 
  Camera, 
  Check,
  ChevronRight,
  ExternalLink,
  Plus,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AccountSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Account <span className="text-indigo-600 dark:text-indigo-400">Settings</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl font-medium">
          Manage your personal information, subscription billing, and security preferences.
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Navigation Sidebar */}
        <div className="lg:w-72 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all text-sm group ${
                activeTab === tab.id 
                  ? 'bg-white dark:bg-slate-900 shadow-xl shadow-indigo-500/10 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 scale-105' 
                  : 'text-slate-500 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/50'
              }`}
            >
              <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              {tab.label}
              {activeTab === tab.id && <div className="ml-auto w-1.5 h-1.5 bg-indigo-500 rounded-full" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 p-8 md:p-12 shadow-sm relative overflow-hidden"
          >
            {activeTab === 'profile' && (
              <div className="space-y-10">
                <div className="flex items-center gap-8">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-[32px] overflow-hidden bg-indigo-50 dark:bg-indigo-900/10 border-4 border-white dark:border-slate-800 shadow-xl">
                      <img 
                        src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-110 transition-all">
                      <Camera size={18} />
                    </button>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Profile Details</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Updated 2 days ago</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        defaultValue={user?.name} 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        defaultValue={user?.email} 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                  </div>
                </div>

                <button className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 dark:shadow-none hover:translate-y-[-2px] transition-all">
                  Save Changes
                </button>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Payment Methods</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold italic">Secured by CyberPay Enterprise</p>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl text-xs font-black hover:bg-indigo-600 hover:text-white transition-all">
                    <Plus size={16} strokeWidth={3} />
                    ADD CARD
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-6 p-6 bg-slate-100 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                    <div className="w-16 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs italic tracking-tighter shadow-lg group-hover:scale-110 transition-transform">
                      VISA
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-slate-900 dark:text-white tracking-widest">•••• •••• •••• 4242</p>
                        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-lg uppercase tracking-tighter">Primary</span>
                      </div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Expires 12/26</p>
                    </div>
                    <button className="p-3 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
                   <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter uppercase">Invoices</h3>
                   <div className="space-y-4">
                      {[1, 2].map(i => (
                        <div key={i} className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-3xl group transition-all">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                               <Check size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">CyberSquare Pro Subscription</p>
                              <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Feb {i}, 2026</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="font-black text-slate-900 dark:text-white">$19.99</span>
                            <button className="text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                              <ExternalLink size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
