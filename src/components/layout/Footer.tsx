import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, Code2, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-surface-950/60 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white">Pathly</span>
            </Link>
            <p className="text-slate-400 leading-relaxed text-xs">
              AI-powered career intelligence and personalized skill bridge engine built for modern tech students.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
              Backend: FastAPI + PostgreSQL Ready
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold text-slate-200 text-xs tracking-wider uppercase mb-3">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/onboarding" className="hover:text-slate-200 transition-colors">
                  RIASEC Assessment (36 Qs)
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-slate-200 transition-colors">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-slate-200 transition-colors">
                  Career Recommendations
                </Link>
              </li>
              <li>
                <Link to="/skills" className="hover:text-slate-200 transition-colors">
                  Skill Gap Radar
                </Link>
              </li>
              <li>
                <Link to="/roadmap" className="hover:text-slate-200 transition-colors">
                  Personalized Roadmap
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture & Integration */}
          <div>
            <h4 className="font-semibold text-slate-200 text-xs tracking-wider uppercase mb-3">Architecture</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-brand-400" />
                <span>REST API Service Layer</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>TypeScript Interfaces</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>TanStack Query Cache</span>
              </li>
              <li>
                <span className="text-slate-500">Isolated Mock Adapters</span>
              </li>
            </ul>
          </div>

          {/* Career Tracks */}
          <div>
            <h4 className="font-semibold text-slate-200 text-xs tracking-wider uppercase mb-3">Target Roles</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/careers/car-ml-eng" className="hover:text-slate-200 transition-colors">
                  Machine Learning Engineer
                </Link>
              </li>
              <li>
                <Link to="/careers/car-fullstack-saas" className="hover:text-slate-200 transition-colors">
                  Full-Stack SaaS Engineer
                </Link>
              </li>
              <li>
                <Link to="/careers/car-cloud-architect" className="hover:text-slate-200 transition-colors">
                  Cloud Solutions Architect
                </Link>
              </li>
              <li>
                <Link to="/careers/car-ai-pm" className="hover:text-slate-200 transition-colors">
                  AI Product Manager
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>© {new Date().getFullYear()} Pathly Technologies, Inc. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <span>Built with React + Vite + Tailwind + TanStack Query</span>
            <span className="text-slate-600">|</span>
            <span className="text-brand-400">REST Contract v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
