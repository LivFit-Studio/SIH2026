import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Shield, User, Search, CheckCircle, AlertTriangle, X, ChevronRight } from 'lucide-react';
import { ADMIN_EMAILS } from '../data/teamsDataset';

export default function EvaluatorDemoBar({ isOpen, onClose }) {
  const { allTeams, loginAsDemoUser, currentUser, userTeam } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredTeams = allTeams.filter(t => 
    t.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.leaderEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.leaderName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectTeam = (email) => {
    loginAsDemoUser(email, 'team_leader');
    onClose();
  };

  const handleSelectAdmin = () => {
    loginAsDemoUser('bhushanmallick_it@tgpcet.com', 'admin');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-4 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-outfit">Evaluator & Quick Access Demo Switcher</h3>
              <p className="text-xs text-slate-400">Instantly switch between any of the 23 Team Leaders or Admin role to test team isolation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Roles Section - Admin */}
        <div className="p-6 bg-slate-950/50 border-b border-slate-800 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Administrator Role</div>
          <button
            onClick={handleSelectAdmin}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-teal-950/50 to-slate-900 border border-teal-500/30 hover:border-teal-400 transition group shadow-md"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold border border-teal-500/40">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-white group-hover:text-teal-300 transition">
                  Bhushan Mallick (Admin)
                </div>
                <div className="text-xs text-teal-300 font-mono font-bold">bhushanmallick_it@tgpcet.com</div>
              </div>
            </div>
            <span className="text-xs font-extrabold text-teal-400 bg-teal-500/10 px-3 py-1.5 rounded-lg border border-teal-500/20 group-hover:bg-teal-500 group-hover:text-slate-950 transition flex items-center space-x-1">
              <span>Access Admin Dashboard Direct &rarr;</span>
            </span>
          </button>
        </div>

        {/* Search Bar & Team Selection List */}
        <div className="p-4 bg-slate-900 border-b border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search team name, leader name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>
        </div>

        {/* Teams List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 pb-1">
            Registered Teams ({filteredTeams.length})
          </div>

          {filteredTeams.map((team, idx) => {
            const isCurrent = userTeam && userTeam.id === team.id;
            return (
              <div
                key={team.id}
                onClick={() => handleSelectTeam(team.leaderEmail)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  isCurrent 
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md' 
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center border border-slate-700">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white">{team.teamName}</span>
                      {team.status === 'VERIFIED' && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-semibold border border-emerald-500/30 flex items-center space-x-1">
                          <CheckCircle className="w-2.5 h-2.5" />
                          <span>Verified</span>
                        </span>
                      )}
                      {team.status === 'ISSUES_REPORTED' && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-semibold border border-amber-500/30 flex items-center space-x-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>Issue Reported</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Leader: <span className="text-slate-200">{team.leaderName}</span> • <span className="text-amber-300/80 font-mono">{team.leaderEmail}</span>
                    </div>
                  </div>
                </div>

                <button className="text-xs font-semibold text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-500 px-3 py-1.5 rounded-lg border border-amber-500/20 transition">
                  {isCurrent ? 'Active' : 'Log In As Leader'}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
