import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MemberVerificationCard from '../components/MemberVerificationCard';
import PdfViewerModal from '../components/PdfViewerModal';
import DiscrepancyModal from '../components/DiscrepancyModal';
import confetti from 'canvas-confetti';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FileText, CheckCircle2, AlertTriangle, Send, Lock, ShieldCheck } from 'lucide-react';

export default function ParticipantDashboard() {
  const { currentUser, userTeam, updateTeamVerificationState, logout } = useAuth();

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isDiscrepancyModalOpen, setIsDiscrepancyModalOpen] = useState(false);
  const [activeMemberForReport, setActiveMemberForReport] = useState(null);
  const [activeMemberIndexForReport, setActiveMemberIndexForReport] = useState(0);
  
  const [verificationState, setVerificationState] = useState({});
  const [discrepancies, setDiscrepancies] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  useEffect(() => {
    if (userTeam) {
      if (userTeam.verificationDetails) {
        setVerificationState(userTeam.verificationDetails.memberVerifications || {});
        setDiscrepancies(userTeam.verificationDetails.discrepancies || []);
        setSubmitSuccess(userTeam.verificationDetails);
      } else {
        const initialMap = {};
        userTeam.members.forEach((_, idx) => {
          initialMap[idx] = {};
        });
        setVerificationState(initialMap);
        setDiscrepancies([]);
        setSubmitSuccess(null);
      }
    }
  }, [userTeam]);

  if (!userTeam) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-12 h-12 bg-red-500/10 text-red-400 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white font-outfit">Team Record Not Found</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your Google account (<strong className="text-amber-400">{currentUser?.email}</strong>) is not associated with any nominated team.
        </p>
        <button onClick={logout} className="px-4 py-2 bg-slate-800 text-xs text-white rounded-xl">Sign Out</button>
      </div>
    );
  }

  const isSubmitted = userTeam.status === 'VERIFIED' || userTeam.status === 'ISSUES_REPORTED';

  const handleToggleField = (memberIndex, fieldKey) => {
    if (isSubmitted) return;
    setVerificationState(prev => {
      const currentMemberState = prev[memberIndex] || {};
      return {
        ...prev,
        [memberIndex]: {
          ...currentMemberState,
          [fieldKey]: !currentMemberState[fieldKey]
        }
      };
    });
  };

  const handleToggleAllMemberFields = (memberIndex, shouldVerifyAll) => {
    if (isSubmitted) return;
    const fieldKeys = ['name', 'role', 'email', 'mobile', 'stream', 'academicYear'];
    const updatedMemberObj = {};
    fieldKeys.forEach(k => {
      updatedMemberObj[k] = shouldVerifyAll;
    });

    setVerificationState(prev => ({
      ...prev,
      [memberIndex]: updatedMemberObj
    }));
  };

  const handleVerifyAllMembers = () => {
    if (isSubmitted) return;
    const fieldKeys = ['name', 'role', 'email', 'mobile', 'stream', 'academicYear'];
    const newMap = {};
    userTeam.members.forEach((_, idx) => {
      newMap[idx] = {};
      fieldKeys.forEach(k => {
        newMap[idx][k] = true;
      });
    });
    setVerificationState(newMap);
  };

  const handleOpenDiscrepancyModal = (memberIndex, member) => {
    setActiveMemberIndexForReport(memberIndex);
    setActiveMemberForReport(member);
    setIsDiscrepancyModalOpen(true);
  };

  const handleSubmitDiscrepancy = (newDiscrepancy) => {
    setDiscrepancies(prev => [...prev, newDiscrepancy]);
  };

  const handleRemoveDiscrepancy = (indexToRemove) => {
    if (isSubmitted) return;
    setDiscrepancies(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const totalFields = userTeam.members.length * 6;
  let verifiedFieldCount = 0;
  userTeam.members.forEach((_, idx) => {
    const memberObj = verificationState[idx] || {};
    ['name', 'role', 'email', 'mobile', 'stream', 'academicYear'].forEach(k => {
      if (memberObj[k]) verifiedFieldCount++;
    });
  });

  const completionPercentage = Math.round((verifiedFieldCount / totalFields) * 100);

  const handleFinalSubmission = async () => {
    setIsSubmitting(true);
    const finalStatus = discrepancies.length > 0 ? 'ISSUES_REPORTED' : 'VERIFIED';
    const payload = {
      teamId: userTeam.id,
      teamName: userTeam.teamName,
      leaderEmail: userTeam.leaderEmail,
      submittedBy: currentUser.email,
      submittedAt: new Date().toISOString(),
      status: finalStatus,
      completionPercentage,
      verifiedFieldCount,
      totalFields,
      memberVerifications: verificationState,
      discrepancyCount: discrepancies.length,
      discrepancies: discrepancies
    };

    try {
      const verificationRef = doc(db, 'verifications', userTeam.id);
      await setDoc(verificationRef, payload);

      const teamRef = doc(db, 'teams', userTeam.id);
      await updateDoc(teamRef, {
        status: finalStatus,
        verificationDetails: payload
      }).catch(err => console.warn('Team doc update notice:', err.message));

      updateTeamVerificationState(userTeam.id, payload);
      setSubmitSuccess(payload);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Submission Error:', err);
      updateTeamVerificationState(userTeam.id, payload);
      setSubmitSuccess(payload);
    } finally {
      setIsSubmitting(false);
      setIsConfirmModalOpen(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-500/20">
              NOMINATED TEAM
            </span>

            {isSubmitted ? (
              userTeam.status === 'VERIFIED' ? (
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>VERIFICATION SUBMITTED</span>
                </span>
              ) : (
                <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>ISSUES REPORTED</span>
                </span>
              )
            ) : (
              <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-500/40">
                PENDING VERIFICATION
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white font-outfit">
            {userTeam.teamName}
          </h1>

          <div className="text-xs text-slate-400">
            Leader: <strong className="text-slate-200">{userTeam.leaderName}</strong> ({userTeam.leaderEmail}) • AICTE Reg: <strong className="text-amber-400 font-mono">{userTeam.aicteCode}</strong>
          </div>
        </div>

        {/* View PDF Button */}
        <div>
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg transition flex items-center justify-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>View Authorization Letter PDF</span>
          </button>
        </div>
      </div>

      {/* Submission Status Summary if locked */}
      {isSubmitted && submitSuccess && (
        <div className="bg-slate-900 border border-teal-500/40 rounded-xl p-4 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Verification deed submitted on {new Date(submitSuccess.submittedAt).toLocaleString()}</span>
              <div className="text-slate-400 mt-0.5">Status: {submitSuccess.status} • {verifiedFieldCount} of {totalFields} fields verified</div>
            </div>
          </div>
          <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-amber-400 font-mono">LOCKED</span>
        </div>
      )}

      {/* Roster & Checklist Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white font-outfit">Team Member Verification Roster (6 Members)</h2>
            <p className="text-xs text-slate-400">Inspect each member's details and check off verified items or report any corrections required.</p>
          </div>

          {!isSubmitted && (
            <button
              onClick={handleVerifyAllMembers}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold rounded-xl border border-slate-700 transition"
            >
              Verify All Members
            </button>
          )}
        </div>

        <div className="space-y-4">
          {userTeam.members.map((member, idx) => (
            <MemberVerificationCard
              key={idx}
              member={member}
              memberIndex={idx}
              verificationState={verificationState}
              onToggleField={handleToggleField}
              onToggleAllMemberFields={handleToggleAllMemberFields}
              onReportIssue={handleOpenDiscrepancyModal}
              isLocked={isSubmitted}
            />
          ))}
        </div>
      </div>

      {/* Reported Discrepancies Summary */}
      {discrepancies.length > 0 && (
        <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-bold text-amber-400">
            <div className="flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Reported Discrepancies ({discrepancies.length})</span>
            </div>
          </div>
          <div className="divide-y divide-slate-800">
            {discrepancies.map((disc, idx) => (
              <div key={idx} className="py-2 flex items-start justify-between text-xs">
                <div>
                  <span className="font-bold text-white">{disc.memberName}: </span>
                  <span className="text-amber-300">[{disc.fieldType}] </span>
                  <span className="text-slate-300">{disc.comment}</span>
                </div>
                {!isSubmitted && (
                  <button onClick={() => handleRemoveDiscrepancy(idx)} className="text-red-400 hover:underline">Remove</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Verification Bar */}
      {!isSubmitted && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="text-xs text-slate-300">
            Progress: <strong className="text-amber-400 font-bold">{completionPercentage}% Verified</strong> ({verifiedFieldCount}/{totalFields} fields)
          </div>
          <button
            onClick={() => setIsConfirmModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Submit Verification</span>
          </button>
        </div>
      )}

      {/* PDF Modal */}
      <PdfViewerModal
        team={userTeam}
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />

      {/* Discrepancy Modal */}
      <DiscrepancyModal
        isOpen={isDiscrepancyModalOpen}
        onClose={() => setIsDiscrepancyModalOpen(false)}
        member={activeMemberForReport}
        memberIndex={activeMemberIndexForReport}
        onSubmitDiscrepancy={handleSubmitDiscrepancy}
      />

      {/* Confirm Submission Dialog */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 space-y-4 text-center">
            <h3 className="text-lg font-bold text-white font-outfit">Confirm Verification Submission</h3>
            <p className="text-xs text-slate-300">
              Submit verification deed for <strong>{userTeam.teamName}</strong>? This action will record your submission in Firestore.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <button onClick={() => setIsConfirmModalOpen(false)} className="w-1/2 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl">Cancel</button>
              <button onClick={handleFinalSubmission} disabled={isSubmitting} className="w-1/2 py-2 bg-emerald-500 text-slate-950 text-xs font-extrabold rounded-xl">
                {isSubmitting ? 'Submitting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
