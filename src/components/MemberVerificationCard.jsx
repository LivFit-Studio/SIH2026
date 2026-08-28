import React from 'react';
import { CheckCircle2, AlertCircle, Shield, User, Mail, Phone, BookOpen, GraduationCap, Building2, MessageSquare, CheckSquare } from 'lucide-react';

export default function MemberVerificationCard({
  member,
  memberIndex,
  verificationState,
  onToggleField,
  onToggleAllMemberFields,
  onReportIssue,
  isLocked
}) {
  const fields = [
    { key: 'name', label: 'Full Name', value: member.name, icon: User },
    { key: 'role', label: 'Team Role', value: member.role, icon: Shield },
    { key: 'email', label: 'Email Address', value: member.email, icon: Mail },
    { key: 'mobile', label: 'Mobile Number', value: member.mobile, icon: Phone },
    { key: 'stream', label: 'Branch / Stream', value: member.stream, icon: BookOpen },
    { key: 'academicYear', label: 'Academic Year', value: member.academicYear || '2026 - 2027', icon: GraduationCap },
  ];

  const memberVerifications = verificationState[memberIndex] || {};
  const verifiedCount = fields.filter(f => memberVerifications[f.key]).length;
  const isFullyVerified = verifiedCount === fields.length;
  const memberDiscrepancies = (verificationState.discrepancies || []).filter(d => d.memberIndex === memberIndex);

  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
      memberDiscrepancies.length > 0
        ? 'bg-gradient-to-b from-amber-950/20 via-slate-900 to-slate-950 border-amber-500/40 shadow-lg'
        : isFullyVerified
        ? 'bg-gradient-to-b from-teal-950/20 via-slate-900 to-slate-950 border-teal-500/40 shadow-md'
        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
    }`}>
      
      {/* Member Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
            member.role.includes('Leader')
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'bg-slate-800 text-slate-300 border border-slate-700'
          }`}>
            {memberIndex + 1}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white">{member.name}</h3>
              {member.role.includes('Leader') && (
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/40 uppercase tracking-wider">
                  TEAM LEADER
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{member.email}</p>
          </div>
        </div>

        {/* Verification Status Badge & Action Controls */}
        <div className="flex items-center space-x-2">
          {memberDiscrepancies.length > 0 && (
            <span className="bg-amber-500/20 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-lg border border-amber-500/40 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{memberDiscrepancies.length} Issue Reported</span>
            </span>
          )}

          {isFullyVerified && memberDiscrepancies.length === 0 && (
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-lg border border-emerald-500/40 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All 6 Fields Verified</span>
            </span>
          )}

          {!isLocked && (
            <button
              onClick={() => onToggleAllMemberFields(memberIndex, !isFullyVerified)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center space-x-1.5 ${
                isFullyVerified
                  ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  : 'bg-teal-500/20 text-teal-300 border-teal-500/40 hover:bg-teal-500 hover:text-slate-950'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{isFullyVerified ? 'Uncheck All' : 'Verify All Member Details'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Field Level Verification Checkboxes */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {fields.map(field => {
          const isVerified = !!memberVerifications[field.key];
          const FieldIcon = field.icon;

          return (
            <div
              key={field.key}
              onClick={() => !isLocked && onToggleField(memberIndex, field.key)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                isVerified
                  ? 'bg-teal-950/30 border-teal-500/50 text-slate-200'
                  : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 text-slate-400'
              } ${isLocked ? 'cursor-not-allowed opacity-90' : ''}`}
            >
              <input
                type="checkbox"
                checked={isVerified}
                disabled={isLocked}
                onChange={() => {}} // Handled by parent div click
                className="mt-1 w-4 h-4 rounded text-amber-500 border-slate-700 focus:ring-amber-500 focus:ring-offset-slate-900 bg-slate-900 cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  <div className="flex items-center space-x-1">
                    <FieldIcon className="w-3 h-3 text-slate-400" />
                    <span>{field.label}</span>
                  </div>
                  {isVerified && <span className="text-teal-400 font-bold">✓ VERIFIED</span>}
                </div>
                <div className="text-sm font-semibold text-white truncate mt-0.5">
                  {field.value || 'N/A'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reported Discrepancies Callout & Add Remark Action */}
      <div className="px-5 py-3 bg-slate-950/70 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div>
          {memberDiscrepancies.length > 0 ? (
            <div className="space-y-1">
              {memberDiscrepancies.map((disc, dIdx) => (
                <div key={dIdx} className="text-xs text-amber-300 flex items-center space-x-2">
                  <span className="font-bold text-amber-400 font-mono">[{disc.fieldType}]</span>
                  <span>{disc.comment}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Verify details against nomination deed. Report any spelling or registration errors.</span>
            </div>
          )}
        </div>

        {!isLocked && (
          <button
            onClick={() => onReportIssue(memberIndex, member)}
            className="px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 rounded-lg border border-amber-500/30 transition flex items-center space-x-1.5 shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Report Discrepancy</span>
          </button>
        )}
      </div>

    </div>
  );
}
