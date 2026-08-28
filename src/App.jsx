import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginView from './views/LoginView';
import ParticipantDashboard from './views/ParticipantDashboard';
import AdminDashboard from './views/AdminDashboard';
import { Lock } from 'lucide-react';

function AppContent() {
  const { currentUser, userRole, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (userRole === 'admin') {
      setActiveTab('admin');
    } else if (userRole === 'team_leader') {
      setActiveTab('dashboard');
    }
  }, [userRole]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-xs font-semibold text-slate-300 font-outfit">Student Council TGPCET - Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1">
        {!currentUser ? (
          <LoginView />
        ) : userRole === 'unauthorized' ? (
          <div className="max-w-md mx-auto py-20 px-4 text-center space-y-6">
            <div className="w-14 h-14 bg-red-500/10 text-red-400 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white font-outfit">Access Restricted</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              The Google account <strong className="text-amber-400">{currentUser.email}</strong> is not listed as a registered Team Leader or Admin in the SIH 2026 dataset.
            </p>
            <button
              onClick={logout}
              className="px-5 py-2.5 bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 hover:bg-slate-700 transition"
            >
              Sign Out & Try Another Email
            </button>
          </div>
        ) : activeTab === 'admin' && userRole === 'admin' ? (
          <AdminDashboard />
        ) : (
          <ParticipantDashboard />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
