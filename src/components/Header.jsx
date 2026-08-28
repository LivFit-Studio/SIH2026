import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, Users } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  const { currentUser, userRole, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & TGPCET Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab && setActiveTab(userRole === 'admin' ? 'admin' : 'dashboard')}>
            <img 
              src="/logo.png" 
              alt="Student Council TGPCET Logo" 
              className="w-9 h-9 object-contain rounded-lg bg-slate-900/80 p-1 border border-slate-800"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white font-outfit">
                  Student Council TGPCET
                </span>
                <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
                  SIH 2026
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links for Admin / Users */}
          {currentUser && (
            <div className="flex items-center space-x-3">
              {userRole === 'admin' && (
                <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition ${
                      activeTab === 'dashboard' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Team View
                  </button>
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition ${
                      activeTab === 'admin' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-teal-400 hover:text-teal-300'
                    }`}
                  >
                    Admin Console
                  </button>
                </div>
              )}

              {/* User Profile & Logout */}
              <div className="flex items-center space-x-3 bg-slate-900/90 border border-slate-800 py-1 px-3 rounded-xl">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-200">{currentUser.displayName}</div>
                  <div className="text-[10px] text-slate-400">{currentUser.email}</div>
                </div>

                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
