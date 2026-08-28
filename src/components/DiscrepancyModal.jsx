import React, { useState } from 'react';
import { X, AlertTriangle, MessageSquare, Send, Check } from 'lucide-react';

export default function DiscrepancyModal({ isOpen, onClose, member, memberIndex, onSubmitDiscrepancy }) {
  const [fieldType, setFieldType] = useState('Full Name');
  const [issueCategory, setIssueCategory] = useState('Spelling Error');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !member) return null;

  const fieldOptions = [
    'Full Name',
    'Email Address',
    'Mobile Number',
    'Branch / Department',
    'Academic Year',
    'College AICTE / UGC Reg Code',
    'Team Role',
    'General Letter Inconsistency'
  ];

  const categoryOptions = [
    'Spelling Error',
    'Incorrect Email Address',
    'Wrong Phone / Mobile Number',
    'Branch / Stream Mismatch',
    'Academic Year Incorrect',
    'Missing / Incomplete Information',
    'Other Discrepancy'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide a clear explanation of the correction required.');
      return;
    }

    onSubmitDiscrepancy({
      memberIndex,
      memberName: member.name,
      memberEmail: member.email,
      fieldType,
      issueCategory,
      comment: comment.trim(),
      reportedAt: new Date().toISOString()
    });

    setComment('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 px-6 py-4 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-outfit">Report Discrepancy</h3>
              <p className="text-xs text-amber-300/90">Member: {member.name} ({member.role})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-xs text-red-300 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Target Field / Information
            </label>
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
            >
              {fieldOptions.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Issue Category
            </label>
            <select
              value={issueCategory}
              onChange={(e) => setIssueCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
            >
              {categoryOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Explanation / Requested Correction <span className="text-amber-400">*</span>
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (error) setError('');
              }}
              placeholder="Explain what information is incorrect or missing, and provide the correct detail as per official college records..."
              className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Discrepancy Report</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
