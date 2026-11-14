import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Compass, Sparkles, CheckCircle2 } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface-950 text-slate-100">
      {/* Left Column: Value Proposition & Brand Aesthetics */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-surface-950 via-surface-900 to-brand-950/40 border-r border-slate-800 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-cyan-400 p-[1px] shadow-glow-sm">
              <div className="w-full h-full bg-surface-950 rounded-[11px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-brand-400" />
              </div>
            </div>
            <span className="font-bold text-lg tracking-tight text-white">Pathly</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            AI Career Recommendation Engine
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Stop guessing your tech career. Build your data-backed roadmap.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Pathly integrates psychological RIASEC assessment with live market skill gaps to chart
            your optimal trajectory from student to senior engineer.
          </p>

          <div className="space-y-3 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>36-Question Holland RIASEC vocational interest assessment</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dynamic skill gap analysis with score improvement simulator</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Weekly learning schedule tailored to your exact study hours</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          Independent frontend architecture ready for FastAPI & PostgreSQL backend.
        </div>
      </div>

      {/* Right Column: Form Outlet */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
