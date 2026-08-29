import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TEAMS_DATA } from '../data/teamsDataset';
import { ShieldCheck, AlertCircle, Info, HelpCircle, X, Search, CheckCircle2, ArrowRight, Mail, User } from 'lucide-react';

export default function LoginView() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot Email Lookup State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [teamSearchTerm, setTeamSearchTerm] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
    } catch (err) {
      console.error('Login error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Failed to authenticate with Google Sign-In.');
      }
      setLoading(false);
    }
  };

  const handleLookupSubmit = (e) => {
    e.preventDefault();
    if (!selectedTeamId) return;
    const found = TEAMS_DATA.find(t => t.id === selectedTeamId);
    setLookupResult(found || null);
  };

  const filteredTeamsForLookup = TEAMS_DATA.filter(t => 
    t.teamName.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
    t.leaderName.toLowerCase().includes(teamSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-[82vh] flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-4">
        
        <div className="glass-panel rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6 text-center">
          
          {/* TGPCET Logo */}
          <div className="space-y-4">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-slate-900/90 p-3 border border-slate-700/80 shadow-xl flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Student Council TGPCET Logo" 
                className="w-full h-full object-contain drop-shadow"
              />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-white font-outfit tracking-tight">
                Student Council TGPCET
              </h1>
              <p className="text-sm font-semibold text-amber-400 mt-1">
                SIH 2026 Authorization & Consent Portal
              </p>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                AICTE / UGC Code: <strong>1-46260580103</strong>
              </p>
            </div>
          </div>

          {/* Prominent Team Leader Notice Banner */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl text-left space-y-1.5 shadow-inner">
            <div className="flex items-center space-x-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
              <Info className="w-4 h-4 shrink-0 text-amber-400" />
              <span>TEAM LEADER NOTICE</span>
            </div>
            <p className="text-xs text-amber-200/90 font-medium leading-relaxed">
              Only the designated <strong>Team Leader</strong> must log in using the specific Google Email address registered during SIH 2026 team nomination.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-300 font-medium flex items-center space-x-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-In Button */}
          <div className="pt-1 space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center space-x-3 cursor-pointer group border border-slate-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{loading ? 'Authenticating...' : 'Sign In with Google'}</span>
            </button>

            {/* Forgot Registered Email Trigger */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsForgotModalOpen(true);
                  setLookupResult(null);
                  setSelectedTeamId('');
                  setTeamSearchTerm('');
                }}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline inline-flex items-center space-x-1.5 transition"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Forgot Registered Email? Find Your Team Email</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Strict Role-Based Authorization & Isolation</span>
          </div>

        </div>

      </div>

      {/* Forgot Registered Email Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/30">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-outfit">Find Registered Team Leader Email</h3>
                  <p className="text-[11px] text-slate-400">Select your team name to view the exact registered Google email</p>
                </div>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              
              <form onSubmit={handleLookupSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Select Your Nominated Team Name (23 Teams)
                  </label>

                  {/* Filter Search Input */}
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Type team name to filter..."
                      value={teamSearchTerm}
                      onChange={(e) => setTeamSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Select Dropdown */}
                  <select
                    value={selectedTeamId}
                    onChange={(e) => {
                      setSelectedTeamId(e.target.value);
                      const found = TEAMS_DATA.find(t => t.id === e.target.value);
                      setLookupResult(found || null);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 font-semibold"
                  >
                    <option value="">-- Choose Your Team Name --</option>
                    {filteredTeamsForLookup.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.teamName} (Leader: {t.leaderName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!selectedTeamId}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center space-x-1.5"
                  >
                    <span>View Registered Email</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Result Display Box */}
              {lookupResult && (
                <div className="p-4 bg-slate-950 border border-amber-500/40 rounded-2xl space-y-3 animate-fade-in shadow-xl">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Registered Team Leader Details Found</span>
                  </div>

                  <div className="space-y-2 border-t border-slate-800 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Team Name:</span>
                      <span className="text-white font-bold">{lookupResult.teamName}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Team Leader Name:</span>
                      <span className="text-slate-200 font-semibold">{lookupResult.leaderName}</span>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Registered Google Email Address:</div>
                      <div className="text-sm font-mono font-extrabold text-amber-300 select-all">
                        {lookupResult.leaderEmail}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        setIsForgotModalOpen(false);
                        handleGoogleLogin();
                      }}
                      className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Sign In with this Google Account</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
