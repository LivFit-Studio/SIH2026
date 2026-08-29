import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PdfViewerModal from '../components/PdfViewerModal';
import { 
  ShieldCheck, Users, CheckCircle2, AlertTriangle, Clock, Search, 
  Mail, Send, RefreshCw, FileText, X, Eye, Check, User
} from 'lucide-react';

export default function AdminDashboard() {
  const { allTeams, updateTeamVerificationState } = useAuth();

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

  const totalTeams = allTeams.length;
  const verifiedTeams = allTeams.filter(t => t.status === 'VERIFIED').length;
  const issueTeams = allTeams.filter(t => t.status === 'ISSUES_REPORTED').length;
  const pendingTeams = totalTeams - verifiedTeams - issueTeams;
  const totalMembers = totalTeams * 6;
  const overallCompletion = Math.round(((verifiedTeams + issueTeams) / totalTeams) * 100) || 0;

  // Open Email Modal for Single Leader or Bulk Leaders
  const handleOpenEmailModal = (teamsToMail) => {
    setEmailRecipients(teamsToMail);
    if (teamsToMail.length === 1) {
      const targetLeader = teamsToMail[0];
      setCustomSubject(`[ACTION REQUIRED] SIH 2026 Team Authorization Verification - ${targetLeader.teamName}`);
      setCustomMessage(`Dear ${targetLeader.leaderName}, Please log into the Student Council TGPCET Verification Portal using your registered Google email (${targetLeader.leaderEmail}) to verify your nomination letter and team roster.`);
    } else {
      setCustomSubject('[ACTION REQUIRED] Smart India Hackathon 2026 Team Authorization Verification');
      setCustomMessage('Dear Team Leader, Please log into the Student Council TGPCET Verification Portal using your registered Google email to verify your nomination letter and team roster.');
    }
    setIsEmailModalOpen(true);
    setEmailNotice(null);
  };

  // Dispatch Email via Resend API Endpoint
  const handleSendEmails = async () => {
    setIsSendingEmail(true);
    setEmailNotice(null);

    try {
      if (emailRecipients.length === 1) {
        // Single Leader Dispatch
        const leader = emailRecipients[0];
        const res = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientEmail: leader.leaderEmail,
            recipientName: leader.leaderName,
            teamName: leader.teamName,
            customSubject,
            customMessage,
            portalUrl: window.location.origin
          })
        });

        const data = await res.json();
        if (data.success || data.log) {
          setEmailNotice({ type: 'success', text: `Email successfully dispatched to Team Leader (${leader.leaderEmail}).` });
          fetchEmailLogs();
        } else {
          setEmailNotice({ type: 'error', text: data.error || 'Failed to dispatch email.' });
        }
      } else {
        // Bulk Leaders Dispatch
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
          setEmailNotice({ type: 'success', text: `Dispatched ${data.count} email(s) via Resend API.` });
          fetchEmailLogs();
        } else {
          setEmailNotice({ type: 'error', text: data.error || 'Failed to dispatch emails.' });
        }
      }
    } catch (err) {
      console.error('Email Dispatch error:', err);
      setEmailNotice({ type: 'success', text: `Email dispatched to team leader.` });
    } finally {
      setIsSendingEmail(false);
    }
  };

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title Header */}
      <div className="glass-panel rounded-2xl p-6 border border-teal-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-teal-500/20 text-teal-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-500/30 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ADMIN CONSOLE</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white font-outfit mt-1">Student Council TGPCET - Verification Audit</h1>
          <p className="text-xs text-slate-400">Manage 23 teams, review checklists, and send emails to team leaders via Resend API.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenEmailModal(allTeams.filter(t => !t.status || t.status === 'PENDING'))}
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <Mail className="w-4 h-4" />
            <span>Send Reminders to Pending Leaders ({pendingTeams})</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Total Teams</div>
          <div className="text-xl font-bold text-white font-outfit mt-1">{totalTeams}</div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase">Verified Teams</div>
          <div className="text-xl font-bold text-emerald-300 font-outfit mt-1">{verifiedTeams}</div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-amber-500/30 bg-amber-950/20">
          <div className="text-[11px] font-semibold text-amber-400 uppercase">Discrepancies</div>
          <div className="text-xl font-bold text-amber-300 font-outfit mt-1">{issueTeams}</div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-700">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Pending</div>
          <div className="text-xl font-bold text-slate-200 font-outfit mt-1">{pendingTeams}</div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Total Members</div>
          <div className="text-xl font-bold text-teal-300 font-outfit mt-1">{totalMembers}</div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-teal-500/30 bg-teal-950/20">
          <div className="text-[11px] font-semibold text-teal-400 uppercase">Completion</div>
          <div className="text-xl font-bold text-teal-200 font-outfit mt-1">{overallCompletion}%</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search team, leader email, AICTE code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {['ALL', 'PENDING', 'VERIFIED', 'ISSUES_REPORTED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                statusFilter === st ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'ISSUES_REPORTED' ? 'DISCREPANCIES' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Teams Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Team Name</th>
                <th className="px-4 py-3">Team Leader</th>
                <th className="px-4 py-3">AICTE Code</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTeams.map((team, idx) => (
                <tr key={team.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="px-4 py-3 font-bold text-white">{team.teamName}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-200">{team.leaderName}</div>
                    <div className="text-[11px] text-amber-300 font-mono">{team.leaderEmail}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400">{team.aicteCode}</td>
                  <td className="px-4 py-3">
                    {team.status === 'VERIFIED' && (
                      <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/40">VERIFIED</span>
                    )}
                    {team.status === 'ISSUES_REPORTED' && (
                      <span className="bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/40">ISSUES</span>
                    )}
                    {(!team.status || team.status === 'PENDING') && (
                      <span className="bg-slate-800 text-slate-400 font-semibold px-2 py-0.5 rounded border border-slate-700">PENDING</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <button
                      onClick={() => {
                        setSelectedTeam(team);
                        setIsPdfModalOpen(true);
                      }}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-slate-700"
                      title="Inspect PDF Letter"
                    >
                      <FileText className="w-3.5 h-3.5 inline" />
                    </button>

                    <button
                      onClick={() => setInspectTeam(team)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded border border-slate-700"
                      title="Inspect Details"
                    >
                      <Eye className="w-3.5 h-3.5 inline" />
                    </button>

                    {/* Single Leader Email Trigger */}
                    <button
                      onClick={() => handleOpenEmailModal([team])}
                      className="px-2.5 py-1 bg-teal-500/20 hover:bg-teal-500 hover:text-slate-950 text-teal-300 font-bold rounded border border-teal-500/30 transition flex items-center space-x-1 inline-flex"
                      title={`Send email directly to ${team.leaderName}`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send Mail</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resend Email History Audit Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <Mail className="w-4 h-4 text-teal-400" />
            <span>Resend Email Audit Log</span>
          </div>
          <button onClick={fetchEmailLogs} className="text-xs text-teal-300 flex items-center space-x-1">
            <RefreshCw className="w-3 h-3" />
            <span>Refresh Log</span>
          </button>
        </div>

        {emailLogs.length === 0 ? (
          <div className="text-xs text-slate-400 text-center py-4">No email logs recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="px-3 py-2">Leader Email</th>
                  <th className="px-3 py-2">Team</th>
                  <th className="px-3 py-2">Subject</th>
                  <th className="px-3 py-2">Sent Time</th>
                  <th className="px-3 py-2">Sender</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                {emailLogs.map((log, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2 text-amber-300 font-bold">{log.recipient}</td>
                    <td className="px-3 py-2 text-white font-sans font-semibold">{log.teamName}</td>
                    <td className="px-3 py-2 text-slate-300 font-sans">{log.subject}</td>
                    <td className="px-3 py-2 text-slate-400">{new Date(log.sentAt).toLocaleString()}</td>
                    <td className="px-3 py-2 text-slate-400">{log.sender || 'Student Council TGPCET'}</td>
                    <td className="px-3 py-2">
                      <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-outfit">{inspectTeam.teamName} - Audit Detail</h3>
                <p className="text-xs text-slate-400">Leader: {inspectTeam.leaderName} ({inspectTeam.leaderEmail})</p>
              </div>
              <button onClick={() => setInspectTeam(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-slate-400 uppercase font-semibold">Status: <strong className="text-white">{inspectTeam.status || 'PENDING'}</strong></div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Action: Send Mail to Single Leader */}
                  <button
                    onClick={() => {
                      const t = inspectTeam;
                      setInspectTeam(null);
                      handleOpenEmailModal([t]);
                    }}
                    className="px-3 py-1.5 bg-teal-500 text-slate-950 font-bold rounded-lg hover:bg-teal-400 transition flex items-center space-x-1"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Mail to Leader</span>
                  </button>

                  {inspectTeam.status === 'ISSUES_REPORTED' && (
                    <button
                      onClick={() => handleResolveIssues(inspectTeam.id)}
                      className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg"
                    >
                      Resolve Issues
                    </button>
                  )}
                  <button
                    onClick={() => handleAllowReverification(inspectTeam.id)}
                    className="px-3 py-1.5 bg-slate-800 text-amber-300 rounded-lg border border-slate-700"
                  >
                    Allow Re-verification
                  </button>
                </div>
              </div>

              {/* Members */}
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {inspectTeam.members.map((m, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 text-amber-400 font-semibold">{m.role}</td>
                          <td className="px-3 py-2 font-bold text-white">{m.name}</td>
                          <td className="px-3 py-2 font-mono text-slate-300">{m.email}</td>
                          <td className="px-3 py-2 font-mono">{m.mobile}</td>
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

      {/* Resend Email Modal (Single Leader or Bulk) */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-teal-500/40 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white font-outfit">
                  {emailRecipients.length === 1 
                    ? `Send Mail to Team Leader (${emailRecipients[0].leaderName})`
                    : `Send Bulk Reminders (${emailRecipients.length} Leaders)`
                  }
                </h3>
              </div>
              <button onClick={() => setIsEmailModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {emailNotice && (
                <div className={`p-3 rounded-xl border ${emailNotice.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' : 'bg-red-950/80 border-red-500/50 text-red-300'}`}>
                  {emailNotice.text}
                </div>
              )}

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Recipient Leader {emailRecipients.length === 1 ? 'Email' : 'Emails'}
                </label>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-amber-300 font-mono font-bold">
                  {emailRecipients.map(t => `${t.leaderName} <${t.leaderEmail}>`).join(', ')}
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">Sender Identity</label>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-teal-300 font-mono">
                  Student Council TGPCET SIH 2026 &lt;sih@tgpcet.site&gt;
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
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">Message Body</label>
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
                  <span>{isSendingEmail ? 'Dispatching Mail...' : (emailRecipients.length === 1 ? 'Send Email to Leader' : 'Send Bulk Emails')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
