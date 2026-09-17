import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, Map, Users, MessageSquare, Package, Heart, FileText, BarChart3, Bell, Settings, User, Radio, TriangleAlert, Menu, Zap } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { useSosStore } from '@/stores/sosStore';
import { useMeshStore } from '@/stores/meshStore';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const adminNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { to: '/map', label: 'Map View', icon: Map },
  { to: '/teams', label: 'Teams', icon: Users },
  { to: '/communication', label: 'Communication', icon: MessageSquare },
  { to: '/resources', label: 'Resources', icon: Package },
  { to: '/medical', label: 'Medical Support', icon: Heart },
  { to: '/reports', label: 'Reports & Logs', icon: FileText },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/simulation', label: 'Simulation & AI', icon: Zap },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/profile', label: 'Profile', icon: User },
];

const responderNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { to: '/map', label: 'Map View', icon: Map },
  { to: '/teams', label: 'Team', icon: Users },
  { to: '/resources', label: 'Resources', icon: Package },
  { to: '/medical', label: 'Medical Support', icon: Heart },
  { to: '/reports', label: 'Reports & Logs', icon: FileText },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/simulation', label: 'Simulation & AI', icon: Zap },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const openSosModal = useUiStore((s) => s.openSosModal);

  const nav = currentUser?.role === 'responder' ? responderNav : adminNav;

  const handleOpenSOS = () => {
    openSosModal();
  };

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {!collapsed && (
        <div 
          onClick={toggleSidebar} 
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
        />
      )}

      <aside className={cn(
        'fixed left-0 top-0 h-screen bg-white border-r border-border flex flex-col z-40 transition-all duration-300 ease-in-out',
        // Desktop width
        collapsed ? 'lg:w-[72px]' : 'lg:w-[260px]',
        // Mobile width & translation
        collapsed ? '-translate-x-full lg:translate-x-0 w-[260px]' : 'translate-x-0 w-[260px] shadow-2xl lg:shadow-none'
      )}>
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-border flex-shrink-0">
          <button onClick={toggleSidebar} className="lg:hidden">
            <Menu className="w-5 h-5 text-text-secondary" />
          </button>
          <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center flex-shrink-0">
            <Radio className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-navy leading-tight">ResQMesh</h1>
              <p className="text-[10px] text-text-secondary leading-none">Emergency SOS</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors relative',
                isActive
                  ? 'bg-primary-50 text-primary'
                  : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />}
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* SOS Card */}
        {!collapsed && (
          <div className="mx-3 mb-3 bg-gradient-to-br from-emergency to-red-700 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <TriangleAlert className="w-5 h-5" />
              <span className="font-bold text-sm">SOS Emergency</span>
            </div>
            <p className="text-xs text-red-100 mb-3">Help is one tap away</p>
            <button
              onClick={handleOpenSOS}
              className="w-full bg-white text-emergency font-semibold text-sm py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              Send SOS
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
