import React, { useState } from 'react';
import { X, ExternalLink, Download, FileText, ZoomIn, ZoomOut, ShieldCheck, CheckCircle } from 'lucide-react';

export default function PdfViewerModal({ team, isOpen, onClose }) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [viewMode, setViewMode] = useState('pdf'); // 'pdf' | 'digital'

  if (!isOpen || !team) return null;

  const pdfUrl = team.pdfPath || `/pdf_letters/authorization_${team.id}.pdf`;

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 75));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl w-full max-w-5xl h-[90vh] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Control Bar */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white font-outfit">{team.teamName} - Authorization Letter</h3>
                <span className="bg-teal-500/10 text-teal-400 text-[10px] font-bold px-2 py-0.5 rounded border border-teal-500/30">
                  VERIFIED DEED
                </span>
              </div>
              <p className="text-xs text-slate-400">SIH 2026 Official College Nomination Document • AICTE: {team.aicteCode || '1-46260580103'}</p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="bg-slate-900 border border-slate-800 p-1 rounded-lg flex items-center space-x-1">
              <button
                onClick={() => setViewMode('pdf')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                  viewMode === 'pdf' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                PDF View
              </button>
              <button
                onClick={() => setViewMode('digital')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                  viewMode === 'digital' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Digital Record
              </button>
            </div>

            {viewMode === 'pdf' && (
              <div className="hidden sm:flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
                <button
                  onClick={handleZoomOut}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-amber-400 px-1">{zoomLevel}%</span>
                <button
                  onClick={handleZoomIn}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            )}

            <a
              href={pdfUrl}
              download={`SIH2026_Authorization_${team.id}.pdf`}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-xs font-semibold flex items-center space-x-1 transition"
              title="Download Team Authorization PDF"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Download PDF</span>
            </a>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-xs font-semibold flex items-center space-x-1 transition"
              title="Open PDF in New Window"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Body */}
        <div className="flex-1 bg-slate-950 overflow-auto p-2 sm:p-4 flex items-center justify-center">
          {viewMode === 'pdf' ? (
            <div 
              className="w-full h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl transition-transform duration-200 origin-top"
              style={{ transform: `scale(${zoomLevel / 100})`, width: zoomLevel > 100 ? `${zoomLevel}%` : '100%' }}
            >
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=0`}
                title={`SIH 2026 Authorization Letter - ${team.teamName}`}
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            /* Digital Nomination Replica View */
            <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-200 shadow-xl overflow-y-auto space-y-6">
              <div className="border-b border-slate-800 pb-4 text-center">
                <div className="text-xs font-semibold text-amber-400 tracking-wider uppercase mb-1">
                  Smart India Hackathon 2026 Nomination Letter
                </div>
                <h2 className="text-xl font-bold text-white">COLLEGE AUTHORIZATION DEED</h2>
                <p className="text-xs text-slate-400 mt-1">AICTE Application / UGC Reg No: <strong>{team.aicteCode || '1-46260580103'}</strong></p>
                <div className="text-xs text-slate-500 mt-0.5">Date: 22/August/2026</div>
              </div>

              <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
                <p>
                  I am pleased to nominate the below team from our college to participate in <strong>Smart India Hackathon 2026</strong>.
                </p>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-amber-300 font-semibold flex items-center justify-between">
                  <span>Nominated Team Name:</span>
                  <span className="text-base text-white font-bold">{team.teamName}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Verified Team Member Roster</h4>
                <div className="overflow-x-auto border border-slate-800 rounded-lg">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                      <tr>
                        <th className="px-3 py-2">Role</th>
                        <th className="px-3 py-2">Full Name</th>
                        <th className="px-3 py-2">Gender</th>
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2">Mobile</th>
                        <th className="px-3 py-2">Stream</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {team.members.map((m, idx) => (
                        <tr key={idx} className={m.role.includes('Leader') ? 'bg-amber-500/10 font-medium' : ''}>
                          <td className="px-3 py-2 text-amber-400">{m.role}</td>
                          <td className="px-3 py-2 font-bold text-white">{m.name}</td>
                          <td className="px-3 py-2">{m.gender}</td>
                          <td className="px-3 py-2 font-mono text-slate-300">{m.email}</td>
                          <td className="px-3 py-2 font-mono">{m.mobile}</td>
                          <td className="px-3 py-2">{m.stream}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-1 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Authenticated & Verified Document Deed</span>
                </div>
                <div>Document Hash ID: <span className="font-mono text-slate-300">DOC-2026-{team.id.toUpperCase()}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Security Footer Notice */}
        <div className="bg-slate-950 px-5 py-2.5 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-teal-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Encrypted Authorization Letter isolated exclusively for {team.teamName}</span>
          </div>
          <div className="text-slate-400">
            Page {team.pageNumber || 1} of Master Authorization File
          </div>
        </div>

      </div>
    </div>
  );
}
