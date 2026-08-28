import React from 'react';
import { Shield, ExternalLink, Lock, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-900">
          
          {/* Column 1: Info & Governance */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-white tracking-wide">Smart India Hackathon 2026</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Official Authorization Letter & Team Member Consent Verification Portal. AICTE Application / UGC Registration College Code: <strong className="text-slate-300">1-46260580103</strong>.
            </p>
          </div>

          {/* Column 2: Security Isolation Guarantee */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              <span>Data Protection & Privacy</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict role-based document access is enforced at the database level. Each authenticated team leader can only access their specific nomination record and team letter.
            </p>
          </div>

          {/* Column 3: Platform Management & NetSyc Branding */}
          <div className="md:text-right flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Technical Administration</h4>
              <p className="text-xs text-slate-400">SIH 2026 Steering Committee Verification Engine</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="inline-flex items-center space-x-1 text-xs text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>SSL Encrypted & Firebase Secured</span>
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Bar with Mandatory NetSyc Attribution Link */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 Smart India Hackathon. All rights reserved.</p>
          
          {/* Mandatory NetSyc Hyperlink Requirement */}
          <div className="mt-3 sm:mt-0 font-medium text-slate-300 flex items-center space-x-1.5 bg-slate-900 px-3.5 py-1.5 rounded-lg border border-slate-800 shadow-sm">
            <span>This portal is developed and managed by</span>
            <a
              href="https://netsyc.com/?utm_source=chatgpt.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 font-bold transition flex items-center space-x-1 hover:underline"
            >
              <span>NetSyc Technologies Pvt. Ltd.</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
