import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, Map, Bell, Users, TriangleAlert } from 'lucide-react';
import { useAlertStore } from '@/stores/alertStore';
import { hardwareService } from '@/services/hardwareService';
import { cn } from '@/lib/utils';

interface AndroidBottomNavProps {
  onOpenSOS: () => void;
}

export default function AndroidBottomNav({ onOpenSOS }: AndroidBottomNavProps) {
  const unreadAlerts = useAlertStore((s) => s.unreadCount);
  const location = useLocation();

  const handleNavClick = () => {
    hardwareService.vibrate(25);
  };

  const handleSOSClick = () => {
    hardwareService.vibrate([100, 50, 100]);
    onOpenSOS();
  };

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/incidents', label: 'Incidents', icon: AlertTriangle },
    { to: '/map', label: 'Map', icon: Map },
    { to: '/alerts', label: 'Alerts', icon: Bell, badge: unreadAlerts },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-navy-950/95 backdrop-blur-md border-t border-slate-800 text-white lg:hidden pb-safe">
      <div className="flex items-center justify-around h-16 px-2 relative">
        {/* First 2 items */}
        {navItems.slice(0, 2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={handleNavClick}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors relative',
                isActive ? 'text-primary-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              )
            }
          >
            <item.icon className="w-5 h-5 mb-0.5" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* Center Floating SOS Action Button */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={handleSOSClick}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-red-600 to-emergency text-white flex flex-col items-center justify-center shadow-lg shadow-red-600/40 active:scale-95 transition-transform border-4 border-slate-900 focus:outline-none"
            title="Emergency SOS Beacon"
          >
            <TriangleAlert className="w-6 h-6 animate-pulse" />
            <span className="text-[9px] font-bold tracking-wider leading-none mt-0.5">SOS</span>
          </button>
        </div>

        {/* Last 2 items */}
        {navItems.slice(2, 4).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={handleNavClick}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors relative',
                isActive ? 'text-primary-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              )
            }
          >
            <div className="relative">
              <item.icon className="w-5 h-5 mb-0.5" />
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-1 -right-2 bg-emergency text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-slate-900">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              ) : null}
            </div>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
