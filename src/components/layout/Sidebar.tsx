import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Compass,
  LayoutDashboard,
  Briefcase,
  Target,
  Milestone,
  Settings,
  Sparkles,
  LogOut,
  ChevronRight,
  Database,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import { USE_MOCKS } from '../../services/api';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Career Recommendations', path: '/careers', icon: Briefcase },
    { label: 'Skill Gap Analysis', path: '/skills', icon: Target },
    { label: 'Learning Roadmap', path: '/roadmap', icon: Milestone },
    { label: 'Profile & Settings', path: '/profile', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 h-screen bg-surface-950 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      {/* Top Header */}
      <div>
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 p-[1px] shadow-glow-sm">
              <div className="w-full h-full bg-surface-950 rounded-[7px] flex items-center justify-center">
                <Compass className="w-4 h-4 text-brand-400" />
              </div>
            </div>
            <span className="font-bold text-base tracking-tight text-white">Pathly</span>
          </NavLink>
        </div>

        {/* Navigation Links */}
        <div className="p-4 space-y-1">
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Platform Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                    isActive
                      ? 'bg-brand-600/15 text-brand-300 border border-brand-500/25 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-surface-900'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'w-4 h-4 transition-colors',
                        isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-400" />}
                  </>
                )}
              </NavLink>
            );
          })}

          <div className="pt-4 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Assessments
          </div>
          <NavLink
            to="/onboarding"
            onClick={onCloseMobile}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/25'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-surface-900'
              )
            }
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="flex-1">Retake Assessment</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              36 Qs
            </span>
          </NavLink>
        </div>
      </div>

      {/* Bottom Section: API Status & User Profile */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        {/* Isolated API Adapter Indicator */}
        <div className="p-2.5 rounded-lg bg-surface-900 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-brand-400" />
            <span className="truncate">
              {USE_MOCKS ? 'Isolated Mock API' : 'FastAPI Connected'}
            </span>
          </div>
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              USE_MOCKS ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
            )}
            title={USE_MOCKS ? 'Using isolated mock adapter' : 'Connected to live backend'}
          />
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-surface-900/60 border border-slate-800/80">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={
                user?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'
              }
              alt={user?.fullName || 'User'}
              className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-100 truncate">
                {user?.fullName || 'Student'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.email || 'student@pathly.ai'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-surface-800 rounded transition-colors"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
