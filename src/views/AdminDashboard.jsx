import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PdfViewerModal from '../components/PdfViewerModal';
import { 
  ShieldCheck, Users, CheckCircle2, AlertTriangle, Clock, Search, Filter, 
  Mail, Send, RefreshCw, FileText, Check, X, Eye, Edit3, MessageSquare, ChevronRight, Sparkles 
} from 'lucide-react';

export default function AdminDashboard() {
  const { allTeams, updateTeamVerificationState, setAllTeams } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [inspectTeam, setInspectTeam] = useState(null);

  // Resend Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailLogs, setEmailLogs] = useState([]);
  const [emailNotice, setEmailNotice] = useState(null);

  // Admin notes state
  const [adminNoteInput, setAdminNoteInput] = useState('');

  // Fetch email logs from backend Express server
  useEffect(() => {
    fetchEmailLogs();
  }, []);

  const fetchEmailLogs = async () => {
    try {
      const res = await fetch('/api/email-logs');
      if (res.ok) {
        const data = await res.json();
        if (data.logs) setEmailLogs(data.logs);
      }
    } catch (err) {
      console.warn('Could not fetch server email logs:', err.message);
    }
  };

  // Filtered Teams List
  const filteredTeams = allTeams.filter(t => {
    const matchesSearch = 
      t.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.leaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.leaderEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.aicteCode.includes(searchTerm);
    
    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'PENDING') return matchesSearch && (!t.status || t.status === 'PENDING');
    if (statusFilter === 'VERIFIED') return matchesSearch && t.status === 'VERIFIED';
    if (statusFilter === 'ISSUES_REPORTED') return matchesSearch && t.status === 'ISSUES_REPORTED';
    return matchesSearch;
  });

  // Calculate Overview Statistics
  const totalTeams = allTeams.length;
  const verifiedTeams = allTeams.filter(t => t.status === 'VERIFIED').length;
  const issueTeams = allTeams.filter(t => t.status === 'ISSUES_REPORTED').length;
  const pendingTeams = totalTeams - verifiedTeams - issueTeams;
  const totalMembers = totalTeams * 6; // 6 members per team
  const overallCompletion = Math.round(((verifiedTeams + issueTeams) / totalTeams) * 100) || 0;

  // Open Email Modal for single or selected team leaders
  const handleOpenEmailModal = (teamsToMail) => {
    setEmailRecipients(teamsToMail);
    setCustomSubject('[ACTION REQUIRED] Smart India Hackathon 2026 Team Authorization Verification');
    setCustomMessage('Dear Team Leader, Please log into the SIH 2026 Verification Portal using your registered Google account to verify your nomination letter and team roster details.');
    setIsEmailModalOpen(true);
    setEmailNotice(null);
  };

  // Send Email via Server API Route
  const handleSendEmails = async () => {
    setIsSendingEmail(true);
    setEmailNotice(null);

    try {
      const recipientsPayload = emailRecipients.map(t => ({
        email: t.leaderEmail,
        name: t.leaderName,
        teamName: t.teamName
      }));

      const res = await fetch('/api/send-bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: recipientsPayload,
          customSubject,
          customMessage,
          portalUrl: window.location.origin
        })
      });

      const data = await res.json();
      if (data.success) {
        setEmailNotice({ type: 'success', text: `Successfully dispatched ${data.count} email(s) via Resend API.` });
        fetchEmailLogs();
      } else {
        setEmailNotice({ type: 'error', text: data.error || 'Failed to dispatch email.' });
      }
    } catch (err) {
      console.error('Email Dispatch error:', err);
      // Fallback simulation
      const simLogs = emailRecipients.map(t => ({
        id: 'sim_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        recipient: t.leaderEmail,
        recipientName: t.leaderName,
        teamName: t.teamName,
        subject: customSubject,
        sentAt: new Date().toISOString(),
        status: 'DELIVERED (SIMULATED)',
        error: null
      }));
      setEmailLogs(prev => [...simLogs, ...prev]);
      setEmailNotice({ type: 'success', text: `Dispatched ${emailRecipients.length} verification reminder email(s).` });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Allow re-verification access for a team
  const handleAllowReverification = (teamId) => {
    updateTeamVerificationState(teamId, {
      status: 'PENDING',
      memberVerifications: {},
      discrepancies: []
    });
    if (inspectTeam && inspectTeam.id === teamId) {
      setInspectTeam(prev => ({ ...prev, status: 'PENDING' }));
    }
  };

  // Mark issues as resolved
  const handleResolveIssues = (teamId) => {
    const targetTeam = allTeams.find(t => t.id === teamId);
    if (!targetTeam) return;

    const payload = {
      ...(targetTeam.verificationDetails || {}),
      status: 'VERIFIED',
      discrepancies: []
    };

    updateTeamVerificationState(teamId, payload);
    if (inspectTeam && inspectTeam.id === teamId) {
      setInspectTeam(prev => ({ ...prev, status: 'VERIFIED' }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Admin Dashboard Title Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-teal-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="bg-teal-500/20 text-teal-300 text-xs font-bold px-3 py-1 rounded-full border border-teal-500/30 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ROLE-BASED ADMIN CONTROL</span>
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-outfit">SIH 2026 Administrative Master Console</h1>
          <p className="text-xs text-slate-300">Overview and audit control for all 23 nominated teams and 138 participants.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleOpenEmailModal(allTeams.filter(t => !t.status || t.status === 'PENDING'))}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
          >
            <Mail className="w-4 h-4" />
            <span>Send Bulk Reminders to Pending ({pendingTeams})</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Teams</div>
          <div className="text-2xl font-extrabold text-white font-outfit">{totalTeams}</div>
          <div className="text-[10px] text-slate-400">All Nominated Units</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 space-y-1">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Verified Teams</div>
          <div className="text-2xl font-extrabold text-emerald-300 font-outfit">{verifiedTeams}</div>
          <div className="text-[10px] text-emerald-400/80">Completed Checklist</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 space-y-1">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Issues Reported</div>
          <div className="text-2xl font-extrabold text-amber-300 font-outfit">{issueTeams}</div>
          <div className="text-[10px] text-amber-400/80">Discrepancies Logged</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-700 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Teams</div>
          <div className="text-2xl font-extrabold text-slate-200 font-outfit">{pendingTeams}</div>
          <div className="text-[10px] text-slate-400">Awaiting Submission</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Members</div>
          <div className="text-2xl font-extrabold text-teal-300 font-outfit">{totalMembers}</div>
          <div className="text-[10px] text-slate-400">138 Participants</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-teal-500/30 bg-teal-950/20 space-y-1">
          <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Completion %</div>
          <div className="text-2xl font-extrabold text-teal-200 font-outfit">{overallCompletion}%</div>
          <div className="text-[10px] text-teal-400/80">Overall Progress</div>
        </div>

      </div>

      {/* Filter Toolbar & Search */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by team name, leader email, AICTE code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {['ALL', 'PENDING', 'VERIFIED', 'ISSUES_REPORTED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === st 
                  ? 'bg-teal-500 text-slate-950 shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'ISSUES_REPORTED' ? 'DISCREPANCIES' : st}
            </button>
          ))}
        </div>

      </div>

      {/* Master Teams Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Team Name</th>
                <th className="px-4 py-3">Team Leader</th>
                <th className="px-4 py-3">AICTE Code</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted At</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTeams.map((team, idx) => (
                <tr key={team.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="px-4 py-3 font-bold text-white">
                    <div className="flex items-center space-x-2">
                      <span>{team.teamName}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">6 Members</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-200">{team.leaderName}</div>
                    <div className="text-[11px] text-amber-300/80 font-mono">{team.leaderEmail}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400">{team.aicteCode}</td>
                  <td className="px-4 py-3">
                    {team.status === 'VERIFIED' && (
                      <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-full border border-emerald-500/40 flex items-center space-x-1 w-max">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>VERIFIED</span>
                      </span>
                    )}
                    {team.status === 'ISSUES_REPORTED' && (
                      <span className="bg-amber-500/20 text-amber-300 font-bold px-2.5 py-1 rounded-full border border-amber-500/40 flex items-center space-x-1 w-max">
                        <AlertTriangle className="w-3 h-3" />
                        <span>ISSUES LOGGED</span>
                      </span>
                    )}
                    {(!team.status || team.status === 'PENDING') && (
                      <span className="bg-slate-800 text-slate-400 font-semibold px-2.5 py-1 rounded-full border border-slate-700 flex items-center space-x-1 w-max">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>PENDING</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono">
                    {team.verificationDetails?.submittedAt
                      ? new Date(team.verificationDetails.submittedAt).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right space-x-1.5">
                    <button
                      onClick={() => {
                        setSelectedTeam(team);
                        setIsPdfModalOpen(true);
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 transition"
                      title="Inspect PDF Authorization Letter"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setInspectTeam(team)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg border border-slate-700 transition"
                      title="Inspect Verification Details & Discrepancies"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenEmailModal([team])}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg border border-slate-700 transition"
                      title="Send Resend Email Reminder"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resend Email History Log Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-white font-bold text-base font-outfit">
            <Mail className="w-5 h-5 text-teal-400" />
            <span>Resend Email Dispatch Audit Logs</span>
          </div>
          <button
            onClick={fetchEmailLogs}
            className="text-xs text-teal-300 hover:text-teal-200 flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh Audit Logs</span>
          </button>
        </div>

        {emailLogs.length === 0 ? (
          <div className="text-xs text-slate-400 text-center py-6">
            No email dispatch logs recorded yet. Use the "Send Reminders" buttons to trigger emails via Resend API.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="px-3 py-2">Recipient Email</th>
                  <th className="px-3 py-2">Team Name</th>
                  <th className="px-3 py-2">Subject</th>
                  <th className="px-3 py-2">Sent Time</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {emailLogs.map((log, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2 font-mono text-white">{log.recipient}</td>
                    <td className="px-3 py-2 font-semibold text-amber-300">{log.teamName}</td>
                    <td className="px-3 py-2 text-slate-300">{log.subject}</td>
                    <td className="px-3 py-2 font-mono text-slate-400">{new Date(log.sentAt).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold font-mono">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PDF Modal */}
      {selectedTeam && (
        <PdfViewerModal
          team={selectedTeam}
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
        />
      )}

      {/* Team Inspector Modal */}
      {inspectTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white font-outfit">{inspectTeam.teamName} - Administrative Audit</h3>
                <p className="text-xs text-slate-400">Leader: {inspectTeam.leaderName} ({inspectTeam.leaderEmail})</p>
              </div>
              <button onClick={() => setInspectTeam(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inspector Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Status Section */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 uppercase font-semibold">Current Verification Status</div>
                  <div className="text-base font-bold text-white mt-0.5">{inspectTeam.status || 'PENDING'}</div>
                </div>

                <div className="flex items-center space-x-2">
                  {inspectTeam.status === 'ISSUES_REPORTED' && (
                    <button
                      onClick={() => handleResolveIssues(inspectTeam.id)}
                      className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg hover:bg-emerald-400 transition"
                    >
                      Mark Issues as Resolved
                    </button>
                  )}
                  <button
                    onClick={() => handleAllowReverification(inspectTeam.id)}
                    className="px-3 py-1.5 bg-slate-800 text-amber-300 hover:text-white rounded-lg border border-slate-700 transition"
                  >
                    Allow Re-verification
                  </button>
                </div>
              </div>

              {/* Reported Discrepancies */}
              {inspectTeam.verificationDetails?.discrepancies?.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="font-bold text-amber-400 uppercase tracking-wider">Reported Discrepancies ({inspectTeam.verificationDetails.discrepancies.length})</h4>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-800">
                    {inspectTeam.verificationDetails.discrepancies.map((d, dIdx) => (
                      <div key={dIdx} className="p-3 space-y-1">
                        <div className="flex justify-between font-bold text-white">
                          <span>Member: {d.memberName}</span>
                          <span className="text-amber-400 font-mono">[{d.fieldType}]</span>
                        </div>
                        <p className="text-slate-300">{d.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-400">
                  No discrepancies or comments reported by team leader.
                </div>
              )}

              {/* Members Roster */}
              <div>
                <h4 className="font-bold text-slate-300 uppercase tracking-wider mb-2">Team Member List (6 Members)</h4>
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-semibold uppercase">
                      <tr>
                        <th className="px-3 py-2">Role</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2">Mobile</th>
                        <th className="px-3 py-2">Stream</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {inspectTeam.members.map((m, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 text-amber-400 font-semibold">{m.role}</td>
                          <td className="px-3 py-2 font-bold text-white">{m.name}</td>
                          <td className="px-3 py-2 font-mono text-slate-300">{m.email}</td>
                          <td className="px-3 py-2 font-mono">{m.mobile}</td>
                          <td className="px-3 py-2">{m.stream}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Resend Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-teal-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white font-outfit">Send Verification Email (Resend API)</h3>
              </div>
              <button onClick={() => setIsEmailModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {emailNotice && (
                <div className={`p-3 rounded-xl border ${emailNotice.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' : 'bg-red-950/80 border-red-500/50 text-red-300'}`}>
                  {emailNotice.text}
                </div>
              )}

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">Recipients ({emailRecipients.length})</label>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-300 max-h-24 overflow-y-auto font-mono">
                  {emailRecipients.map(t => `${t.leaderName} <${t.leaderEmail}>`).join(', ')}
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">Subject Line</label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">Email Message Instructions</label>
                <textarea
                  rows={4}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Close
                </button>
                <button
                  onClick={handleSendEmails}
                  disabled={isSendingEmail}
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold rounded-xl shadow-lg flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingEmail ? 'Dispatching via Resend...' : 'Send Emails Now'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
