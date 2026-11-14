import React from 'react';
import { Menu, Compass } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { USE_MOCKS } from '../../services/api';

interface AppNavbarProps {
  onOpenMobileSidebar: () => void;
  pageTitle?: string;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({ onOpenMobileSidebar, pageTitle }) => {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800 bg-surface-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-surface-800"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 lg:hidden">
          <Compass className="w-5 h-5 text-brand-400" />
          <span className="font-bold text-sm text-white">Pathly</span>
        </div>

        {pageTitle && (
          <h1 className="hidden sm:block text-sm font-semibold text-slate-200">
            {pageTitle}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {USE_MOCKS ? (
          <Badge variant="warning" dot className="text-[11px]">
            Mock Adapter Active
          </Badge>
        ) : (
          <Badge variant="success" dot className="text-[11px]">
            FastAPI Live
          </Badge>
        )}
      </div>
    </header>
  );
};
