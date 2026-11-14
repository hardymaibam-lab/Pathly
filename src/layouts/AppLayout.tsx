import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { AppNavbar } from '../components/layout/AppNavbar';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400">Loading student workspace...</p>
      </div>
    );
  }

  // Redirect unauthenticated visitors to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/dashboard')) return 'Student Career Dashboard';
    if (pathname.startsWith('/careers/')) return 'Career Path Deep Dive';
    if (pathname.startsWith('/careers')) return 'Career Recommendations';
    if (pathname.startsWith('/skills')) return 'Skill Gap Radar & Analysis';
    if (pathname.startsWith('/roadmap')) return 'Personalized Learning Roadmap';
    if (pathname.startsWith('/profile')) return 'Profile & Platform Settings';
    return 'Pathly SaaS';
  };

  return (
    <div className="min-h-screen flex bg-surface-950 text-slate-100">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 h-full bg-surface-950 shadow-2xl">
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AppNavbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          pageTitle={getPageTitle(location.pathname)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
